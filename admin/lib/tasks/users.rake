namespace :users do
  desc "Crée ou met à jour le compte admin : bin/rails users:create EMAIL=… PASSWORD=…"
  task create: :environment do
    email, password = ENV.fetch("EMAIL"), ENV.fetch("PASSWORD")
    user = User.find_or_initialize_by(email_address: email.strip.downcase)
    user.update!(password:)
    puts "Compte #{user.email_address} prêt."
  end
end
