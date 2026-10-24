# Une facture émise dans OkiOki : l'admin ne la génère pas, elle la référence.
class Invoice < ApplicationRecord
  belongs_to :client
  belongs_to :project, optional: true
  has_many :time_entries, dependent: :nullify
  has_many :packs, dependent: :nullify

  validates :label, :issued_on, :amount, presence: true

  scope :in_year, ->(year) { where(issued_on: Date.new(year).all_year) }
  scope :unpaid, -> { where(paid_on: nil) }
  scope :recent, -> { order(issued_on: :desc) }

  def paid? = paid_on.present?

  def to_s = [ number, label ].compact_blank.join(" · ")
end
