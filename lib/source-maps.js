const convertSourceMap = require('convert-source-map')
const libCoverage = require('istanbul-lib-coverage')
const libSourceMaps = require('istanbul-lib-source-maps')
const fs = require('fs')
const path = require('path')

class SourceMaps {
  constructor (opts) {
    this.cache = opts.cache
    this.cacheDirectory = opts.cacheDirectory
    this.loadedMaps = {}
    this._sourceMapCache = libSourceMaps.createSourceMapStore()
  }

  cachedPath (source, hash) {
    return path.join(
      this.cacheDirectory,
      `${path.parse(source).name}-${hash}.map`
    )
  }

  purgeCache () {
    this._sourceMapCache = libSourceMaps.createSourceMapStore()
    this.loadedMaps = {}
  }

  extractAndRegister (code, filename, hash) {
    const sourceMap = convertSourceMap.fromSource(code) || convertSourceMap.fromMapFileSource(code, path.dirname(filename))
    if (sourceMap) {
      if (this.cache && hash) {
        const mapPath = this.cachedPath(filename, hash)
        fs.writeFileSync(mapPath, sourceMap.toJSON())
      } else {
        this._sourceMapCache.registerMap(filename, sourceMap.sourcemap)
      }
    }
    return sourceMap
  }

  remapCoverage (obj) {
    const transformed = this._sourceMapCache.transformCoverage(
      libCoverage.createCoverageMap(obj)
    )
    return transformed.map.data
  }

  reloadCachedSourceMaps (report) {
    Object.entries(report).forEach(([absFile, fileReport]) => {
      if (fileReport && fileReport.contentHash) {
        const hash = fileReport.contentHash
        if (!(hash in this.loadedMaps)) {
          try {
            const mapPath = this.cachedPath(absFile, hash)
            this.loadedMaps[hash] = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
          } catch (e) {
            // set to false to avoid repeatedly trying to load the map
            this.loadedMaps[hash] = false
          }
        }
        if (this.loadedMaps[hash]) {
          this._sourceMapCache.registerMap(absFile, this.loadedMaps[hash])
        }
      }
    })
  }
}

module.exports = SourceMaps
