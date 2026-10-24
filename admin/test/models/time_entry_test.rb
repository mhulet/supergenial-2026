require "test_helper"

class TimeEntryTest < ActiveSupport::TestCase
  test "amount uses the project rate, then the client rate" do
    assert_equal 180, time_entries(:dashboard).amount
    assert_equal 120, time_entries(:visio).amount
  end

  test "an entry on a pack is marked as such" do
    entry = TimeEntry.create!(client: clients(:silvea), pack: packs(:silvea_10h), performed_on: Date.current, hours: 0.5)
    assert entry.au_pack?
    assert_equal 0.5, packs(:silvea_10h).remaining_hours
  end

  test "project and pack must belong to the client" do
    entry = TimeEntry.new(client: clients(:silvea), project: projects(:platform), performed_on: Date.current, hours: 1)
    assert_not entry.valid?
    assert entry.errors[:project].any?
  end
end
