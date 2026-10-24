Rails.application.routes.draw do
  resource :session, only: %i[ new create destroy ]

  root "dashboard#show"

  resources :clients do
    resources :contacts, only: %i[ new create edit update destroy ]
  end
  resources :projects
  resources :time_entries, except: :show do
    post :bill, on: :collection
  end
  resources :packs, except: :index
  resources :contracts do
    post :bill, on: :member
  end
  resources :fixed_costs, except: :show
  resources :invoices, except: :show

  get "up" => "rails/health#show", as: :rails_health_check
end
