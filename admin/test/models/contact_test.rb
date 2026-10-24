require "test_helper"

class ContactTest < ActiveSupport::TestCase
  test "only one primary contact per client" do
    frank = clients(:dici).contacts.create!(first_name: "Frank", primary: true)
    assert frank.primary?
    assert_not contacts(:ethan).reload.primary?
  end

  test "full name joins first and last name" do
    assert_equal "Ethan Martin", contacts(:ethan).full_name
    assert_equal "Frank", Contact.new(first_name: "Frank").to_s
  end
end
