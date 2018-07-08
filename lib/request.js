class Request {
  constructor (body) {
    this._body = body
  }

  topic () {
    return this._body.topic
  }

  event () {
    return this._body.event
  }

  reqId () {
    return this._body.reqId
  }

  connId () {
    return this._body.connId
  }

  data () {
    return this._body.data.toString('utf8')
  }
}

module.exports = Request
