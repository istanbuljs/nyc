var _ = require('lodash')
var path = require('path')
var convertSourceMap = require('convert-source-map')
var SourceMapConsumer = require('source-map').SourceMapConsumer

function SourceMapCache (opts) {
  _.extend(this, {
    cache: {},
    cwd: process.env.NYC_CWD || process.cwd()
  }, opts)
}

SourceMapCache.prototype.add = function (filename, source) {
  var sourceMap = convertSourceMap.fromSource(source) || convertSourceMap.fromMapFileSource(source, path.dirname(filename))
  if (sourceMap) this.cache['./' + path.relative(this.cwd, filename)] = new SourceMapConsumer(sourceMap.sourcemap)
}

SourceMapCache.prototype.applySourceMaps = function (coverage) {
  var _this = this
  var mappedCoverage = _.cloneDeep(coverage)

  Object.keys(coverage).forEach(function (key) {
    var sourceMap = _this.cache[key]
    if (!sourceMap) {
      return
    }

    var fileCoverage = mappedCoverage[key]
    _this._rewritePath(mappedCoverage, fileCoverage, sourceMap)
    _this._rewriteStatements(fileCoverage, sourceMap)
    _this._rewriteFunctions(fileCoverage, sourceMap)
    _this._rewriteBranches(fileCoverage, sourceMap)
  })

  return mappedCoverage
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
  var start = null
  var end = null

  var s = {}
  var statementMap = {}
  var index = 1

  Object.keys(coverage.statementMap).forEach(function (k) {
    start = sourceMap.originalPositionFor({line: coverage.statementMap[k].start.line, column: coverage.statementMap[k].start.column})
    end = sourceMap.originalPositionFor({line: coverage.statementMap[k].end.line, column: coverage.statementMap[k].end.column})
    if (start.line && end.line) {
      s[index + ''] = coverage.s[k]
      statementMap[index + ''] = {
        start: {line: start.line, column: start.column},
        end: {line: end.line, column: end.column}
      }
      index++
    }
  })

  coverage.statementMap = statementMap
  coverage.s = s
}

SourceMapCache.prototype._rewriteFunctions = function (coverage, sourceMap) {
  var start = null
  var end = null
  var line = null

  var f = {}
  var fnMap = {}
  var index = 1

  Object.keys(coverage.fnMap).forEach(function (k) {
    start = sourceMap.originalPositionFor({line: coverage.fnMap[k].loc.start.line, column: coverage.fnMap[k].loc.start.column})
    end = sourceMap.originalPositionFor({line: coverage.fnMap[k].loc.end.line, column: coverage.fnMap[k].loc.end.column})
    line = sourceMap.originalPositionFor({line: coverage.fnMap[k].line, column: null})

    if (line.line && start.line && end.line) {
      f[index + ''] = coverage.f[k]
      fnMap[index + ''] = {
        name: coverage.fnMap[k].name,
        line: line.line,
        loc: {
          start: {line: start.line, column: start.column},
          end: {line: end.line, column: end.column}
        }
      }
      index++
    }
  })

  coverage.fnMap = fnMap
  coverage.f = f
}

SourceMapCache.prototype._rewriteBranches = function (coverage, sourceMap) {
  var start = null
  var end = null
  var line = null

  var b = {}
  var branchMap = {}
  var index = 1

  Object.keys(coverage.branchMap).forEach(function (k) {
    line = sourceMap.originalPositionFor({line: coverage.branchMap[k].line, column: null})
    if (line.line) {
      b[index + ''] = []
      branchMap[index + ''] = {
        line: line.line,
        type: coverage.branchMap[k].type,
        locations: []
      }
      for (var i = 0, location; (location = coverage.branchMap[k].locations[i]) !== undefined; i++) {
        start = sourceMap.originalPositionFor({line: location.start.line, column: location.start.column})
        end = sourceMap.originalPositionFor({line: location.end.line, column: location.end.column})
        if (start.line && end.line) {
          b[index + ''].push(coverage.b[k][i])
          branchMap[index + ''].locations.push({
            start: {source: location.source, line: start.line, column: start.column},
            end: {source: location.source, line: end.line, column: end.column}
          })
        }
      }
      index++
    }
  })

  coverage.branchMap = branchMap
  coverage.b = b
}

module.exports = SourceMapCache
