# Statuts de projet : Devis, Non signé, En attente, En cours, Maintenance, Terminé, Abandonné.
class RenameProjectStatuses < ActiveRecord::Migration[8.1]
  def up
    execute "UPDATE projects SET status = 'devis' WHERE status = 'prospect'"
  end

  def down
    execute "UPDATE projects SET status = 'prospect' WHERE status = 'devis'"
    execute "UPDATE projects SET status = 'en_cours' WHERE status IN ('maintenance', 'en_attente')"
    execute "UPDATE projects SET status = 'abandonne' WHERE status = 'non_signe'"
  end
end
