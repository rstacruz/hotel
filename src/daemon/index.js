let express = require('express')
let conf = require('../conf')

let app = require('express')()
let server = require('http').Server(app)
let io = require('socket.io')(server)

let servers = require('./server-group')()
let router = require('./router')(servers)

// Start server
server.listen(conf.port, conf.host, function () {
  console.log(`Server listening on port ${conf.host}:${conf.port}`)
})

// Add ./public
app.use(express.static(`${__dirname}/public`))
app.use(router)

// Socket.io real-time updates
io.on('connection', function (socket) {
  console.log('Socket.io connection')

  function emitChange () {
    socket.emit('change', { monitors: servers.list() })
  }

  servers.on('change', emitChange)
  emitChange()

  socket.on('stop', id => servers.stop(id))
  socket.on('start', id => servers.start(id))
})
