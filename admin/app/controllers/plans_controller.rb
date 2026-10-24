class PlansController < ApplicationController
  before_action :set_plan, only: %i[ show edit update destroy ]

  def index
    @plans = Plan.ordered.includes(:prices, contracts: { plan: :prices })
  end

  def show
    @contracts = @plan.contracts.includes(:client, plan: :prices).by_due_date
    @price = PlanPrice.new(starts_on: Date.current.next_year.beginning_of_year)
  end

  def new
    @plan = Plan.new(position: Plan.maximum(:position).to_i + 1)
    @plan.prices.build(starts_on: Date.current)
  end

  def create
    @plan = Plan.new(plan_params)
    if @plan.save
      redirect_to @plan, notice: "Formule créée."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @plan.update(plan_params.except(:prices_attributes))
      redirect_to @plan, notice: "Formule mise à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    if @plan.destroy
      redirect_to plans_path, notice: "Formule supprimée.", status: :see_other
    else
      redirect_to @plan, alert: "#{@plan} a encore #{helpers.pluralize(@plan.contracts.size, 'contrat')} : retire-la du catalogue plutôt.", status: :see_other
    end
  end

  private
    def set_plan
      @plan = Plan.find(params[:id])
    end

    def plan_params
      params.expect(plan: [ :name, :description, :period, :position, :active, prices_attributes: [ [ :amount, :starts_on ] ] ])
    end
end
