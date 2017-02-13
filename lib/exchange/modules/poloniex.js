'use strict'

const https = require('https')

/**
 * Exchange data module for poloniex.com
 */
class PoloniexModule {
  /**
   * Main fetch function
   * @return {Promise} result of exchange poll
   */
  fetch () {
    return new Promise((resolve, reject) => {
      this._fetch().then((res) => {
        resolve({exchange: 'poloniex.com', data: res})
      }, (err) => {
        reject(err)
      })
    })
  }

  /**
   * Fetch all trading pairs
   * @private
   * @return {Promise} result of poll
   */
  _fetch () {
    return new Promise((resolve, reject) => {
      let req = https.request({
        hostname: 'poloniex.com',
        path: '/public?command=returnTicker'
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(`bad status: ${res.statusCode}`)
          return
        }
        res.setEncoding('utf8')
        let data = ''
        res.on('data', (d) => {
          data += d
        })
        res.on('end', () => {
          try {
            data = JSON.parse(data)
            let eth = data['BTC_ETH']
            let ltc = data['BTC_LTC']
            let dash = data['BTC_DASH']
            resolve([{
              'in': 'btc',
              'out': 'dash',
              'bid': parseFloat(dash.highestBid),
              'ask': parseFloat(dash.lowestAsk),
              'last': parseFloat(dash.last)
            }, {
              'in': 'btc',
              'out': 'ltc',
              'bid': parseFloat(ltc.highestBid),
              'ask': parseFloat(ltc.lowestAsk),
              'last': parseFloat(ltc.last)
            }, {
              'in': 'btc',
              'out': 'eth',
              'bid': parseFloat(eth.highestBid),
              'ask': parseFloat(eth.lowestAsk),
              'last': parseFloat(eth.last)
            }])
          } catch (e) {
            reject(e)
          }
        })
      })
      req.on('error', (err) => {
        reject(err)
      })
      req.end()
    })
  }
}

exports._exchangeModule = PoloniexModule

