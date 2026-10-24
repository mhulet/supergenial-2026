class PacksController < ApplicationController
  before_action :set_pack, only: %i[ show edit update destroy ]

  def show
    @time_entries = @pack.time_entries.recent
  end

  def new
    @pack = Pack.new(client_id: preselected_client_id, purchased_on: Date.current)
  end

  def create
    @pack = Pack.new(pack_params)
    if @pack.save
      redirect_to @pack.client, notice: "Pack créé."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @pack.update(pack_params)
      redirect_to @pack, notice: "Pack mis à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @pack.destroy
    redirect_to @pack.client, notice: "Pack supprimé.", status: :see_other
  end

  private
    def set_pack
      @pack = Pack.find(params[:id])
    end

    def pack_params
      params.expect(pack: %i[ client_id label hours hourly_rate purchased_on ])
    end
end
