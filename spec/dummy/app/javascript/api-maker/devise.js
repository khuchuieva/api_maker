import Api from "./api"
import CustomError from "./custom-error"
import EventEmitter from "events"
const inflection = require("inflection")

export default class Devise {
  static callSignOutEvent(args) {
    Devise.events().emit("onDeviseSignOut", {args: args})
  }

  static events() {
    if (!window.apiMakerDeviseEvents)
      window.apiMakerDeviseEvents = new EventEmitter()

    return window.apiMakerDeviseEvents
  }

  
    
    
      static isUserSignedIn() {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUser"
        var scopeData = apiMakerDataElement.dataset[keyName]

        if (scopeData)
          return true

        return false
      }

      static currentUser() {
        var apiMakerDataElement = document.querySelector(".api-maker-data")
        var keyName = "currentUser"
        var scopeData = apiMakerDataElement.dataset[keyName]

        if (!scopeData)
          return null

        var modelClass = require("api-maker/models/user").default
        var modelInstance = new modelClass({data: JSON.parse(scopeData)})

        return modelInstance
      }
    
  

  static async signIn(username, password, args = {}) {
    if (!args.scope)
      args.scope = "user"

    var postData = {"username": username, "password": password, "args": args}
    var response = await Api.post("/api_maker/devise/do_sign_in", postData)

    if (response.success) {
      var modelClass = require(`api-maker/models/${inflection.dasherize(args.scope)}`).default
      var modelInstance = new modelClass(response.model_data)

      Devise.updateSession(modelInstance)
      Devise.events().emit("onDeviseSignIn", Object.assign({username: username}, args))

      return {response: response}
    } else {
      throw new CustomError("Sign in failed", {response: response})
    }
  }

  static updateSession(model) {
    var apiMakerDataElement = document.querySelector(".api-maker-data")
    var keyName = `current${model.modelClassData().name}`
    apiMakerDataElement.dataset[keyName] = JSON.stringify({type: model.modelClassData().pluralName, id: model.id(), attributes: model.modelData})
  }

  static setSignedOut(args) {
    var apiMakerDataElement = document.querySelector(".api-maker-data")
    var keyName = `current${inflection.camelize(args.scope)}`

    delete apiMakerDataElement.dataset[keyName]
  }

  static async signOut(args = {}) {
    if (!args.scope)
      args.scope = "user"

    var postData = {"args": args}
    var response = await Api.post("/api_maker/devise/do_sign_out", postData)

    if (response.success) {
      Devise.setSignedOut(args)
      Devise.callSignOutEvent(args)
      return response
    } else {
      throw new CustomError("Sign out failed", {response: response})
    }
  }
}
