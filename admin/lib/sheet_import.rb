require "csv"
require "net/http"

# Reprend les données de l'ancienne Google Sheet « M&V / Abonnements ».
# Idempotent : relancer l'import met à jour les lignes déjà importées au lieu de les dupliquer.
# Aucune donnée n'est versionnée : elles sont lues à l'exécution (le repo est public).
class SheetImport
  class GoogleSheet
    def initialize(id) = @id = id

    def rows(tab)
      uri = URI("https://docs.google.com/spreadsheets/d/#{@id}/gviz/tq")
      uri.query = URI.encode_www_form(tqx: "out:csv", sheet: tab)
      response = Net::HTTP.get_response(uri)
      raise "Onglet « #{tab} » illisible (#{response.code}) : la Sheet est-elle partagée par lien ?" unless response.is_a?(Net::HTTPSuccess)
      CSV.parse(response.body.force_encoding("UTF-8"))
    end
  end

  class CsvDirectory
    def initialize(dir) = @dir = Pathname(dir)

    def rows(tab)
      path = @dir.join("#{tab}.csv")
      path.exist? ? CSV.read(path, encoding: "bom|utf-8") : []
    end
  end

  UNASSIGNED_CLIENT = "À attribuer"

  REVENUE_SECTIONS = {
    "Applications" => :application, "Sites web" => :site, "Mises à jour" => :mise_a_jour,
    "Prestations" => :prestation, "Hébergements et maintenance" => :hosting,
    "Noms de domaine" => :domain, "Produits" => :skip
  }.freeze

  COST_SECTIONS = { "Super" => "hebergement", "Heroku" => "hebergement", "Linode" => "serveurs", "Tokens" => "ia" }.freeze
  AI_TOOLS = %w[anthropic chatgpt cursor midjourney magnific].freeze

  TIME_STATUSES = { "non facturé" => "a_facturer", "facturé" => "facture" }.freeze

  def initialize(source, year:)
    @source, @year = source, year
    @counts = Hash.new { |hash, key| hash[key] = Hash.new(0) }
    @warnings = []
  end

  def run
    ActiveRecord::Base.transaction do
      import_rebilling
      import_time_entries
      import_fixed_costs
      import_domains
      import_revenue
    end
    report
  end

  private
    attr_reader :year

    def report
      lines = [ "Import terminé :" ] + @counts.sort.map { |what, count| "  #{what} : #{count[:added]} ajout(s), #{count[:updated]} mise(s) à jour" }
      lines += [ "", "À vérifier :" ] + @warnings.map { "  - #{_1}" } if @warnings.any?
      lines.join("\n")
    end

    def count(record, label)
      @counts[label][record.previously_new_record? ? :added : :updated] += 1
    end

    # Prestations : Date | Client | Statut | Tâche | Heures | KM | Lieu
    def import_time_entries
      rows("Prestations").drop(1).each do |date, client_name, status, task, hours, km, location|
        next if date.blank? || client_name.blank? || amount(hours).zero?
        client = find_or_create_client(client_name)
        entry = client.time_entries.find_or_initialize_by(performed_on: parse_date(date), description: task.presence, hours: amount(hours))
        entry.km = km.presence&.to_i
        entry.location = location.presence
        if status.to_s.downcase.start_with?("pack")
          entry.pack = pack_for(client, status)
        else
          entry.status = TIME_STATUSES.fetch(status.to_s.strip.downcase, "a_facturer")
        end
        entry.save!
        count(entry, "Prestations")
      end
    end

    def pack_for(client, label)
      client.packs.find_or_create_by!(label: label.strip) do |pack|
        pack.hours = label[/\d+/].to_d
        @warnings << "#{client} : pack « #{label.strip} » créé sans taux ni date d'achat."
      end
    end

    # Outils M&V : Nom | Coût mensuel | Prévisionnel | – | Notes | Lien
    def import_fixed_costs
      category = nil
      rows("Outils M&V").drop(1).each do |name, monthly, forecast, _, notes, link|
        break if name.to_s.start_with?("Total")
        next if name.blank?
        if monthly.blank? && forecast.blank? && notes.blank?
          category = COST_SECTIONS.fetch(name.strip, category)
          next
        end
        label = category == "ia" && name.strip == "Anthropic" && monthly.blank? ? "Anthropic (tokens)" : name.strip
        cost = FixedCost.find_or_initialize_by(name: label)
        cost.assign_attributes(
          category: cost_category(label, category), amount: amount(monthly), period: "mensuel",
          forecast_amount: forecast.to_s.strip.in?([ "", "-" ]) ? 0 : amount(forecast),
          action: notes.presence, billing_url: link.presence
        )
        cost.save!
        count(cost, "Frais fixes")
      end
    end

    def cost_category(name, section)
      return section if section
      return "ia" if AI_TOOLS.include?(name.downcase)
      return "telecom" if name.match?(/mobile|yoin|proximus/i)
      "outils"
    end

    # Noms de domaine : Domaine | Facturé ? | Registrar | Coût | – | Action | Notes
    def import_domains
      rows("Noms de domaine").drop(1).each do |domain, _, registrar, cost, _, action, notes|
        next if domain.blank?
        contract = domain_contract(domain.strip)
        contract.assign_attributes(registrar: registrar.presence, cost: amount(cost).nonzero? || contract.cost,
                                   notes: [ action, notes ].compact_blank.join(" · ").presence)
        contract.save!
        count(contract, "Noms de domaine")
      end
    end

    def domain_contract(domain)
      Contract.nom_de_domaine.find_by(label: domain) ||
        Contract.new(kind: "nom_de_domaine", label: domain, period: "annuel", client: unassigned_client)
    end

    # Revenus : Libellé | Facturé | Coûts | Marge % | Marge € | Statut | Notes, en sections
    def import_revenue
      section = nil
      rows("Revenus").drop(1).each do |label, invoiced, cost, _, _, status, notes|
        break if label.to_s.start_with?("Total")
        next if label.blank?
        if REVENUE_SECTIONS.key?(label.strip)
          section = REVENUE_SECTIONS[label.strip]
          next
        end
        case section
        when :hosting then import_hosting(label.strip, invoiced, cost, status, notes)
        when :domain then import_domain_revenue(label.strip, invoiced, status, notes)
        when :skip, nil then next
        else import_project(section, label.strip, invoiced, status, notes)
        end
      end
    end

    def import_project(kind, label, invoiced, status, notes)
      client = find_or_create_client(client_name_from(label))
      project = client.projects.find_or_initialize_by(name: label)
      project.assign_attributes(kind:, billing_mode: kind == :prestation ? "regie" : "forfait",
                                fixed_price: amount(invoiced).nonzero?, status: project_status(status),
                                notes: [ status, notes ].compact_blank.join(" · ").presence)
      project.save!
      count(project, "Projets")
      record_invoice(client, project, label, invoiced, status, notes)
    end

    def import_hosting(label, invoiced, cost, status, notes)
      client = find_or_create_client(client_name_from(label))
      label = "Hébergement #{label}" if normalize(label) == normalize(client.name)
      contract = client.contracts.find_or_initialize_by(label:)
      contract.assign_attributes(kind: "hebergement", period: "annuel", amount: amount(invoiced), cost: amount(cost).nonzero?,
                                 next_billing_on: next_billing_from(notes) || contract.next_billing_on,
                                 notes: [ status, notes ].compact_blank.join(" · ").presence)
      contract.save!
      count(contract, "Contrats d'hébergement")
      record_invoice(client, nil, label, invoiced, status, notes)
    end

    def import_domain_revenue(domain, invoiced, status, notes)
      contract = domain_contract(domain.split("/").first)
      contract.assign_attributes(amount: amount(invoiced), next_billing_on: next_billing_from(notes) || contract.next_billing_on,
                                 notes: [ contract.notes, status, notes ].compact_blank.uniq.join(" · ").presence)
      contract.save!
      count(contract, "Noms de domaine")
    end

    # Refacturations : Libellé | Facturé/mois | Facturé/an | Total | Notes, une section par client
    def import_rebilling
      client = nil
      rows("Refacturations").drop(1).each do |label, monthly, yearly, _, notes|
        next if label.blank?
        next client = nil if label.start_with?("Total")
        if monthly.blank? && yearly.blank? && notes.blank? && client.nil?
          client = find_or_create_client(label.strip)
          next
        end
        next unless client
        contract = client.contracts.find_or_initialize_by(label: label.strip, kind: "refacturation")
        period = monthly.present? ? "mensuel" : "annuel"
        contract.assign_attributes(period:, amount: amount(period == "mensuel" ? monthly : yearly), notes: notes.presence)
        contract.save!
        count(contract, "Refacturations")
      end
    end

    # Une facture n'est créée que si la Sheet dit clairement qu'elle est émise.
    def record_invoice(client, project, label, invoiced, status, notes)
      value = amount(invoiced)
      text = status.to_s.downcase
      if value.nonzero? && text.blank?
        @warnings << "« #{label} » : #{value.to_s("F")} € sans statut, aucune facture créée."
      end
      return if value.zero? || !text.match?(/factur|pay|termin/) || text.match?(/[aà] facturer/)
      invoice = client.invoices.find_or_initialize_by(label: "#{label} (import)")
      paid = "#{text} #{notes}".downcase.include?("pay")
      invoice.assign_attributes(project:, amount: value, issued_on: invoice.issued_on || Date.new(year),
                                paid_on: (invoice.paid_on || Date.new(year) if paid),
                                notes: "Importée de la Google Sheet : date et n° OkiOki à préciser.")
      invoice.save!
      count(invoice, "Factures")
    end

    # Rattache « Rewards Manager d'ici » au client « d'ici », « Serveur mail les4sources.be » aux « Les 4 Sources »…
    def client_name_from(label)
      existing = Client.where.not(name: UNASSIGNED_CLIENT).to_a.sort_by { -_1.name.length }
      label_words = words(label)
      match = existing.find do |client|
        name_words = words(client.name)
        label_words.each_cons(name_words.size).include?(name_words) || label_words.include?(normalize(client.name))
      end
      if match
        @warnings << "« #{label} » rattaché au client « #{match.name} »." unless normalize(label) == normalize(match.name)
        return match.name
      end
      name = label.sub(/\s*\(.*\)\s*\z/, "").sub(%r{\s+\d{2}/\d{2,4}\z}, "").strip
      @warnings << "Client « #{name} » déduit du libellé « #{label} »." if name != label
      name
    end

    def find_or_create_client(name)
      found = Client.all.find { |client| normalize(client.name) == normalize(name) }
      found || Client.create!(name: name.strip).tap { count(_1, "Clients") }
    end

    def unassigned_client
      @unassigned_client ||= Client.find_or_create_by!(name: UNASSIGNED_CLIENT) do |client|
        client.notes = "Noms de domaine importés sans client : à réattribuer."
      end
    end

    def project_status(status)
      case status.to_s.downcase
      when /termin|factur|pay/ then "termine"
      when /abandon/ then "abandonne"
      else "en_cours"
      end
    end

    # « Récurrence 21/03 » ou « A facturer annuellement en 01/2027 » → prochaine échéance.
    def next_billing_from(notes)
      text = notes.to_s
      if (match = text.match(%r{en (\d{2})/(\d{4})}))
        Date.new(match[2].to_i, match[1].to_i, 1)
      elsif (match = text.match(%r{Récurrence (\d{2})/(\d{2})}))
        date = Date.new(Date.current.year, match[2].to_i, match[1].to_i)
        date < Date.current ? date.next_year : date
      end
    end

    def rows(tab) = @source.rows(tab)

    def parse_date(value) = Date.strptime(value.strip, "%d/%m/%Y")

    # « 1 800,00 € », « $11.84 », « 0,5 » → BigDecimal
    def amount(value)
      text = value.to_s.gsub(/[^\d,.\-]/, "")
      text = text.delete(".").tr(",", ".") if text.include?(",")
      text.presence&.to_d || 0.to_d
    end

    def normalize(text) = words(text).join

    def words(text) = I18n.transliterate(text.to_s).downcase.scan(/[a-z0-9]+/)
end
