'use strict'

/* global google XMLHttpRequest ActiveXObject */

// use google charts as our entrypoint
google.charts.load('current', {'packages': ['corechart']})
google.charts.setOnLoadCallback(() => {
  let client = new CfClient()
  client.init()
})

/**
 * This class encapsulates the client logic
 */
class CfClient {
  /**
   * fetch and bind html elements && trigger initial render
   */
  init () {
    // hide loading div
    let elemLoading = document.getElementById('loading')
    elemLoading.style.display = 'none'

    // show content div
    let elemContent = document.getElementById('content')
    elemContent.style.display = 'block'

    // get elements by ids and bind events
    this.elemAmount = document.getElementById('amount')
    this._bindGroup([this.elemAmount])

    this.radioFrom = {
      btc: document.getElementById('from_btc'),
      eth: document.getElementById('from_eth'),
      ltc: document.getElementById('from_ltc'),
      dash: document.getElementById('from_dsh')
    }
    this._bindGroup(this.radioFrom)

    this.radioTo = {
      btc: document.getElementById('to_btc'),
      eth: document.getElementById('to_eth'),
      ltc: document.getElementById('to_ltc'),
      dash: document.getElementById('to_dsh')
    }
    this._bindGroup(this.radioTo)

    this.resultsDiv = document.getElementById('results')

    // fetch the result elements for use as a template
    this.resultTemplate = this.resultsDiv.querySelector('.result').innerHTML

    // clear the template
    this._removeNodes(this.resultsDiv)

    // trigger initial render
    this._render()

    let resizeDebounce = null
    window.addEventListener('resize', () => {
      this._removeNodes(this.resultsDiv)

      clearTimeout(resizeDebounce)
      resizeDebounce = setTimeout(() => {
        this._render()
      }, 300)
    })
  }

  /**
   * Given an element, erase all its children
   * @private
   */
  _removeNodes (elem) {
    while (elem.childNodes.length) {
      elem.removeChild(elem.childNodes[0])
    }
  }

  /**
   * Using the previously fetched template, generate a results box
   * @private
   * @param {string} exchange - name of exchange
   * @param {string} quantity - value of coins after exchange
   * @return {Array} index 0 is result div, index 1 is chart div
   */
  _addResult (exchange, quantity) {
    let res = document.createElement('div')
    res.className = 'result'
    res.innerHTML = this.resultTemplate
    res.querySelector('.exchange').appendChild(
        document.createTextNode(exchange))
    res.querySelector('.quantity').appendChild(
        document.createTextNode(quantity))
    this.resultsDiv.appendChild(res)
    return [res, res.querySelector('.chart')]
  }

  /**
   * bind cange and input events to render from an object of html elements
   * @private
   * @param {Object} values are html elements
   */
  _bindGroup (group) {
    for (let key in group) {
      group[key].addEventListener('change', () => { this._render() }, false)
      group[key].addEventListener('input', () => { this._render() }, false)
    }
  }

  /**
   * For an object who's keys are radio buttons in a group, find the checked one
   * @private
   * @param {Object} values are html element radio buttons
   */
  _getChecked (group) {
    for (let key in group) {
      if (group[key].checked) {
        return key
      }
    }
  }

  /**
   * Make sure both radio button groups are sane, then trigger api fetch
   * @private
   */
  _render () {
    // if there isn't a checked item, check the first
    if (!this._getChecked(this.radioFrom)) {
      this.radioFrom['btc'].checked = true
    }
    let from = this._getChecked(this.radioFrom)

    let firstVis = null
    let hasChecked = false

    // sort through the second group, make sure none of them match
    // the selected one from the first group. make sure at least one
    // of the second group is checked
    for (let key in this.radioTo) {
      if (key === from) {
        this.radioTo[key].parentNode.style.display = 'none'
      } else {
        this.radioTo[key].parentNode.style.display = 'block'
        if (!firstVis) {
          firstVis = this.radioTo[key]
        }
        if (this.radioTo[key].checked) {
          hasChecked = true
        }
      }
    }

    // if the second group didn't have a visible and selected - select one
    if (!hasChecked) {
      firstVis.checked = true
    }

    // delete any previous result nodes
    this._removeNodes(this.resultsDiv)

    // make an api request given the selected options
    this._fetch(
        this._getChecked(this.radioFrom),
        this._getChecked(this.radioTo))
  }

  /**
   * Make an API request given two keys for a trading pair
   * @private
   * @param {string} fromcoin - first coin
   * @param {string} tocoin - second coin
   */
  _fetch (fromcoin, tocoin) {
    // get xhr instance
    let xhr = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP')

    // user indication
    this.resultsDiv.appendChild(document.createTextNode('fetching data...'))

    // on data recieved
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this._renderResponse(fromcoin, tocoin, JSON.parse(xhr.responseText))
      }
    }

    // send the request
    xhr.open('GET', '/api/v1/historyforpair?q=' + fromcoin + '-' + tocoin, true)
    xhr.send(null)
  }

  /**
   * Callback invoked when we receive api xhr data
   * We want to populate screen with result boxes
   *
   * @private
   * @param {string} fromcoin - first coin
   * @param {string} tocoin - second coin
   * @param {Object} data - data received from the request
   */
  _renderResponse (fromcoin, tocoin, data) {
    // clear the 'requesting data' indication
    this._removeNodes(this.resultsDiv)

    // we only made 1 `q=` request... use the first one
    data = data[0]

    // if we didn't get any data, tell the user
    if (!Object.keys(data).length) {
      this.resultsDiv.appendChild(document.createTextNode('no data found'))
      return
    }

    // build sort array && find global min / max for chart bounds
    let sortList = []
    let gmin = null
    let gmax = null
    for (let exchange in data) {
      let arr = data[exchange]
      sortList.push([exchange, arr, arr[arr.length - 1].last])
      for (let row of arr) {
        if (gmin === null || row.last < gmin) {
          gmin = row.last
        }
        if (gmax === null || row.last > gmax) {
          gmax = row.last
        }
      }
    }
    sortList.sort((a, b) => { return b[2] - a[2] })

    // loop through sorted data
    for (let item of sortList) {
      let exchange = item[0]
      let arr = item[1]
      let last = item[2]

      // create a result box for each exchange
      let resultEl, chartEl
      ;[resultEl, chartEl] = this._addResult(exchange,
          (parseFloat(this.elemAmount.value) * last) + ' ' + tocoin)
      item.push(resultEl)

      // create a new chart data table for this exchange
      let tab = new google.visualization.DataTable()
      tab.addColumn('datetime', 'Time')
      tab.addColumn('number', 'Price')

      // fill up the chart data table with data
      for (let row of arr) {
        tab.addRows([[new Date(row.time), row.last]])
      }

      // generate the chart
      let chart = new google.visualization.AreaChart(chartEl)
      chart.draw(tab, {
        width: chartEl.clientWidth,
        height: chartEl.clientHeight,
        hAxis: { textPosition: 'none' },
        vAxis: {
          viewWindowMode: 'explicit',
          viewWindow: {
            max: gmax,
            min: gmin
          }
        },
        legend: 'none'
      })
    }

    let best = sortList[0]
    let secondbest = sortList[1]

    // mark the best exchange result box- will be green in css
    best[3].classList.add('best')

    // let the user know how much better this exchange is
    let bestby = parseFloat(this.elemAmount.value) * (best[2] - secondbest[2])
    best[3].querySelector('.betterby').appendChild(
        document.createTextNode(`${bestby} ${tocoin} above next best`))
  }
}

