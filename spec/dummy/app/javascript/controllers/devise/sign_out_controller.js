import { Controller } from "stimulus"
import Devise from "ApiMaker/Devise"

export default class extends Controller {
  static targets = ["link"]

  onSignOutClicked(e) {
    e.preventDefault()

    Devise.signOut()
      .then((response) => {
        this.element.dataset["successResponse"] = JSON.stringify(response)
      }, (response) => {
        this.element.dataset["failResponse"] = JSON.stringify(response)
      })
  }
}