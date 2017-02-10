'use strict'

const fs = require('fs')
const path = require('path')
const mimeDb = require('mime-db')
const mimeDbLookup = new Map()

// mimeDb uses the mime as the key... we want the extensions to be the keys
for (let mime in mimeDb) {
  if (mimeDb[mime].extensions) {
    for (let ext of mimeDb[mime].extensions) {
      mimeDbLookup.set(ext, mime)
    }
  }
}

/**
 * Serve static files over http
 */
class DefaultServerHandler {
  /**
   * initialize
   */
  constructor () {
    this.path = path.resolve('./browser')
  }

  /**
   * handle an http request
   * @param {url} url - an already parsed nodejs url instance
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @return {boolean} `true` if handled
   */
  request (url, request, response) {
    let filepath = path.resolve(this.path, './' + url.pathname)

    // prevent jail-breaking our webroot
    if (!filepath.startsWith(this.path)) {
      return false
    }

    // if file is un-specified, use index.html
    if (filepath === this.path || filepath === this.path + '/') {
      filepath = path.resolve(filepath, './index.html')
    }

    try {
      // pick our mime response, or default to octet-stream
      let mime = mimeDbLookup.get(path.extname(filepath).slice(1)) ||
        'application/octet-stream'

      // TODO - read / write in chunks to bind memory
      let data = fs.readFileSync(filepath)
      response.writeHead(200, 'Ok', {'Content-Type': mime})
      response.end(data, 'utf8')

      // console.log(`sent file ${filepath} ${mime}`)

      return true
    } catch (e) { /* pass */ }

    return false
  }
}

exports._serverHandler = DefaultServerHandler

