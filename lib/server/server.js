'use strict'

const http = require('http')
const url = require('url')
const DefaultServerHandler = require('./handlers/default')._serverHandler
const ApiV1Handler = require('./handlers/apiv1')._serverHandler

/**
 */
class Server {
  /**
   */
  constructor (cache) {
    let defaultHandler = new DefaultServerHandler()
    let handlers = [
      ['/api/v1', new ApiV1Handler(cache)]
    ]

    let serv = this.serv = http.createServer((request, response) => {
      let u = url.parse(request.url, true)
      let handled = false
      for (let pair of handlers) {
        if (u.pathname.startsWith(pair[0])) {
          handled = pair[1].request(u, request, response)
        }
        if (handled) { break }
      }
      if (!handled) {
        handled = defaultHandler.request(u, request, response)
      }
      if (!handled) {
        response.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'})
        response.end('404 Not Found', 'utf8')
      }
    })
    this.sockets = []
    serv.on('connection', (socket) => {
      this.sockets.push(socket)
      socket.once('close', () => {
        this.sockets.splice(this.sockets.indexOf(socket), 1)
      })
    })
    serv.on('clientError', (err, socket) => {
      if (err) {
        socket.end(`HTTP/1.1 400 ${err}\r\n\r\n`)
      } else {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      }
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

