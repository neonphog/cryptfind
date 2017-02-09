'use strict'

const https = require('https')

/**
 * Exchange data module for bittrex.com
 */
class BtcEModule {
  /**
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
          data = JSON.parse(data)
          let dash = data['dsh_btc']
          let ltc = data['ltc_btc']
          let eth = data['eth_btc']
          resolve([{
            'in': 'btc',
            'out': 'dash',
            'bid': dash.buy,
            'ask': dash.sell,
            'last': dash.last
          }, {
            'in': 'btc',
            'out': 'ltc',
            'bid': ltc.buy,
            'ask': ltc.sell,
            'last': ltc.last
          }, {
            'in': 'btc',
            'out': 'eth',
            'bid': eth.buy,
            'ask': eth.sell,
            'last': eth.last
          }])
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

