class ContactsController < ApplicationController
  before_action :set_client
  before_action :set_contact, only: %i[ edit update destroy ]

  def new
    @contact = @client.contacts.new(primary: @client.contacts.none?)
  end

  def create
    @contact = @client.contacts.new(contact_params)
    if @contact.save
      redirect_to @client, notice: "Contact ajouté."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @contact.update(contact_params)
      redirect_to @client, notice: "Contact mis à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @contact.destroy
    redirect_to @client, notice: "Contact supprimé.", status: :see_other
  end

  private
    def set_client
      @client = Client.find(params[:client_id])
    end

    def set_contact
      @contact = @client.contacts.find(params[:id])
    end

    def contact_params
      params.expect(contact: %i[ first_name last_name role email phone primary ])
    end
end
