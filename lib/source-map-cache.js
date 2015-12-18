var _ = require('lodash')
var path = require('path')
var convertSourceMap = require('convert-source-map')
var SourceMapConsumer = require('source-map').SourceMapConsumer

function SourceMapCache (opts) {
  if (!(this instanceof SourceMapCache)) {
    return new SourceMapCache(opts)
  }
  _.extend(this, {
    cache: {},
    cwd: process.env.NYC_CWD || process.cwd()
  }, opts)
}

SourceMapCache.prototype.add = function (filename, source) {
  var sourceMap = convertSourceMap.fromSource(source) || convertSourceMap.fromMapFileSource(source, path.dirname(filename))
  if (sourceMap) this.cache['./' + path.relative(this.cwd, filename)] = new SourceMapConsumer(sourceMap.sourcemap)
}

SourceMapCache.prototype.addMap = function (relFile, mapJson) {
  this.cache[relFile] = new SourceMapConsumer(JSON.parse(mapJson))
}

SourceMapCache.prototype.applySourceMaps = function (report) {
  var _this = this

  Object.keys(report).forEach(function (relFile) {
    var sourceMap = _this.cache[relFile]
    if (!sourceMap) {
      return
    }

    var fileReport = report[relFile]
    _this._rewritePath(report, fileReport, sourceMap)
    _this._rewriteStatements(fileReport, sourceMap)
    _this._rewriteFunctions(fileReport, sourceMap)
    _this._rewriteBranches(fileReport, sourceMap)
  })
}

// Maps the coverage location based on the source map. Adapted from getMapping()
// in remap-istanbul:
// <https://github.com/SitePen/remap-istanbul/blob/30b67ad3f24ba7e0da8b8888d5a7c3c8480d48b2/lib/remap.js#L55:L108>.
function mapLocation (sourceMap, location) {
  var start = sourceMap.originalPositionFor(location.start)
  var end = sourceMap.originalPositionFor(location.end)

  /* istanbul ignore if: edge case too hard to test for */
  if (!start || !end) {
    return null
  }
  if (!start.source || !end.source || start.source !== end.source) {
    return null
  }
  /* istanbul ignore if: edge case too hard to test for */
  if (start.line === null || start.column === null) {
    return null
  }
  /* istanbul ignore if: edge case too hard to test for */
  if (end.line === null || end.column === null) {
    return null
  }

  if (start.line === end.line && start.column === end.column) {
    end = sourceMap.originalPositionFor({
      line: location.end.line,
      column: location.end.column,
      bias: 2
    })
    end.column = end.column - 1
  }

  return {
    start: {
      line: start.line,
      column: start.column
    },
    end: {
      line: end.line,
      column: end.column
    },
    skip: location.skip
  }
}

SourceMapCache.prototype._rewritePath = function (mappedCoverage, coverage, sourceMap) {
  // only rewrite the path if the file comes from a single source
  if (sourceMap.sources.length !== 1) return

  var originalPath = './' + path.join(path.dirname(coverage.path), sourceMap.sources[0])
  delete mappedCoverage[coverage.path]
  coverage.path = originalPath
  mappedCoverage[originalPath] = coverage
}

SourceMapCache.prototype._rewriteStatements = function (coverage, sourceMap) {
  var s = {}
  var statementMap = {}
  var index = 1

  Object.keys(coverage.statementMap).forEach(function (k) {
    var mapped = mapLocation(sourceMap, coverage.statementMap[k])
    if (mapped) {
      s[index + ''] = coverage.s[k]
      statementMap[index + ''] = mapped
      index++
    }
  })

  coverage.statementMap = statementMap
  coverage.s = s
}

SourceMapCache.prototype._rewriteFunctions = function (coverage, sourceMap) {
  var f = {}
  var fnMap = {}
  var index = 1

  Object.keys(coverage.fnMap).forEach(function (k) {
    var mapped = mapLocation(sourceMap, coverage.fnMap[k].loc)
    if (mapped) {
      f[index + ''] = coverage.f[k]
      fnMap[index + ''] = {
        name: coverage.fnMap[k].name,
        line: mapped.start.line,
        loc: mapped
      }
      index++
    }
  })

  coverage.fnMap = fnMap
  coverage.f = f
}

SourceMapCache.prototype._rewriteBranches = function (coverage, sourceMap) {
  var b = {}
  var branchMap = {}
  var index = 1

  Object.keys(coverage.branchMap).forEach(function (k) {
    var item = coverage.branchMap[k]
    var locations = []

    item.locations.every(function (location) {
      var mapped = mapLocation(sourceMap, location)
      if (mapped) {
        locations.push(mapped)
        return true
      }
    })

    if (locations.length > 0) {
      b[index + ''] = coverage.b[k]
      branchMap[index + ''] = {
        line: locations[0].start.line,
        type: item.type,
        locations: locations
      }

      index++
    }
  })

  coverage.branchMap = branchMap
  coverage.b = b
}

module.exports = SourceMapCache
