var convertSourceMap = require('convert-source-map')
var libCoverage = require('istanbul-lib-coverage')
var libSourceMaps = require('istanbul-lib-source-maps')
var fs = require('fs')
var path = require('path')

// TODO: write unit tests for source-maps,
function SourceMaps (opts) {
  this.cacheDir = opts.cacheDir
  this.sourceMapCache = libSourceMaps.createSourceMapStore()
  this.loadedMaps = {}
}

SourceMaps.prototype.extractAndRegister = function (code, hash, filename) {
  var sourceMap = convertSourceMap.fromSource(code) || convertSourceMap.fromMapFileSource(code, path.dirname(filename))
  if (sourceMap) {
    if (hash) {
      var mapPath = path.join(this.cacheDir, hash + '.map')
      fs.writeFileSync(mapPath, sourceMap.toJSON())
    } else {
      this.sourceMapCache.registerMap(filename, sourceMap.sourcemap)
    }
  }
  return sourceMap
}

SourceMaps.prototype.remapCoverage = function (obj) {
  var transformed = this.sourceMapCache.transformCoverage(
    libCoverage.createCoverageMap(obj)
  )
  return transformed.map.data
}

SourceMaps.prototype.reloadCachedSourceMaps = function (report) {
  var _this = this
  Object.keys(report).forEach(function (absFile) {
    var fileReport = report[absFile]
    if (fileReport && fileReport.contentHash) {
      var hash = fileReport.contentHash
      if (!(hash in _this.loadedMaps)) {
        try {
          var mapPath = path.join(_this.cacheDir, hash + '.map')
          _this.loadedMaps[hash] = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
        } catch (e) {
          // set to false to avoid repeatedly trying to load the map
          _this.loadedMaps[hash] = false
        }
      }
      if (_this.loadedMaps[hash]) {
        _this.sourceMapCache.registerMap(absFile, _this.loadedMaps[hash])
      }
    }
  })
}

module.exports = SourceMaps
