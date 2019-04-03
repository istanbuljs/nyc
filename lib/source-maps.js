const convertSourceMap = require('convert-source-map')
const libCoverage = require('istanbul-lib-coverage')
const libSourceMaps = require('istanbul-lib-source-maps')
const fs = require('fs')
const path = require('path')

let sourceMapCache = libSourceMaps.createSourceMapStore()
function SourceMaps (opts) {
  this.cache = opts.cache
  this.cacheDirectory = opts.cacheDirectory
  this.loadedMaps = {}
  this._sourceMapCache = sourceMapCache
}

SourceMaps.prototype.extractAndRegister = function (code, filename, hash) {
  var sourceMap = convertSourceMap.fromSource(code) || convertSourceMap.fromMapFileSource(code, path.dirname(filename))
  if (sourceMap) {
    if (this.cache && hash) {
      var mapPath = path.join(this.cacheDirectory, hash + '.map')
      fs.writeFileSync(mapPath, sourceMap.toJSON())
    } else {
      this._sourceMapCache.registerMap(filename, sourceMap.sourcemap)
    }
  }
  return sourceMap
}

SourceMaps.prototype.remapCoverage = function (obj) {
  var transformed = this._sourceMapCache.transformCoverage(
    libCoverage.createCoverageMap(obj)
  )
  return transformed.map.data
}

SourceMaps.prototype.reloadCachedSourceMaps = function (report) {
  var _this = this
  Object.keys(report).forEach((absFile) => {
    var fileReport = report[absFile]
    if (fileReport && fileReport.contentHash) {
      var hash = fileReport.contentHash
      if (!(hash in _this.loadedMaps)) {
        try {
          var mapPath = path.join(_this.cacheDirectory, hash + '.map')
          _this.loadedMaps[hash] = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
        } catch (e) {
          // set to false to avoid repeatedly trying to load the map
          _this.loadedMaps[hash] = false
        }
      }
      if (_this.loadedMaps[hash]) {
        this._sourceMapCache.registerMap(absFile, _this.loadedMaps[hash])
      }
    }
  })
}

module.exports = SourceMaps
