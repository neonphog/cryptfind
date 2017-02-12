'use strict'

/* global describe, before, after, it */

const fs = require('fs')
const assert = require('assert')
const Cache = require('../lib/cache').Cache
const TESTFILE = '.mochatestcache'

exports.describe = () => {
  describe('Cache Tests', () => {
    let inst

    before(() => {
      inst = new Cache({
        cacheFileName: TESTFILE,
        keepCount: 2
      })
      inst.add(1, [{exchange: 'e', data: 'test1'}])
      inst.add(2, [{exchange: 'e', data: 'test2'}])
      inst.add(3, [{exchange: 'e', data: 'test3'}])
    })

    after(() => {
      inst.destroy()
      fs.unlink(TESTFILE)
    })

    // test to make sure cache removes old entries
    it('cleanup', () => {
      let data = inst.getAll()
      assert.equal(data['e'].length, 2)
    })

    // test to make sure cache syncs to disk
    it('filesync', () => {
      inst.sync()
      let data = fs.readFileSync(TESTFILE)
      data = JSON.parse(data)
      assert.equal(data['e'].length, 2)
    })
  })
}

