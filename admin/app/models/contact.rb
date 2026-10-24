class Contact < ApplicationRecord
  belongs_to :client

  validates :first_name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  after_save :demote_other_contacts, if: -> { primary? && saved_change_to_primary? }

  def full_name = [ first_name, last_name ].compact_blank.join(" ")

  def to_s = full_name

  private
    # Un seul contact principal par client.
    def demote_other_contacts
      client.contacts.where.not(id:).update_all(primary: false)
    end
end
