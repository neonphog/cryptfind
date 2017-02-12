'use strict'

/* global describe, before, after, it */

const http = require('http')
const fs = require('fs')
const assert = require('assert')
const Server = require('../lib/server/server').Server
const TESTPORT = 28989

/**
 * helper function for making an http request
 */
function verifyRequest (url, handler) {
  http.get(url, (res) => {
    res.setEncoding('utf8')
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      handler(res.statusCode, res.headers['content-type'], data)
    })
  })
}

exports.describe = () => {
  describe('Server Tests', () => {
    let inst

    before(() => {
      inst = new Server({
        port: TESTPORT
      }, {
        getAll: () => {
          return {
            a: [
              [1, [
                {in: 'btc', out: 'eth', last: 1},
                {in: 'btc', out: 'ltc', last: 10}
              ]],
              [2, [
                {in: 'btc', out: 'eth', last: 2},
                {in: 'btc', out: 'ltc', last: 20}
              ]],
              [3, [
                {in: 'btc', out: 'eth', last: 3},
                {in: 'btc', out: 'ltc', last: 30}
              ]]
            ],
            b: [
              [1, [
                {in: 'btc', out: 'eth', last: 1.1},
                {in: 'btc', out: 'ltc', last: 10.1}
              ]],
              [2, [
                {in: 'btc', out: 'eth', last: 2.1},
                {in: 'btc', out: 'ltc', last: 20.1}
              ]],
              [3, [
                {in: 'btc', out: 'eth', last: 3.1},
                {in: 'btc', out: 'ltc', last: 30.1}
              ]]
            ]
          }
        }
      })
    })

    after(() => {
      try {
        inst.destroy()
      } catch (e) { /* pass */ }
    })

    describe('DefaultHandler', () => {
      // test the static web server
      it('index', (done) => {
        verifyRequest('http://127.0.0.1:' + TESTPORT, (code, mime, data) => {
          assert.equal(code, 200)
          assert.equal(mime, 'text/html')

          let comp = fs.readFileSync('browser/index.html')
          assert.equal(data, comp)
          done()
        })
      })
    })

    // test the historyforpair api call
    describe('/api/v1/historyforpair', () => {
      let res
      before((done) => {
        verifyRequest('http://127.0.0.1:' + TESTPORT +
            '/api/v1/historyforpair?q=eth-btc&q=btc-eth', (
            code, mime, data) => {
          assert.equal(code, 200)
          assert.equal(mime, 'application/json')
          res = JSON.parse(data)
          done()
        })
      })

      it('direct', () => {
        assert.equal(res[0].a[0].last, 1)
      })

      it('invert', () => {
        assert.equal(res[1].a[1].last, 0.5)
      })
    })
  })
}

