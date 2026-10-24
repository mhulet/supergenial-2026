require "test_helper"

class ContactTest < ActiveSupport::TestCase
  test "only one primary contact per client" do
    frank = clients(:dici).contacts.create!(name: "Frank", primary: true)
    assert frank.primary?
    assert_not contacts(:ethan).reload.primary?
  end
end
