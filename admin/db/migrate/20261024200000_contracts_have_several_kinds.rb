# Un contrat peut couvrir plusieurs types (ex. hébergement + maintenance) : kind devient la liste kinds.
class ContractsHaveSeveralKinds < ActiveRecord::Migration[8.1]
  def up
    add_column :contracts, :kinds, :json, default: [], null: false
    execute "UPDATE contracts SET kinds = json_array(kind)"
    remove_column :contracts, :kind
  end

  # Ne garde que le premier type de chaque contrat.
  def down
    add_column :contracts, :kind, :string, default: "hebergement", null: false
    execute "UPDATE contracts SET kind = json_extract(kinds, '$[0]') WHERE json_array_length(kinds) > 0"
    remove_column :contracts, :kinds
  end
end
