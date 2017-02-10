'use strict'

/* global google XMLHttpRequest ActiveXObject */

// use google charts as our entrypoint
google.charts.load('current', {'packages': ['corechart']})
google.charts.setOnLoadCallback(() => {
  let client = new CfClient()
  client.init()
})

/**
 */
class CfClient {
  /**
   */
  init () {
    let elemLoading = document.getElementById('loading')
    elemLoading.style.display = 'none'

    let elemContent = document.getElementById('content')
    elemContent.style.display = 'block'

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

    this.resultTemplate = this.resultsDiv.querySelector('.result').innerHTML
    this._removeNodes(this.resultsDiv)

    this._render()
  }

  /**
   */
  _removeNodes (elem) {
    while (elem.childNodes.length) {
      elem.removeChild(elem.childNodes[0])
    }
  }

  /**
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
   */
  _bindGroup (group) {
    for (let key in group) {
      group[key].addEventListener('change', () => { this._render() }, false)
      group[key].addEventListener('input', () => { this._render() }, false)
    }
  }

  /**
   */
  _getChecked (group) {
    for (let key in group) {
      if (group[key].checked) {
        return key
      }
    }
  }

  /**
   */
  _render () {
    if (!this._getChecked(this.radioFrom)) {
      this.radioFrom['btc'].checked = true
    }
    let from = this._getChecked(this.radioFrom)
    let firstVis = null
    let hasChecked = false
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
    if (!hasChecked) {
      firstVis.checked = true
    }

    this._removeNodes(this.resultsDiv)

    this._fetch(
        this._getChecked(this.radioFrom),
        this._getChecked(this.radioTo))
  }

  /**
   */
  _fetch (fromcoin, tocoin) {
    let xhr = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP')

    this.resultsDiv.appendChild(document.createTextNode('fetching data...'))
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this._renderResponse(fromcoin, tocoin, JSON.parse(xhr.responseText))
      }
    }
    xhr.open('GET', '/api/v1?q=' + fromcoin + '-' + tocoin, true)
    xhr.send(null)
  }

  /**
   */
  _renderResponse (fromcoin, tocoin, data) {
    this._removeNodes(this.resultsDiv)
    let last = data[0][data[0].length - 1]

    if (!last) {
      this.resultsDiv.appendChild(document.createTextNode('no data found'))
      return
    }

    let maxList = []
    for (let item of last[1]) {
      let resultEl, chartEl
      [resultEl, chartEl] = this._addResult(item.exchange,
          (parseFloat(this.elemAmount.value) * item.last) + ' ' + tocoin)
      maxList.push([item.last, resultEl])

      let tab = new google.visualization.DataTable()
      tab.addColumn('datetime', 'Time')
      tab.addColumn('number', 'Price')

      for (let row of data[0]) {
        let time = row[0]
        for (let exch of row[1]) {
          if (exch.exchange !== item.exchange) {
            continue
          }
          tab.addRows([[new Date(time), exch.last]])
        }
      }

      let chart = new google.visualization.AreaChart(chartEl)
      chart.draw(tab, {
      })
    }

    maxList.sort((a, b) => { return b[0] - a[0] })
    let best = maxList[0]
    let secondbest = maxList[1]
    best[1].classList.add('best')
    let p = best[1].parentNode
    p.removeChild(best[1])
    p.insertBefore(best[1], p.childNodes[0])
    let bestby = parseFloat(this.elemAmount.value) * (best[0] - secondbest[0])
    best[1].querySelector('.betterby').appendChild(
        document.createTextNode(`${bestby} ${tocoin} better`))
  }
}

