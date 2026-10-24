# Champs à valeurs fixes (statut, type…) : stockés en texte, libellés en français.
#   choices :status, actif: "Actif", ancien: "Ancien client"
# donne Client::STATUSES, l'enum Rails, la validation et #status_label.
module Choices
  extend ActiveSupport::Concern

  class_methods do
    def choices(attribute, validate: true, **labels)
      const_set(attribute.to_s.pluralize.upcase, labels.stringify_keys.freeze)
      enum attribute, labels.keys.index_with(&:to_s), validate: validate

      define_method("#{attribute}_label") { labels.stringify_keys[public_send(attribute)] }
      define_singleton_method("#{attribute}_options") { labels.map { |key, label| [ label, key.to_s ] } }
    end
  end
end
