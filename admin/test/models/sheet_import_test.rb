require "test_helper"

class SheetImportTest < ActiveSupport::TestCase
  class FakeSource
    def initialize(tabs) = @tabs = tabs
    def rows(tab) = @tabs.fetch(tab, [])
  end

  TABS = {
    "Prestations" => [
      %w[Date Client Statut Tâche Heures KM Lieu],
      [ "23/10/2026", "D'ici", "Non facturé", "Visio", "1,5", "", "" ],
      [ "08/07/2026", "Silvéa", "Pack 10h", "SEO", "1,5", "", "" ]
    ],
    "Outils M&V" => [
      [ "", "Coût mensuel", "Prévisionnel", "", "Notes" ],
      [ "Hatchbox", "10,00 €", "0,00 €", "", "Passer à Coolify" ],
      [ "Buttondown", "29,00 €", "-" ],
      [ "Linode" ],
      [ "hatchboxed", "53,00 €", "53,00 €" ],
      [ "Total mensuel", "92,00 €" ]
    ],
    "Revenus" => [
      %w[2026 Facturé Coûts],
      [ "Hébergements et maintenance" ],
      [ "Rewards Manager d'ici", "180,00 €", "144,00 €", "", "", "Facturé", "Récurrence 01/06 - A facturer annuellement en 01/2027" ],
      [ "Novabirra (Craft CMS)", "240,00 €", "", "", "", "A facturer !" ],
      [ "Total", "420,00 €" ]
    ]
  }.freeze

  test "imports and is idempotent" do
    2.times { SheetImport.new(FakeSource.new(TABS), year: 2026).run }

    assert_equal 1, clients(:dici).time_entries.where(description: "Visio").count
    assert_equal "Pack 10h", clients(:silvea).time_entries.find_by(description: "SEO", hours: 1.5).pack.label

    assert_equal 0, FixedCost.find_by(name: "Hatchbox").forecast
    assert_equal "Passer à Coolify", FixedCost.find_by(name: "Hatchbox").action
    assert_equal "serveurs", FixedCost.find_by(name: "hatchboxed").category

    rewards = clients(:dici).contracts.find_by(label: "Rewards Manager d'ici")
    assert_equal [ 180, 144, Date.new(2027, 1, 1) ], [ rewards.amount, rewards.cost, rewards.next_billing_on ]
    assert_equal 1, clients(:dici).invoices.where(amount: 180).count

    novabirra = Client.find_by(name: "Novabirra")
    assert novabirra
    assert_empty novabirra.invoices
  end
end
