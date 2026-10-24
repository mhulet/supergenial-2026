# Statuts de projet : Devis, En cours, Maintenance, Terminé.
class RenameProjectStatuses < ActiveRecord::Migration[8.1]
  def up
    execute "UPDATE projects SET status = 'devis' WHERE status = 'prospect'"
    execute "UPDATE projects SET status = 'termine' WHERE status = 'abandonne'"
  end

  def down
    execute "UPDATE projects SET status = 'prospect' WHERE status = 'devis'"
    execute "UPDATE projects SET status = 'en_cours' WHERE status = 'maintenance'"
  end
end
