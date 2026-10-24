class InvoicesController < ApplicationController
  before_action :set_invoice, only: %i[ edit update destroy ]

  def index
    @year = (params[:year] || Date.current.year).to_i
    @invoices = Invoice.in_year(@year).includes(:client).recent
  end

  def new
    @invoice = Invoice.new(client_id: preselected_client_id, issued_on: Date.current)
  end

  def create
    @invoice = Invoice.new(invoice_params)
    if @invoice.save
      redirect_to invoices_path(year: @invoice.issued_on.year), notice: "Facture enregistrée."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @invoice.update(invoice_params)
      redirect_to invoices_path(year: @invoice.issued_on.year), notice: "Facture mise à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @invoice.destroy
    redirect_to invoices_path, notice: "Facture supprimée.", status: :see_other
  end

  private
    def set_invoice
      @invoice = Invoice.find(params[:id])
    end

    def invoice_params
      params.expect(invoice: %i[ client_id project_id number label issued_on amount paid_on notes ])
    end
end
