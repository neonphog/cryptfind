'use strict'

const http = require('http')

/**
 */
class Server {
  /**
   */
  constructor () {
    let serv = this.serv = http.createServer((request, response) => {
      response.writeHead(200, {'Content-Type': 'application/json'})
      response.end('{"funk":"yo"}', 'utf8')
    })
    this.sockets = []
    serv.on('connection', (socket) => {
      this.sockets.push(socket)
      socket.once('close', () => {
        this.sockets.splice(this.sockets.indexOf(socket), 1)
      })
    })
    serv.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    })
    serv.listen(8899)
  }

  /**
   * clean up for shutdown
   */
  destroy () {
    this.serv.close()
    for (let socket of this.sockets) {
      socket.destroy()
    }
    this.sockets = []
  }
}

exports.Server = Server

