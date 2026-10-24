# Le nom d'un contact devient prénom + nom, pour appeler les gens par leur prénom dans les e-mails.
# Découpe au premier espace : « Jean Dupont » → Jean / Dupont, « Ethan » → Ethan / –.
class SplitContactNames < ActiveRecord::Migration[8.1]
  def up
    add_column :contacts, :first_name, :string
    add_column :contacts, :last_name, :string

    select_rows("SELECT id, name FROM contacts").each do |id, name|
      first_name, last_name = name.to_s.squish.split(" ", 2)
      update "UPDATE contacts SET first_name = #{connection.quote(first_name.to_s)}, last_name = #{connection.quote(last_name)} WHERE id = #{id.to_i}"
    end

    change_column_null :contacts, :first_name, false
    remove_column :contacts, :name
  end

  def down
    add_column :contacts, :name, :string
    execute "UPDATE contacts SET name = TRIM(first_name || ' ' || COALESCE(last_name, ''))"
    change_column_null :contacts, :name, false
    remove_column :contacts, :first_name
    remove_column :contacts, :last_name
  end
end
