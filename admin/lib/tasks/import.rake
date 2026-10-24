namespace :import do
  desc "Importe la Google Sheet « M&V / Abonnements ». SHEET_ID=… (partagée par lien) ou DIR=dossier de CSV (un fichier par onglet)"
  task sheet: :environment do
    source = if ENV["DIR"].present?
      SheetImport::CsvDirectory.new(ENV["DIR"])
    else
      SheetImport::GoogleSheet.new(ENV.fetch("SHEET_ID"))
    end
    report = SheetImport.new(source, year: ENV.fetch("YEAR", Date.current.year).to_i).run
    puts report
  end
end
