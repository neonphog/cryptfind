'use strict'

const fs = require('fs')
const path = require('path')
const mimeDb = require('mime-db')
const mimeDbLookup = new Map()

for (let mime in mimeDb) {
  if (mimeDb[mime].extensions) {
    for (let ext of mimeDb[mime].extensions) {
      mimeDbLookup.set(ext, mime)
    }
  }
}

/**
 */
class DefaultServerHandler {
  /**
   */
  constructor () {
    this.path = path.resolve('./browser')
  }

  /**
   */
  request (url, request, response) {
    let filepath = path.resolve(this.path, './' + url.pathname)
    if (!filepath.startsWith(this.path)) {
      return false
    }
    if (filepath === this.path || filepath === this.path + '/') {
      filepath = path.resolve(filepath, './index.html')
    }
    try {
      let mime = mimeDbLookup.get(path.extname(filepath).slice(1)) ||
        'application/octet-stream'
      // TODO - read / write in chunks to bind memory
      let data = fs.readFileSync(filepath)
      response.writeHead(200, 'Ok', {'Content-Type': mime})
      response.end(data, 'utf8')
      console.log(`sent file ${filepath} ${mime}`)
      return true
    } catch (e) { /* pass */ }
    return false
  }
}

exports._serverHandler = DefaultServerHandler

