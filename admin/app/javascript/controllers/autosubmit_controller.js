import { Controller } from "@hotwired/stimulus"

// Soumet le formulaire dès qu'un filtre change.
export default class extends Controller {
  submit() {
    this.element.requestSubmit()
  }
}
