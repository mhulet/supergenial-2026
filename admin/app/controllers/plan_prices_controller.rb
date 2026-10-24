class PlanPricesController < ApplicationController
  before_action :set_plan

  def create
    price = @plan.prices.new(params.expect(plan_price: %i[ amount starts_on ]))
    if price.save
      redirect_to @plan, notice: "#{helpers.eur(price.amount)} à partir du #{l(price.starts_on)}."
    else
      redirect_to @plan, alert: price.errors.full_messages.to_sentence
    end
  end

  def destroy
    if @plan.prices.size > 1
      @plan.prices.find(params[:id]).destroy
      redirect_to @plan, notice: "Prix supprimé.", status: :see_other
    else
      redirect_to @plan, alert: "Une formule garde au moins un prix.", status: :see_other
    end
  end

  private
    def set_plan
      @plan = Plan.find(params[:plan_id])
    end
end
