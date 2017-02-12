'use strict'

/* global describe */

const cache = require('./cache')
const server = require('./server')
const exchange = require('./exchange')

describe('CryptFind Test Suite', () => {
  cache.describe()
  server.describe()
  exchange.describe()
})

