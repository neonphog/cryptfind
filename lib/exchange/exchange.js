'use strict'

/**
 * Class for handling downloading data from exchanges
 */
class Exchange {
  /**
   * initialize exchanges
   */
  constructor (config) {
    this.config = config
    let ex = this.exchanges = new Map()

    // load up all exchange modules as specified in config
    config.exchangeList.forEach((exchange) => {
      ex.set(exchange, new (require('./modules/' + exchange)._exchangeModule)())
    })
  }

  /**
   * fetch data from the various exchanges
   */
  fetch () {
    // poll all exchange modules
    let arr = []
    for (let ex of this.exchanges.values()) {
      arr.push(ex.fetch())
    }
    return Promise.all(arr)
  }
}

exports.Exchange = Exchange

