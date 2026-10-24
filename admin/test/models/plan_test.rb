require "test_helper"

class PlanTest < ActiveSupport::TestCase
  test "the price in effect is the last one activated" do
    plan = plans(:evolution)
    assert_nil plan.price_on(Date.new(2025, 12, 31))
    assert_equal 890, plan.price_on(Date.new(2026, 1, 1))
    assert_equal 890, plan.price_on(Date.new(2026, 12, 31))
    assert_equal 950, plan.price_on(Date.new(2027, 1, 1))
    assert_equal plan_prices(:evolution_2027), plan.next_price(Date.new(2026, 10, 24))
    assert_nil plan.next_price(Date.new(2027, 1, 1))
  end

  test "a plan needs a first price" do
    assert_not Plan.new(name: "Sans prix").valid?
    assert Plan.new(name: "Croissance", prices_attributes: [ { amount: 1200, starts_on: "2027-01-01" } ]).valid?
  end

  test "one price per activation date" do
    assert_not plans(:evolution).prices.new(amount: 1000, starts_on: Date.new(2027, 1, 1)).valid?
  end

  test "a plan with contracts cannot be deleted" do
    assert_not plans(:evolution).destroy
    assert plans(:essentiel).destroy
  end
end
