class Client < ApplicationRecord
  include Choices

  DEFAULT_HOURLY_RATE = 80

  has_many :contacts, -> { order(primary: :desc, name: :asc) }, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :contracts, dependent: :destroy
  has_many :time_entries, dependent: :destroy
  has_many :packs, dependent: :destroy
  has_many :invoices, dependent: :destroy

  choices :kind, organisation: "Organisation", particulier: "Particulier"
  choices :status, actif: "Actif", prospect: "Prospect", ancien: "Ancien client"

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :alphabetical, -> { order(Arel.sql("LOWER(name)")) }

  def primary_contact = contacts.first

  def rate = hourly_rate || DEFAULT_HOURLY_RATE

  def unbilled_hours = time_entries.a_facturer.sum(:hours)

  def unbilled_amount = time_entries.a_facturer.includes(:project).sum(&:amount)

  def to_s = name
end
