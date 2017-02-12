'use strict'

/* global describe, before, it */

const assert = require('assert')
const Exchange = require('../lib/exchange/exchange').Exchange

exports.describe = () => {
  describe('Exchange Tests', () => {
    let inst

    before(() => {
      inst = new Exchange({
        exchangeList: [
          '../../../test/stubexchange'
        ]
      })
    })

    // test the exchange module loading
    it('load stub module', (done) => {
      inst.fetch().then((res) => {
        assert.equal(res, 'test-data')
        done()
      }, (err) => {
        throw new Error(err)
      })
    })
  })
}

