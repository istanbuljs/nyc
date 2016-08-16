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

  for (var key in defaults) {
    this[key] = defaults[key]
  }
}

ProcessInfo.renderProcessTree = function (infos) {
  var treeRoot = { label: 'nyc', nodes: [] }
  var nodes = { }

  infos = infos.sort(function (a, b) {
    return a.time - b.time
  })

  infos.forEach(function (p) {
    nodes[p.root + ':' + p.pid] = p
    p.nodes = [] // list of children
    p.label = p.argv.join(' ')
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

  return archy(treeRoot)
}

module.exports = ProcessInfo
