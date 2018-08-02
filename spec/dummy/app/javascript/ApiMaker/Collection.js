import BaseModel from "./BaseModel"
import qs from "qs"
import Result from "./Result"

export default class Collection {
  constructor(args) {
    this.args = args
    this.includes = args.includes
    this.ransackOptions = args.ransack
  }

  each(callback) {
    this.toArray().then((array) => {
      for(var model in array) {
        callback.apply(model)
      }
    })
  }

  limit(amount) {
    this.limit = amount
    return this
  }

  preload(args) {
    this.includes = args
    return this
  }

  page(pageNumber) {
    this.page = pageNumber
    return this
  }

  ransack(params) {
    this.ransackOptions = Object.assign(this.ransackOptions, params)
    return this
  }

  first() {
    return new Promise((resolve, reject) => {
      this.toArray().then((models) => {
        resolve(models[0])
      })
    })
  }

  toArray() {
    return new Promise((resolve, reject) => {
      this._response().then((response) => {
        var models = this._responseToModels(response)
        resolve(models)
      })
    })
  }

  result() {
    return new Promise((resolve, reject) => {
      this._response().then((response) => {
        var models = this._responseToModels(response)
        var result = new Result({
          "models": models,
          "response": response
        })
        resolve(result)
      })
    })
  }

  _response() {
    return new Promise((resolve, reject) => {
      var dataToUse = qs.stringify(this._params())
      var urlToUse = this.args.targetPathName + "?" + dataToUse

      var xhr = new XMLHttpRequest()
      xhr.open("GET", urlToUse)
      xhr.setRequestHeader("X-CSRF-Token", BaseModel._token())
      xhr.onload = () => {
        if (xhr.status == 200) {
          var response = JSON.parse(xhr.responseText)
          resolve(response)
        } else {
          reject({"responseText": xhr.responseText})
        }
      }
      xhr.send()
    })
  }

  _responseToModels(response) {
    var modelClass = require("ApiMaker/Models/" + this.args.modelName).default
    var array = []
    for(var modelDataKey in response.collection) {
      var modelData = response.collection[modelDataKey]
      var modelInstance = new modelClass(modelData)
      array.push(modelInstance)
    }
    return array
  }

  _params() {
    var params = {}
    if (this.ransackOptions)
      params["q"] = this.ransackOptions

    if (this.limit)
      params["limit"] = this.limit

    if (this.includes)
      params["include"] = this.includes

    if (this.page)
      params["page"] = this.page

    return params
  }
}