'use strict'

/**
 * Class for handling downloading data from exchanges
 */
class Exchange {
  /**
   * initialize exchanges
   */
  constructor () {
    let ex = this.exchanges = new Map()

    ex.set('bittrex', new (require('./modules/bittrex')._exchangeModule)())
    ex.set('btce', new (require('./modules/btce')._exchangeModule)())
  }

  /**
   * fetch data from the various exchanges
   */
  fetch () {
    let arr = []
    for (let ex of this.exchanges.values()) {
      arr.push(ex.fetch())
    }
    return Promise.all(arr)
  }
}

exports.Exchange = Exchange

