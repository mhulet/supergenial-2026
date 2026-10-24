class Project < ApplicationRecord
  include Choices

  belongs_to :client
  has_many :time_entries, dependent: :nullify
  has_many :contracts, dependent: :nullify
  has_many :invoices, dependent: :nullify

  choices :kind, application: "Application", site: "Site web", mise_a_jour: "Mise à jour",
                 prestation: "Prestation", autre: "Autre"
  choices :billing_mode, forfait: "Forfait", regie: "Régie", pack: "Pack d'heures"
  choices :status, devis: "Devis", en_cours: "En cours", maintenance: "Maintenance", termine: "Terminé"

  validates :name, presence: true

  scope :ongoing, -> { where.not(status: "termine") }

  def rate = hourly_rate || client.rate

  def hours_spent = time_entries.sum(:hours)

  def invoiced = invoices.sum(:amount)

  def to_s = name
end
