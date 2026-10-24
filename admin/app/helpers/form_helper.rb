module FormHelper
  # Un champ avec son libellé et ses erreurs : <%= field f, :name %>, <%= field f, :kind, :select, Client.kind_options %>
  def field(form, attribute, type = :text_field, *args, hint: nil, **options)
    errors = form.object&.errors&.full_messages_for(attribute) || []
    input = case type
    when :select then form.select(attribute, args.first, { include_blank: options.delete(:include_blank) }, options)
    when :check_box then form.check_box(attribute, options)
    else form.public_send(type, attribute, options)
    end
    tag.div(class: [ "field", ("field--check" if type == :check_box), ("field--error" if errors.any?) ]) do
      safe_join([ form.label(attribute), input, (tag.small(hint, class: "hint") if hint), *errors.map { |e| tag.small(e, class: "error") } ].compact)
    end
  end

  def client_options = Client.alphabetical.pluck(:name, :id)

  def project_options(client_id = nil)
    scope = Project.includes(:client).order(:name)
    scope = scope.where(client_id:) if client_id.present?
    scope.map { |project| [ "#{project.client} · #{project.name}", project.id ] }
  end

  def pack_options(client_id = nil)
    scope = Pack.includes(:client).order(purchased_on: :desc)
    scope = scope.where(client_id:) if client_id.present?
    scope.map { |pack| [ "#{pack.client} · #{pack.label} (reste #{hours(pack.remaining_hours)})", pack.id ] }
  end

  def period_options = Periodic::PERIODS.map { |key, label| [ label.capitalize, key ] }
end
