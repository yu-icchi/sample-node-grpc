const server = require('./lib')

async function handler (req, res) {
  console.log(req.reqId())
  console.log(req.topic(), req.event())
  console.log(req.data())

  res.send({
    topic: req.topic(),
    event: 'joined',
    connId: req.connId(),
    data: 'message send 1'
  })
  await timeout(1000)
  res.send({
    topic: req.topic(),
    event: 'chat',
    connId: req.connId(),
    data: 'message send 2'
  })
  await timeout(1000)
  res.send({
    topic: req.topic(),
    event: 'leave',
    connId: req.connId(),
    data: 'message send 3'
  })
}

server.start(handler)

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
