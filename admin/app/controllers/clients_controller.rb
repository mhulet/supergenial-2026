class ClientsController < ApplicationController
  before_action :set_client, only: %i[ show edit update destroy ]

  def index
    @status = params[:status].presence_in(Client::STATUSES.keys)
    @clients = Client.alphabetical.includes(:contacts)
    @clients = @clients.where(status: @status) if @status
  end

  def show
    @time_entries = @client.time_entries.recent.includes(:project, :pack).limit(30)
  end

  def new
    @client = Client.new
  end

  def create
    @client = Client.new(client_params)
    if @client.save
      redirect_to @client, notice: "Client créé."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @client.update(client_params)
      redirect_to @client, notice: "Client mis à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    if @client.destroy
      redirect_to clients_path, notice: "#{@client} supprimé.", status: :see_other
    else
      redirect_to @client, status: :see_other,
        alert: "Impossible de supprimer #{@client} : #{helpers.pluralize(@client.invoices.count, "facture")} y #{@client.invoices.many? ? "sont liées" : "est liée"}. " \
               "Passe-le en « Ancien client », ou supprime d'abord ses factures."
    end
  end

  private
    def set_client
      @client = Client.find(params[:id])
    end

    def client_params
      params.expect(client: %i[ name kind status vat_number address hourly_rate notes ])
    end
end
