var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8181 })
wss.on('connection', function (ws, req) {
  console.log('onconnection')
  // console.log(req)
  ws.on('message', function (message) {
    console.log('onmessage:', message)
    ws.send(message)
    // setTimeout(function() {
    //   wss.close(function() {
    //     console.log('close')
    //   })
    // }, 5000)
  })
  ws.on('close', function (code, reason) {
    console.log('onclose:', code, reason)
  })
  ws.on('error', function (error) {
    console.error('onerror:', error)
  })
})
console.log('ws://localhost:8181')