'use strict'

const fs = require('fs')

/**
 * Disk cache for historical data
 *  - keeps data in memory
 *  - periodically trims old data
 *  - periodically syncs to disk
 */
class Cache {
  /**
   * initialization
   */
  constructor (config) {
    this.config = config
    this.data = {}

    // try to load from disk file, otherwise start clean
    try {
      this.data = JSON.parse(
        fs.readFileSync(config.cacheFileName, {encoding: 'utf8'}))
    } catch (e) { /* pass */ }

    // if we somehow synced too many entries to disk, clean them up now
    this._cleanup()

    // set up our periodic disk sync
    this._intervalId = setInterval(() => {
      this.sync()
    }, config.diskSyncFrequency)
  }

  /**
   * allow the server to close
   */
  destroy () {
    // stop the sync timer so we can shut down
    clearInterval(this._intervalId)
  }

  /**
   * if data has changed, sync to disk
   */
  sync () {
    if (!this.dirty) {
      return
    }
    let fh = fs.openSync(this.config.cacheFileName, 'w')
    fs.writeSync(fh, JSON.stringify(this.data, null, '  '), 0, 'utf8')
    fs.fsyncSync(fh)
    fs.closeSync(fh)
    this.dirty = false
  }

  /**
   * Add a new data entry
   */
  add (timestamp, data) {
    for (let item of data) {
      if (!(item.exchange in this.data)) {
        this.data[item.exchange] = []
      }
      this.data[item.exchange].push([timestamp, item.data])
    }
    this._cleanup()
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
  _cleanup () {
    this.dirty = true
    for (let exchange in this.data) {
      let arr = this.data[exchange]
      arr.splice(0, arr.length - this.config.keepCount)
    }
  }
}

exports.Cache = Cache

