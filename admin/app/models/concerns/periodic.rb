# Montants exprimés par mois ou par an (frais fixes, contrats).
module Periodic
  extend ActiveSupport::Concern

  PERIODS = { "mensuel" => "par mois", "annuel" => "par an" }.freeze

  included do
    validates :period, inclusion: { in: PERIODS.keys }
  end

  def period_label = PERIODS[period]

  def monthly(value)
    return 0 if value.blank?
    period == "annuel" ? value / 12 : value
  end

  def yearly(value)
    return 0 if value.blank?
    period == "annuel" ? value : value * 12
  end
end
