'use strict'
var archy = require('archy')

function ProcessInfo (defaults) {
  defaults = defaults || {}

  this.pid = String(process.pid)
  this.argv = process.argv
  this.execArgv = process.execArgv
  this.cwd = process.cwd()
  this.time = Date.now()
  this.ppid = null
  this.root = null
  this.coverageFilename = null
  this.nodes = [] // list of children, filled by buildProcessTree()

  for (var key in defaults) {
    this[key] = defaults[key]
  }
}

Object.defineProperty(ProcessInfo.prototype, 'label', {
  get: function () {
    if (this._label) {
      return this._label
    }

    return this.argv.join(' ')
  }
})

ProcessInfo.buildProcessTree = function (infos) {
  var treeRoot = new ProcessInfo({ _label: 'nyc' })
  var nodes = { }

  infos = infos.sort(function (a, b) {
    return a.time - b.time
  })

  infos.forEach(function (p) {
    nodes[p.root + ':' + p.pid] = p
  })

  infos.forEach(function (p) {
    if (!p.ppid) {
      return
    }

    var parent = nodes[p.root + ':' + p.ppid]
    if (!parent) {
      parent = treeRoot
    }

    parent.nodes.push(p)
  })

  return treeRoot
}

ProcessInfo.prototype.render = function () {
  return archy(this)
}

module.exports = ProcessInfo
