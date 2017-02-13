'use strict'

const https = require('https')

/**
 * Exchange data module for bleutrade.com
 */
class BleuTradeModule {
  /**
   * Main fetch function
   * @return {Promise} result of exchange poll
   */
  fetch () {
    return new Promise((resolve, reject) => {
      this._fetch().then((res) => {
        resolve({exchange: 'bleutrade.com', data: res})
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
        hostname: 'bleutrade.com',
        path: '/api/v2/public/getticker?market=ETH_BTC,LTC_BTC,DASH_BTC'
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
            let eth = data['result'][0]
            let ltc = data['result'][1]
            let dash = data['result'][2]
            resolve([{
              'in': 'btc',
              'out': 'dash',
              'bid': parseFloat(dash.Bid),
              'ask': parseFloat(dash.Ask),
              'last': parseFloat(dash.Last)
            }, {
              'in': 'btc',
              'out': 'ltc',
              'bid': parseFloat(ltc.Bid),
              'ask': parseFloat(ltc.Ask),
              'last': parseFloat(ltc.Last)
            }, {
              'in': 'btc',
              'out': 'eth',
              'bid': parseFloat(eth.Bid),
              'ask': parseFloat(eth.Ask),
              'last': parseFloat(eth.Last)
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

exports._exchangeModule = BleuTradeModule

