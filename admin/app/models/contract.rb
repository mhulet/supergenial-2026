# Ce qu'un client paie de manière récurrente : maintenance, hébergement, nom de domaine…
class Contract < ApplicationRecord
  include Choices
  include Periodic

  PLAN_PRICES = { "essentiel" => 390, "evolution" => 890, "partenaire" => 1890 }.freeze

  belongs_to :client
  belongs_to :project, optional: true
  belongs_to :fixed_cost, optional: true

  KINDS = { "maintenance" => "Maintenance", "hebergement" => "Hébergement", "nom_de_domaine" => "Nom de domaine",
            "abonnement" => "Abonnement", "refacturation" => "Refacturation", "autre" => "Autre" }.freeze

  choices :plan, validate: { allow_nil: true }, essentiel: "Essentiel", evolution: "Évolution", partenaire: "Partenaire"
  choices :status, actif: "Actif", suspendu: "Suspendu", termine: "Terminé"

  validates :label, presence: true
  validates :kinds, presence: { message: "choisir au moins un type" }
  validate :kinds_are_known
  validates :amount, numericality: { greater_than_or_equal_to: 0 }

  before_validation :apply_plan

  # Un contrat a un ou plusieurs types, stockés en liste JSON.
  scope :of_kind, ->(kind) { where("EXISTS (SELECT 1 FROM json_each(contracts.kinds) WHERE value = ?)", kind) }
  scope :due_by, ->(date) { actif.where(next_billing_on: ..date) }
  scope :by_due_date, -> { order(Arel.sql("next_billing_on IS NULL"), :next_billing_on) }

  def self.kind_options = KINDS.invert.to_a

  # Les cases cochées arrivent avec une valeur vide : on la retire et on garde l'ordre de KINDS.
  def kinds=(values)
    values = Array(values).compact_blank.map(&:to_s).uniq
    super(values.sort_by { |kind| KINDS.keys.index(kind) || KINDS.size })
  end

  def kind?(kind) = kinds.include?(kind.to_s)

  def maintenance? = kind?(:maintenance)

  def kinds_label = kinds.map { |kind| KINDS[kind] }.join(" + ")

  def monthly_amount = monthly(amount)

  def yearly_amount = yearly(amount)

  def yearly_cost = yearly(cost)

  def yearly_margin = yearly_amount - yearly_cost

  def margin_rate
    return if yearly_amount.zero?
    (yearly_margin / yearly_amount * 100).round(1)
  end

  def due?(on = Date.current) = actif? && next_billing_on.present? && next_billing_on <= on

  # Enregistre la facture OkiOki de l'échéance et avance la prochaine d'une période.
  def bill!(on: Date.current, number: nil)
    base = next_billing_on || on
    transaction do
      invoice = client.invoices.create!(project:, number:, issued_on: on, amount:,
                                        label: "#{label} (#{I18n.l(base, format: :month)})")
      update!(last_billed_on: on, next_billing_on: period == "annuel" ? base.next_year : base.next_month)
      invoice
    end
  end

  def to_s = label

  private
    def kinds_are_known
      errors.add(:kinds, "contient un type inconnu") if (kinds - KINDS.keys).any?
    end

    # Un palier de maintenance fixe le prix mensuel s'il n'a pas été saisi.
    def apply_plan
      return self.plan = nil unless maintenance?
      return unless plan && amount.to_d.zero?
      self.amount = PLAN_PRICES[plan]
      self.period = "mensuel"
    end
end
