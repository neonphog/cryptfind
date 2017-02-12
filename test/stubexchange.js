'use strict'

class StubExchangeModule {
  fetch () {
    return new Promise((resolve, reject) => {
      resolve('test-data')
    })
  }
}

exports._exchangeModule = StubExchangeModule

