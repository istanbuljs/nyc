/* global __coverage__ */
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')
var Module = require('module')
var appendTransform = require('append-transform')
var cachingTransform = require('caching-transform')
var path = require('path')
var rimraf = require('rimraf')
var onExit = require('signal-exit')
var resolveFrom = require('resolve-from')
var arrify = require('arrify')
var SourceMapCache = require('./lib/source-map-cache')
var convertSourceMap = require('convert-source-map')
var md5hex = require('md5-hex')
var findCacheDir = require('find-cache-dir')
var js = require('default-require-extensions/js')
var pkgUp = require('pkg-up')
var testExclude = require('test-exclude')
var yargs = require('yargs')

/* istanbul ignore next */
if (/index\.covered\.js$/.test(__filename)) {
  require('./lib/self-coverage-helper')
}

function NYC (opts) {
  var config = this._loadConfig(opts || {})

  this._istanbul = config.istanbul
  this.subprocessBin = config.subprocessBin || path.resolve(__dirname, './bin/nyc.js')
  this._tempDirectory = config.tempDirectory || './.nyc_output'
  this._instrumenterLib = require(config.instrumenter || './lib/instrumenters/istanbul')
  this._reportDir = config.reportDir
  this._sourceMap = config.sourceMap
  this.cwd = config.cwd

  this.reporter = arrify(config.reporter || 'text')

  this.cacheDirectory = findCacheDir({name: 'nyc', cwd: this.cwd})

  this.enableCache = Boolean(this.cacheDirectory && (config.enableCache === true || process.env.NYC_CACHE === 'enable'))

  this.exclude = testExclude({
    cwd: this.cwd,
    include: config.include,
    exclude: config.exclude
  })

  // require extensions can be provided as config in package.json.
  this.require = arrify(config.require)

  this.extensions = arrify(config.extension).concat('.js').map(function (ext) {
    return ext.toLowerCase()
  }).filter(function (item, pos, arr) {
    // avoid duplicate extensions
    return arr.indexOf(item) === pos
  })

  this.transforms = this.extensions.reduce(function (transforms, ext) {
    transforms[ext] = this._createTransform(ext)
    return transforms
  }.bind(this), {})

  this.sourceMapCache = new SourceMapCache()

  this.hashCache = {}
  this.loadedMaps = null
}

NYC.prototype._loadConfig = function (opts) {
  var cwd = opts.cwd || process.env.NYC_CWD || process.cwd()
  var pkgPath = pkgUp.sync(cwd)

  if (pkgPath) {
    cwd = path.dirname(pkgPath)
  }

  opts.cwd = cwd

  return yargs([])
    .pkgConf('nyc', cwd)
    .default(opts)
    .argv
}

NYC.prototype._createTransform = function (ext) {
  var _this = this
  return cachingTransform({
    salt: JSON.stringify({
      istanbul: require('istanbul/package.json').version,
      nyc: require('./package.json').version
    }),
    hash: function (code, metadata, salt) {
      var hash = md5hex([code, metadata.filename, salt])
      _this.hashCache[metadata.filename] = hash
      return hash
    },
    factory: this._transformFactory.bind(this),
    cacheDir: this.cacheDirectory,
    disableCache: !this.enableCache,
    ext: ext
  })
}

NYC.prototype._loadAdditionalModules = function () {
  var _this = this
  this.require.forEach(function (r) {
    // first attempt to require the module relative to
    // the directory being instrumented.
    var p = resolveFrom(_this.cwd, r)
    if (p) {
      require(p)
      return
    }
    // now try other locations, .e.g, the nyc node_modules folder.
    require(r)
  })
}

NYC.prototype.instrumenter = function () {
  return this._instrumenter || (this._instrumenter = this._createInstrumenter())
}

NYC.prototype._createInstrumenter = function () {
  return this._instrumenterLib(this.cwd)
}

NYC.prototype.addFile = function (filename) {
  var relFile = path.relative(this.cwd, filename)
  var source = this._readTranspiledSource(path.resolve(this.cwd, filename))
  var instrumentedSource = this._maybeInstrumentSource(source, filename, relFile)

  return {
    instrument: !!instrumentedSource,
    relFile: relFile,
    content: instrumentedSource || source
  }
}

NYC.prototype._readTranspiledSource = function (path) {
  var source = null
  Module._extensions['.js']({
    _compile: function (content, filename) {
      source = content
    }
  }, path)
  return source
}

NYC.prototype.addAllFiles = function () {
  var _this = this

  this._loadAdditionalModules()

  var pattern = null
  if (this.extensions.length === 1) {
    pattern = '**/*' + this.extensions[0]
  } else {
    pattern = '**/*{' + this.extensions.join() + '}'
  }

  glob.sync(pattern, {cwd: this.cwd, nodir: true, ignore: this.exclude.exclude}).forEach(function (filename) {
    var obj = _this.addFile(path.join(_this.cwd, filename))
    if (obj.instrument) {
      module._compile(
        _this.instrumenter().getPreamble(obj.content, obj.relFile),
        filename
      )
    }
  })

  this.writeCoverageFile()
}

