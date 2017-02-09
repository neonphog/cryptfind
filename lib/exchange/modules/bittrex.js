'use strict'

const https = require('https')

/**
 * Exchange data module for bittrex.com
 */
class BittrexModule {
  /**
   */
  fetch () {
    return new Promise((resolve, reject) => {
      Promise.all([
        this._fetch('btc', 'eth'),
        this._fetch('btc', 'ltc'),
        this._fetch('btc', 'dash')
      ]).then((res) => {
        resolve({exchange: 'bittrex.com', data: res})
      }, (err) => {
        reject(err)
      })
    })
  }

  /**
   */
  _fetch (incoin, outcoin) {
    return new Promise((resolve, reject) => {
      let req = https.request({
        hostname: 'bittrex.com',
        path: `/api/v1.1/public/getticker?market=${incoin}-${outcoin}`
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
          resolve({
            'in': incoin,
            'out': outcoin,
            'bid': data.result.Bid,
            'ask': data.result.Ask,
            'last': data.result.Last
          })
        })
      })
      req.on('error', (err) => {
        reject(err)
      })
      req.end()
    })
  }
}

exports._exchangeModule = BittrexModule

