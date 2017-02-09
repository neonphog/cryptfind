'use strict'

/**
 */
class ApiV1Handler {
  /**
   */
  constructor (cache) {
    this.cache = cache
  }

  /**
   */
  request (url, request, response) {
    let resp = []

    let req = url.query['q']
    if (!req) {
      req = []
    } else if (!Array.isArray(req)) {
      req = [req]
    }

    this.dataRef = this.cache.getAll()

    for (let q of req) {
      resp.push(this._getData(q))
    }

    response.writeHead(200, 'Ok', {'Content-Type': 'application/json'})
    response.end(JSON.stringify(resp), 'utf8')

    return true
  }

  /**
   */
  _getData (q) {
    let outcoin = q.split('-')
    let incoin = outcoin[0]
    outcoin = outcoin[1]

    let out = []
    for (let [time, data] of this.dataRef) {
      let exout = null
      for (let item of data) {
        for (let rate of item.data) {
          if (rate.in === incoin && rate.out === outcoin) {
            if (!exout) {
              exout = [time, []]
            }
            exout[1].push({exchange: item.exchange, last: 1/rate.last})
          } else if (rate.out === incoin && rate.in === outcoin) {
            if (!exout) {
              exout = [time, []]
            }
            exout[1].push({exchange: item.exchange, last: rate.last})
          }
        }
      }
      if (exout) {
        out.push(exout)
      }
    }
    return out
  }
}

exports._serverHandler = ApiV1Handler

