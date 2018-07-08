const grpc = require('grpc')

const proto = grpc.load('./proto/protocol.proto')

const client = new proto.protocol.Packet('localhost:50051', grpc.credentials.createInsecure())

const conn = client.stream({
  version: 1,
  topic: 'test',
  event: 'join',
  reqId: 'test-001',
  connId: 'conn-001',
  data: Buffer.from('test')
})

conn.on('data', (data) => {
  console.log(data.version)
  console.log(data.topic)
  console.log(data.event)
  console.log(data.reqId)
  console.log(data.connId)
  console.log(data.cmd)
  console.log(data.data.toString('utf8'))
})