NYC.prototype._maybeInstrumentSource = function (code, filename, relFile) {
  var instrument = this.exclude.shouldInstrument(filename, relFile)

  if (!instrument) {
    return null
  }

  var ext, transform
  for (ext in this.transforms) {
    if (filename.toLowerCase().substr(-ext.length) === ext) {
      transform = this.transforms[ext]
      break
    }
  }

  return transform ? transform(code, {filename: filename, relFile: relFile}) : null
}

NYC.prototype._transformFactory = function (cacheDir) {
  var _this = this
  var instrumenter = this.instrumenter()

  return function (code, metadata, hash) {
    var filename = metadata.filename

    if (_this._sourceMap) _this._handleSourceMap(cacheDir, code, hash, filename)

    return instrumenter.instrumentSync(code, filename)
  }
}

NYC.prototype._handleSourceMap = function (cacheDir, code, hash, filename) {
  var sourceMap = convertSourceMap.fromSource(code) || convertSourceMap.fromMapFileSource(code, path.dirname(filename))
  if (sourceMap) {
    if (hash) {
      var mapPath = path.join(cacheDir, hash + '.map')
      fs.writeFileSync(mapPath, sourceMap.toJSON())
    } else {
      this.sourceMapCache.addMap(filename, sourceMap.toJSON())
    }
  }
}

NYC.prototype._handleJs = function (code, filename) {
  var relFile = path.relative(this.cwd, filename)
  return this._maybeInstrumentSource(code, filename, relFile) || code
}

NYC.prototype._wrapRequire = function () {
  var handleJs = this._handleJs.bind(this)

  this.extensions.forEach(function (ext) {
    require.extensions[ext] = js
    appendTransform(handleJs, ext)
  })
}

NYC.prototype.cleanup = function () {
  if (!process.env.NYC_CWD) rimraf.sync(this.tempDirectory())
}

NYC.prototype.clearCache = function () {
  if (this.enableCache) {
    rimraf.sync(this.cacheDirectory)
  }
}

NYC.prototype.createTempDirectory = function () {
  mkdirp.sync(this.tempDirectory())
}

NYC.prototype.reset = function () {
  this.cleanup()
  this.createTempDirectory()
}

NYC.prototype._wrapExit = function () {
  var _this = this

  // we always want to write coverage
  // regardless of how the process exits.
  onExit(function () {
    _this.writeCoverageFile()
  }, {alwaysLast: true})
}

NYC.prototype.wrap = function (bin) {
  this._wrapRequire()
  this._wrapExit()
  this._loadAdditionalModules()
  return this
}

NYC.prototype.writeCoverageFile = function () {
  var coverage = global.__coverage__
  if (typeof __coverage__ === 'object') coverage = __coverage__
  if (!coverage) return

  if (this.enableCache) {
    Object.keys(coverage).forEach(function (absFile) {
      if (this.hashCache[absFile] && coverage[absFile]) {
        coverage[absFile].contentHash = this.hashCache[absFile]
      }
    }, this)
  } else {
    this.sourceMapCache.applySourceMaps(coverage)
  }

  fs.writeFileSync(
    path.resolve(this.tempDirectory(), './', process.pid + '.json'),
    JSON.stringify(coverage),
    'utf-8'
  )
}

NYC.prototype.istanbul = function () {
  return this._istanbul || (this._istanbul = require('istanbul'))
}

NYC.prototype.report = function (cb, _collector, _reporter) {
  cb = cb || function () {}

  var istanbul = this.istanbul()
  var collector = _collector || new istanbul.Collector()
  var reporter = _reporter || new istanbul.Reporter(null, this._reportDir)

  this._loadReports().forEach(function (report) {
    collector.add(report)
  })

  this.reporter.forEach(function (_reporter) {
    reporter.add(_reporter)
  })

  reporter.write(collector, true, cb)
}

NYC.prototype._loadReports = function () {
  var _this = this
  var files = fs.readdirSync(this.tempDirectory())

  var cacheDir = _this.cacheDirectory

  var loadedMaps = this.loadedMaps || (this.loadedMaps = {})

  return files.map(function (f) {
    var report
    try {
      report = JSON.parse(fs.readFileSync(
        path.resolve(_this.tempDirectory(), './', f),
        'utf-8'
      ))
    } catch (e) { // handle corrupt JSON output.
      return {}
    }

    Object.keys(report).forEach(function (absFile) {
      var fileReport = report[absFile]
      if (fileReport && fileReport.contentHash) {
        var hash = fileReport.contentHash
        if (!(hash in loadedMaps)) {
          try {
            var mapPath = path.join(cacheDir, hash + '.map')
            loadedMaps[hash] = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
          } catch (e) {
            // set to false to avoid repeatedly trying to load the map
            loadedMaps[hash] = false
          }
        }
        if (loadedMaps[hash]) {
          _this.sourceMapCache.addMap(absFile, loadedMaps[hash])
        }
      }
    })
    _this.sourceMapCache.applySourceMaps(report)
    return report
  })
}

NYC.prototype.tempDirectory = function () {
  return path.resolve(this.cwd, './', this._tempDirectory)
}

NYC.prototype.mungeArgs = function (yargv) {
  var argv = process.argv.slice(1)
  argv = argv.slice(argv.indexOf(yargv._[0]))
  return argv
}

module.exports = NYC
