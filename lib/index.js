const os = require('os')

const grpc = require('grpc')

const proto = grpc.load(`${__dirname}/../proto/protocol.proto`)

const Request = require('./request')
const Response = require('./response')

const PORT = process.env._FUNC_SERVER_PORT

const server = new grpc.Server()

exports.start = function (handler) {
  server.addService(proto.protocol.Packet.service, {
    stream: async (conn) => {
      const req = new Request(conn.request)
      const res = new Response(conn)

      try {
        await handler(req, res)
      } catch (err) {
        console.log(err)
      } finally {
        res.close()
      }
    },
    heartbeat: (conn) => {
      conn.on('data', (data) => {
        console.log(data)
        conn.write('pong')
      })
      conn.on('error', (err) => {
        console.log('ERROR:', err)
      })
      conn.write('ping')
    }
  })
  server.bind(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure())
  server.start()
}

process.on('SIGTERM', () => {
  server.tryShutdown(() => {
    console.log('shutdown:', os.hostname())
  })
})
