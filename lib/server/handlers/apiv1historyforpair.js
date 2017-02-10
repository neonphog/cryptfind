'use strict'

/**
 * Handle the api request to get value history for a trading pair
 */
class ApiV1HistoryForPairHandler {
  /**
   * store a reference to the history cache
   */
  constructor (cache) {
    this.cache = cache
  }

  /**
   * handle an http request in the form
   * /api/v1/historyforpair?q=keyA-keyB&q=keyC-keyD&q=...
   *
   * @param {url} url - an already parsed nodejs url instance
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @return {boolean} `true` if handled
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

    // handle any number of `q=keyA-keyB` found on the query string
    for (let q of req) {
      resp.push(this._getData(q))
    }

    // write the response
    response.writeHead(200, 'Ok', {'Content-Type': 'application/json'})
    response.end(JSON.stringify(resp), 'utf8')

    return true
  }

  /**
   * Format history data for a specific trading pair, inverting if needed
   * @private
   * @param {string} q - the hyphen-separated coin keys to inspect
   */
  _getData (q) {
    // from q=keyA-keyB, incoin = keyA, outcoin = keyB
    let outcoin = q.split('-')
    let incoin = outcoin[0]
    outcoin = outcoin[1]

    // sort through all history data, pulling out what matches the two coins
    let out = {}
    for (let exchange in this.dataRef) {
      let arr = this.dataRef[exchange]
      for (let [time, data] of arr) {
        for (let rate of data) {
          if (rate.in === incoin && rate.out === outcoin) {
            if (!(exchange in out)) {
              out[exchange] = []
            }
            // we need to invert this one
            out[exchange].push({time: time, last: 1 / rate.last})
          } else if (rate.out === incoin && rate.in === outcoin) {
            if (!(exchange in out)) {
              out[exchange] = []
            }
            // this one is as-stored in our cache
            out[exchange].push({time: time, last: rate.last})
          }
        }
      }
    }

    return out
  }
}

exports._serverHandler = ApiV1HistoryForPairHandler

