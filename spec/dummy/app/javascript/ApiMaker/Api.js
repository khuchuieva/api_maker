import qs from "qs"

export default class {
  static get(path, data = null) {
    return this.requestLocal({"path": path, "pathParams": data, "method": "GET"})
  }

  static patch(path, data = {}) {
    return this.requestLocal({"path": path, "data": data, "method": "PATCH"})
  }

  static post(path, data = {}) {
    return this.requestLocal({"path": path, "data": data, "method": "POST"})
  }

  static request(args) {
    var path = args.path

    if (args.pathParams) {
      var pathParamsString = qs.stringify(args.pathParams, {"arrayFormat": "brackets"})
      path += `?${pathParamsString}`
    }

    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest()
      xhr.open(args.method, path)

      if (args.headers) {
        for(var headerName in args.headers) {
          xhr.setRequestHeader(headerName, args.headers[headerName])
        }
      }

      xhr.onload = () => {
        var response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          reject(response)
        }
      }

      xhr.send(args.data)
    })
  }

  static requestLocal(args) {
    if (!args.headers)
      args["headers"] = {}

    args["headers"]["Content-Type"] = "application/json"
    args["headers"]["X-CSRF-Token"] = this._token()

    if (args.data)
      args["data"] = JSON.stringify(args.data)

    return this.request(args)
  }

  static put(path, data = {}) {
    return this.requestLocal({"path": path, "data": data, "method": "PUT"})
  }

  static _token() {
    var tokenElement = document.querySelector("meta[name='csrf-token']")

    if (tokenElement)
      return tokenElement.getAttribute("content")
  }

  static _parseResponse(xhr) {
    var responseType = xhr.getResponseHeader("content-type")

    if (responseType && responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}