# Les paliers de maintenance codés en dur deviennent un catalogue de formules aux prix datés.
# Un contrat relié à une formule suit son prix, sauf s'il a un prix négocié (amount).
class CreatePlans < ActiveRecord::Migration[8.1]
  OLD_PLANS = { "essentiel" => [ "Essentiel", 390 ], "evolution" => [ "Évolution", 890 ], "partenaire" => [ "Partenaire", 1890 ] }.freeze

  def up
    create_table :plans do |t|
      t.string :name, null: false
      t.text :description
      t.string :period, default: "mensuel", null: false
      t.integer :position, default: 0, null: false
      t.boolean :active, default: true, null: false
      t.timestamps
      t.index :name, unique: true
    end

    create_table :plan_prices do |t|
      t.references :plan, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.date :starts_on, null: false
      t.timestamps
      t.index [ :plan_id, :starts_on ], unique: true
    end

    add_reference :contracts, :plan, foreign_key: true
    change_column_null :contracts, :amount, true
    change_column_default :contracts, :amount, from: 0, to: nil

    # Le prix d'origine vaut depuis le début du plus ancien contrat.
    since = [ select_value("SELECT MIN(starts_on) FROM contracts")&.to_date, Date.new(2026, 1, 1) ].compact.min
    OLD_PLANS.each_with_index do |(key, (name, price)), position|
      plan_id = insert "INSERT INTO plans (name, period, position, active, created_at, updated_at)
                        VALUES (#{quote(name)}, 'mensuel', #{position}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      execute "INSERT INTO plan_prices (plan_id, amount, starts_on, created_at, updated_at)
               VALUES (#{plan_id}, #{price}, #{quote(since)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      execute "UPDATE contracts SET plan_id = #{plan_id} WHERE plan = #{quote(key)}"
      # Au prix du catalogue mensuel : le contrat suit la formule. Sinon il garde son prix négocié.
      execute "UPDATE contracts SET amount = NULL WHERE plan_id = #{plan_id} AND period = 'mensuel' AND amount = #{price}"
    end

    remove_column :contracts, :plan
  end

  # Les formules ajoutées depuis sont perdues ; un contrat qui suivait le catalogue reprend son prix du jour.
  def down
    add_column :contracts, :plan, :string
    select_rows("SELECT id, name FROM plans").each do |id, name|
      key = OLD_PLANS.find { |_, (old_name, _)| old_name == name }&.first
      price = select_value("SELECT amount FROM plan_prices WHERE plan_id = #{id} AND starts_on <= #{quote(Date.current)} ORDER BY starts_on DESC LIMIT 1") ||
              select_value("SELECT amount FROM plan_prices WHERE plan_id = #{id} ORDER BY starts_on LIMIT 1") || 0
      execute "UPDATE contracts SET amount = #{price} WHERE plan_id = #{id} AND amount IS NULL"
      execute "UPDATE contracts SET plan = #{quote(key)} WHERE plan_id = #{id}" if key
    end
    execute "UPDATE contracts SET amount = 0 WHERE amount IS NULL"
    change_column_default :contracts, :amount, from: nil, to: 0
    change_column_null :contracts, :amount, false
    remove_reference :contracts, :plan, foreign_key: true
    drop_table :plan_prices
    drop_table :plans
  end
end
