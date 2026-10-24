class ProjectsController < ApplicationController
  before_action :set_project, only: %i[ show edit update destroy ]

  def index
    @status = params[:status].presence_in(Project::STATUSES.keys)
    @projects = Project.includes(:client).order(updated_at: :desc)
    @projects = @status ? @projects.where(status: @status) : @projects.ongoing
  end

  def show
    @time_entries = @project.time_entries.recent.limit(50)
  end

  def new
    @project = Project.new(client_id: preselected_client_id)
  end

  def create
    @project = Project.new(project_params)
    if @project.save
      redirect_to @project, notice: "Projet créé."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @project.update(project_params)
      redirect_to @project, notice: "Projet mis à jour."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @project.destroy
    redirect_to projects_path, notice: "Projet supprimé.", status: :see_other
  end

  private
    def set_project
      @project = Project.find(params[:id])
    end

    def project_params
      params.expect(project: %i[ client_id name kind billing_mode status fixed_price hourly_rate started_on ended_on notes ])
    end
end
