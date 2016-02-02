var path = require('path')
var SourceMapConsumer = require('source-map').SourceMapConsumer

function SourceMapCache () {
  this.cache = {}
}

SourceMapCache.prototype.addMap = function (relFile, map) {
  this.cache[relFile] = new SourceMapConsumer(map)
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

// Istanbul occasionally reports invalid positions. Correct them before they're
// fed to the source-map consumer.
function clampPosition (pos) {
  var line = pos.line
  var column = pos.column
  return {
    // According to
    // <https://github.com/gotwarlost/istanbul/blob/d919f7355027e3c213aa81af5464962d9dc8350b/coverage.json.md#location-objects>
    // lines start at 1 and columns at 0.
    line: Math.max(1, line),
    column: Math.max(0, column)
  }
}

// Maps the coverage location based on the source map. Adapted from getMapping()
// in remap-istanbul:
// <https://github.com/SitePen/remap-istanbul/blob/30b67ad3f24ba7e0da8b8888d5a7c3c8480d48b2/lib/remap.js#L55:L108>.
function mapLocation (sourceMap, location) {
  var clampedStart = clampPosition(location.start)
  var clampedEnd = clampPosition(location.end)

  var start = sourceMap.originalPositionFor(clampedStart)
  var end = sourceMap.originalPositionFor(clampedEnd)

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
      line: clampedEnd.line,
      column: clampedEnd.column,
      bias: 2
    })
    end.column = end.column - 1
  }

  var mapped = {
    start: {
      line: start.line,
      column: start.column
    },
    end: {
      line: end.line,
      column: end.column
    }
  }
  if (location.skip === true) {
    mapped.skip = true
  }
  return mapped
}

SourceMapCache.prototype._rewritePath = function (report, fileReport, sourceMap) {
  // only rewrite the path if the file comes from a single source
  if (sourceMap.sources.length !== 1) return

  var originalPath = './' + path.join(path.dirname(fileReport.path), sourceMap.sources[0])

  report[fileReport.path] = undefined // Hack for Windows tests, until we can normalize paths.
  delete report[fileReport.path]

  fileReport.path = originalPath
  report[originalPath] = fileReport
}

SourceMapCache.prototype._rewriteStatements = function (fileReport, sourceMap) {
  var s = {}
  var statementMap = {}
  var index = 1

  Object.keys(fileReport.statementMap).forEach(function (k) {
    var mapped = mapLocation(sourceMap, fileReport.statementMap[k])
    if (mapped) {
      s[index + ''] = fileReport.s[k]
      statementMap[index + ''] = mapped
      index++
    }
  })

  fileReport.statementMap = statementMap
  fileReport.s = s
}

SourceMapCache.prototype._rewriteFunctions = function (fileReport, sourceMap) {
  var f = {}
  var fnMap = {}
  var index = 1

  Object.keys(fileReport.fnMap).forEach(function (k) {
    var item = fileReport.fnMap[k]
    var mapped = mapLocation(sourceMap, item.loc)
    if (mapped) {
      f[index + ''] = fileReport.f[k]
      fnMap[index + ''] = {
        name: item.name,
        line: mapped.start.line,
        loc: mapped
      }
      if (item.skip === true) {
        fnMap[index + ''].skip = true
      }
      index++
    }
  })

  fileReport.fnMap = fnMap
  fileReport.f = f
}

SourceMapCache.prototype._rewriteBranches = function (fileReport, sourceMap) {
  var b = {}
  var branchMap = {}
  var index = 1

  Object.keys(fileReport.branchMap).forEach(function (k) {
    var item = fileReport.branchMap[k]
    var locations = []

    item.locations.every(function (location) {
      var mapped = mapLocation(sourceMap, location)
      if (mapped) {
        locations.push(mapped)
        return true
      }
    })

    if (locations.length > 0) {
      b[index + ''] = fileReport.b[k]
      branchMap[index + ''] = {
        line: locations[0].start.line,
        type: item.type,
        locations: locations
      }

      index++
    }
  })

  fileReport.branchMap = branchMap
  fileReport.b = b
}

module.exports = SourceMapCache
