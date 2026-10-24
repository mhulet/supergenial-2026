module ApplicationHelper
  def eur(amount, precision: 2)
    number_to_currency(amount || 0, unit: "€", format: "%n %u", separator: ",", delimiter: " ", precision:)
  end

  def hours(value)
    "#{number_with_precision(value || 0, precision: 2, strip_insignificant_zeros: true, separator: ",")} h"
  end

  def percent(value)
    value.nil? ? "–" : "#{number_with_precision(value, precision: 1, strip_insignificant_zeros: true, separator: ",")} %"
  end

  def date(value) = value ? l(value) : "–"

  BADGE_TONES = {
    "a_facturer" => "warn", "facture" => "ok", "au_pack" => "info", "offert" => "muted",
    "actif" => "ok", "prospect" => "info", "ancien" => "muted", "suspendu" => "warn", "termine" => "muted",
    "devis" => "info", "en_cours" => "ok", "maintenance" => "warn"
  }.freeze

  def badge(label, value = nil)
    tag.span(label, class: "badge badge--#{BADGE_TONES.fetch(value.to_s, 'muted')}")
  end

  def nav_link(label, path, section)
    link_to label, path, class: ("is-active" if controller_name == section.to_s)
  end

  def page_header(title, &actions)
    content_for(:title, title)
    tag.header(class: "page-header") do
      safe_join([ tag.h1(title), (tag.div(capture(&actions), class: "actions") if actions) ].compact)
    end
  end
end
