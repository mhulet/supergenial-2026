class Pack < ApplicationRecord
  belongs_to :client
  belongs_to :invoice, optional: true
  has_many :time_entries

  before_destroy :release_time_entries

  validates :label, presence: true
  validates :hours, numericality: { greater_than: 0 }

  def used_hours = time_entries.sum(:hours)

  def remaining_hours = hours - used_hours

  def exhausted? = remaining_hours <= 0

  def to_s = "#{label} (#{client})"

  private
    # Sans pack, les heures qui y étaient imputées redeviennent « à facturer ».
    def release_time_entries
      time_entries.au_pack.update_all(status: "a_facturer")
      time_entries.update_all(pack_id: nil)
    end
end
