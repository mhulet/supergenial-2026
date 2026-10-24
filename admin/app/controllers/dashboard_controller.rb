class DashboardController < ApplicationController
  def show
    @dashboard = Dashboard.new(year: (params[:year] || Date.current.year).to_i)
  end
end
