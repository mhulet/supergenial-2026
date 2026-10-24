class CreateDomain < ActiveRecord::Migration[8.1]
  def change
    create_table :clients do |t|
      t.string :name, null: false
      t.string :kind, null: false, default: "organisation"
      t.string :vat_number
      t.text :address
      t.string :status, null: false, default: "actif"
      t.decimal :hourly_rate, precision: 8, scale: 2
      t.text :notes
      t.timestamps
    end
    add_index :clients, :name, unique: true

    create_table :contacts do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name, null: false
      t.string :role
      t.string :email
      t.string :phone
      t.boolean :primary, null: false, default: false
      t.timestamps
    end

    create_table :projects do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name, null: false
      t.string :kind, null: false, default: "application"
      t.string :billing_mode, null: false, default: "forfait"
      t.decimal :fixed_price, precision: 10, scale: 2
      t.decimal :hourly_rate, precision: 8, scale: 2
      t.string :status, null: false, default: "en_cours"
      t.date :started_on
      t.date :ended_on
      t.text :notes
      t.timestamps
    end

    create_table :invoices do |t|
      t.references :client, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.string :number
      t.string :label, null: false
      t.date :issued_on, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.date :paid_on
      t.text :notes
      t.timestamps
    end
    add_index :invoices, :issued_on

    create_table :packs do |t|
      t.references :client, null: false, foreign_key: true
      t.references :invoice, foreign_key: true
      t.string :label, null: false
      t.decimal :hours, precision: 6, scale: 2, null: false
      t.decimal :hourly_rate, precision: 8, scale: 2
      t.date :purchased_on
      t.timestamps
    end

    create_table :time_entries do |t|
      t.references :client, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.references :pack, foreign_key: true
      t.references :invoice, foreign_key: true
      t.date :performed_on, null: false
      t.string :description
      t.decimal :hours, precision: 6, scale: 2, null: false
      t.integer :km
      t.string :location
      t.string :status, null: false, default: "a_facturer"
      t.timestamps
    end
    add_index :time_entries, [ :status, :performed_on ]

    create_table :fixed_costs do |t|
      t.string :name, null: false
      t.string :category, null: false, default: "outils"
      t.decimal :amount, precision: 10, scale: 2, null: false, default: 0
      t.string :period, null: false, default: "mensuel"
      t.decimal :forecast_amount, precision: 10, scale: 2
      t.date :renews_on
      t.string :action
      t.string :billing_url
      t.boolean :active, null: false, default: true
      t.text :notes
      t.timestamps
    end

    create_table :contracts do |t|
      t.references :client, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.references :fixed_cost, foreign_key: true
      t.string :kind, null: false, default: "hebergement"
      t.string :plan
      t.string :label, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false, default: 0
      t.decimal :cost, precision: 10, scale: 2
      t.string :period, null: false, default: "annuel"
      t.date :starts_on
      t.date :next_billing_on
      t.date :last_billed_on
      t.string :status, null: false, default: "actif"
      t.string :registrar
      t.text :notes
      t.timestamps
    end
    add_index :contracts, :next_billing_on
  end
end
