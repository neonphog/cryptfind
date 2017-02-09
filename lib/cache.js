'use strict'

const fs = require('fs')

/**
 * Disk cache for historical data
 */
class Cache {
  /**
   * initialization
   */
  constructor (cacheFile) {
    this.cacheFile = cacheFile || '.cryptfindcache'

    this.data = []
    try {
      this.data = JSON.parse(
        fs.readFileSync(this.cacheFile, {encoding: 'utf8'}))
    } catch (e) { /* pass */ }

    this._index()

    this._intervalId = setInterval(() => { this.sync() }, 5000)
  }

  /**
   * allow the server to close
   */
  destroy () {
    clearInterval(this._intervalId)
  }

  /**
   * if data has changed, sync to disk
   */
  sync () {
    if (!this.dirty) {
      return
    }
    fs.writeFile(
      this.cacheFile,
      JSON.stringify(this.data, null, '  '),
      'utf8',
      (err) => {
        if (err) {
          console.error(err)
          return
        }
        this.dirty = false
      })
  }

  /**
   * Add a new data entry
   */
  add (timestamp, data) {
    this.data.push([timestamp, data])
    this._index()
  }

  /**
   * Get the most recent data
   */
  getRecent () {
    return this.data.get(this.keys[this.keys.length - 1])
  }

  /**
   * Get all data
   */
  getAll () {
    return this.data
  }

  /**
   * throw away things that are too old
   */
  _index () {
    this.dirty = true
    this.data.splice(0, this.data.length - 200)
  }
}

exports.Cache = Cache

