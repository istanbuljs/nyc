const archy = require('archy')
const libCoverage = require('istanbul-lib-coverage')
const uuid = require('uuid/v4')

function ProcessInfo (defaults) {
  defaults = defaults || {}

  this.uuid = null
  this.parent = null
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

  if (!this.uuid) {
    this.uuid = uuid()
  }
}

Object.defineProperty(ProcessInfo.prototype, 'label', {
  get: function () {
    if (this._label) {
      return this._label
    }

    var covInfo = ''
    if (this._coverageMap) {
      covInfo = '\n  ' + this._coverageMap.getCoverageSummary().lines.pct + ' % Lines'
    }
    return this.argv.join(' ') + covInfo
  }
})

ProcessInfo.buildProcessTree = function (infos) {
  const treeRoot = new ProcessInfo({ _label: 'nyc', nodes: [] })
  const index = infos.index
  for (const id in index.processes) {
    const node = infos[id]
    if (!node) {
      throw new Error(`Invalid entry in processinfo index: ${id}`)
    }
    const idx = index.processes[id]
    node.nodes = idx.children.map(id => infos[id]).sort((a, b) => a.time - b.time)
    if (!node.parent) {
      treeRoot.nodes.push(node)
    }
  }

  return treeRoot
}

ProcessInfo.prototype.getCoverageMap = function (merger) {
  if (this._coverageMap) {
    return this._coverageMap
  }

  var childMaps = this.nodes.map(function (child) {
    return child.getCoverageMap(merger)
  })

  this._coverageMap = merger([this.coverageFilename], childMaps)

  return this._coverageMap
}

ProcessInfo.prototype.render = function (nyc) {
  this.getCoverageMap(function (filenames, maps) {
    var map = libCoverage.createCoverageMap({})

    nyc.eachReport(filenames, function (report) {
      map.merge(report)
    })

    maps.forEach(function (otherMap) {
      map.merge(otherMap)
    })

    return map
  })

  return archy(this)
}

module.exports = ProcessInfo
