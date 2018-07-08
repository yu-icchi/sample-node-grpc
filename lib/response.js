class Response {
  constructor (conn) {
    this._conn = conn
    this.topic = conn.request.topic
    this.event = conn.request.event
    this.reqId = conn.request.reqId
    this.connId = conn.request.connId
  }

  static get CMD () {
    return {
      SEND: 0,
      REPLY: 1,
      BROADCAST: 2
    }
  }

  _send (cmd, topic, event, connId, payload) {
    if (!this._conn.writable) {
      return
    }

    this._conn.write({
      version: 1,
      topic: topic,
      event: event,
      reqId: this.reqId,
      connId: connId,
      cmd: cmd,
      data: Buffer.from(payload)
    })
  }

  send ({topic, event, connId, data}) {
    this._send(Response.CMD.SEND, topic, event, connId, data)
  }

  broadcast ({event, data}) {
    this._send(Response.CMD.BROADCAST, this.topic, event, this.connId, data)
  }

  reply ({data}) {
    this._send(Response.CMD.REPLY, this.topic, this.event, this.connId, data)
  }

  close () {
    if (!this._conn.writable) {
      return
    }
    this._conn.end()
  }
}

module.exports = Response
