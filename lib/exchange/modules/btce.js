'use strict'

const https = require('https')

/**
 * Exchange data module for btce.com
 */
class BtcEModule {
  /**
   * Main fetch function
   * @return {Promise} result of exchange poll
   */
  fetch () {
    return new Promise((resolve, reject) => {
      this._fetch().then((res) => {
        resolve({exchange: 'btc-e.com', data: res})
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
        hostname: 'btc-e.com',
        path: '/api/3/ticker/dsh_btc-ltc_btc-eth_btc'
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
            let dash = data['dsh_btc']
            let ltc = data['ltc_btc']
            let eth = data['eth_btc']
            resolve([{
              'in': 'btc',
              'out': 'dash',
              'bid': parseFloat(dash.buy),
              'ask': parseFloat(dash.sell),
              'last': parseFloat(dash.last)
            }, {
              'in': 'btc',
              'out': 'ltc',
              'bid': parseFloat(ltc.buy),
              'ask': parseFloat(ltc.sell),
              'last': parseFloat(ltc.last)
            }, {
              'in': 'btc',
              'out': 'eth',
              'bid': parseFloat(eth.buy),
              'ask': parseFloat(eth.sell),
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

exports._exchangeModule = BtcEModule

