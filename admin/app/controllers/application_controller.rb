class ApplicationController < ActionController::Base
  include Authentication
  allow_browser versions: :modern
  stale_when_importmap_changes

  private
    # Pré-remplit le client quand on crée depuis sa fiche (?client_id=…).
    def preselected_client_id = params[:client_id].presence
end
