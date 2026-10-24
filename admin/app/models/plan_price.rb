# Un prix d'une formule, en vigueur à partir de starts_on jusqu'au prix suivant.
class PlanPrice < ApplicationRecord
  belongs_to :plan

  validates :amount, numericality: { greater_than_or_equal_to: 0 }
  validates :starts_on, presence: true, uniqueness: { scope: :plan_id, message: "a déjà un prix à cette date" }

  def current? = plan.prices.select { |price| price.starts_on <= Date.current }.last == self

  def upcoming? = starts_on > Date.current
end
