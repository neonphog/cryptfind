'use strict'

const http = require('http')
const url = require('url')
const DefaultServerHandler = require('./handlers/default')._serverHandler
const ApiV1HistoryForPairHandler =
  require('./handlers/apiv1historyforpair')._serverHandler

/**
 * Combination web and api http server
 */
class Server {
  /**
   * Server currently set up within constructor
   */
  constructor (config, cache) {
    this.config = config

    // these are api handlers, and will be invoked in sequence
    // if the pathname matches
    let handlers = [
      ['/api/v1/historyforpair', new ApiV1HistoryForPairHandler(cache)]
    ]

    // default handler is our web server
    // and fallback if none of the above handlers return true
    // serving static files out of 'browser' directory
    let defaultHandler = new DefaultServerHandler()

    // create the webserver
    let serv = this.serv = http.createServer((request, response) => {
      // parse the request url
      let u = url.parse(request.url, true)

      let handled = false

      // iterate through handlers to see if anyone claims this request
      for (let pair of handlers) {
        if (u.pathname.startsWith(pair[0])) {
          handled = pair[1].request(u, request, response)
        }
        if (handled) { break }
      }

      // if still unhandled, try the default handler
      if (!handled) {
        handled = defaultHandler.request(u, request, response)
      }

      // if still unhandled, return a 404
      if (!handled) {
        response.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'})
        response.end('404 Not Found', 'utf8')
      }
    })

    // keep track of open sockets so we can shut down
    // immediately on ctrl-c
    this.sockets = []
    serv.on('connection', (socket) => {
      this.sockets.push(socket)
      socket.once('close', () => {
        this.sockets.splice(this.sockets.indexOf(socket), 1)
      })
    })

    // some sort of socket issue
    serv.on('clientError', (err, socket) => {
      if (err) {
        socket.end(`HTTP/1.1 400 ${err}\r\n\r\n`)
      } else {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      }
    })

    // listen on the configured port
    serv.listen(this.config.port)
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

