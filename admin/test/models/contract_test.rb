require "test_helper"

class ContractTest < ActiveSupport::TestCase
  test "a maintenance plan sets the monthly price" do
    contract = Contract.create!(client: clients(:dici), kind: "maintenance", plan: "evolution", label: "Maintenance")
    assert_equal 890, contract.amount
    assert_equal "mensuel", contract.period
    assert_equal 890 * 12, contract.yearly_amount
  end

  test "plan is cleared for other kinds" do
    contract = Contract.create!(client: clients(:dici), kind: "hebergement", plan: "essentiel", label: "Hébergement", amount: 100)
    assert_nil contract.plan
  end

  test "margin" do
    contract = contracts(:hosting)
    assert_equal 36, contract.yearly_margin
    assert_equal 20.0, contract.margin_rate
  end

  test "billing records an invoice and moves the due date by one period" do
    contract = contracts(:hosting)
    assert contract.due?(Date.new(2026, 10, 24))

    invoice = assert_difference -> { Invoice.count } do
      contract.bill!(on: Date.new(2026, 10, 24), number: "2026-042")
    end

    assert_equal 180, invoice.amount
    assert_equal "2026-042", invoice.number
    assert_equal Date.new(2027, 10, 1), contract.reload.next_billing_on
    assert_equal Date.new(2026, 10, 24), contract.last_billed_on
  end
end
