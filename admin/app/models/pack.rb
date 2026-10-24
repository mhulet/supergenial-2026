class Pack < ApplicationRecord
  belongs_to :client
  belongs_to :invoice, optional: true
  has_many :time_entries, dependent: :nullify

  validates :label, presence: true
  validates :hours, numericality: { greater_than: 0 }

  def used_hours = time_entries.sum(:hours)

  def remaining_hours = hours - used_hours

  def exhausted? = remaining_hours <= 0

  def to_s = "#{label} (#{client})"
end
