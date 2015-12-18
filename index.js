/* global __coverage__ */
var fs = require('fs')
var glob = require('glob')
var micromatch = require('micromatch')
var mkdirp = require('mkdirp')
var appendTransform = require('append-transform')
var path = require('path')
var rimraf = require('rimraf')
var onExit = require('signal-exit')
var stripBom = require('strip-bom')
var resolveFrom = require('resolve-from')
var md5 = require('md5-hex')
var arrify = require('arrify')
var convertSourceMap = require('convert-source-map')
var endsWith = require('ends-with')

/* istanbul ignore next */
if (/index\.covered\.js$/.test(__filename)) {
  require('./lib/self-coverage-helper')
}

function NYC (opts) {
  opts = opts || {}

  this._istanbul = opts.istanbul
  this.subprocessBin = opts.subprocessBin || path.resolve(__dirname, './bin/nyc.js')
  this._tempDirectory = opts.tempDirectory || './.nyc_output'
  this._cacheDirectory = opts.cacheDirectory || './node_modules/.cache/nyc'
  this.cwd = opts.cwd || process.env.NYC_CWD || process.cwd()
  this.reporter = arrify(opts.reporter || 'text')

  // you can specify config in the nyc stanza of package.json.
  var config = require(path.resolve(this.cwd, './package.json')).config || {}
  config = config.nyc || {}

  // load exclude stanza from config.
  this.include = false
  if (config.include) {
    this.include = this._prepGlobPatterns(arrify(config.include))
  }

  this.exclude = ['**/node_modules/**'].concat(arrify(config.exclude || ['test/**', 'test{,-*}.js']))
  this.exclude = this._prepGlobPatterns(this.exclude)

  // require extensions can be provided as config in package.json.
  this.require = arrify(config.require || opts.require)

  this._createOutputDirectory()
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
  var configFile = path.resolve(this.cwd, './.istanbul.yml')

  if (!fs.existsSync(configFile)) configFile = undefined

  var instrumenterConfig = this.istanbul().config.loadFile(configFile).instrumentation.config

  return new (this.istanbul()).Instrumenter({
    coverageVariable: '__coverage__',
    embedSource: instrumenterConfig['embed-source'],
    noCompact: !instrumenterConfig.compact,
    preserveComments: instrumenterConfig['preserve-comments']
  })
}

NYC.prototype._prepGlobPatterns = function (patterns) {
  if (!patterns) return patterns

  var result = []

  function add (pattern) {
    if (result.indexOf(pattern) === -1) {
      result.push(pattern)
    }
  }

  patterns.forEach(function (pattern) {
    // Allow gitignore style of directory exclusion
    if (!endsWith(pattern, '/**')) {
      add(pattern.replace(/\/$/, '').concat('/**'))
    }

    add(pattern)
  })

  return result
}

NYC.prototype.addFile = function (filename) {
  var relFile = path.relative(this.cwd, filename)
  var source = stripBom(fs.readFileSync(filename, 'utf8'))
  var content = this._addSource(source, filename, relFile)
  return {
    instrument: !!content,
    relFile: relFile,
    content: content || source
  }
}

NYC.prototype.shouldInstrumentFile = function (filename, relFile) {
  relFile = relFile.replace(/^\.\//, '') // remove leading './'.

  return (!this.include || micromatch.any(filename, this.include) || micromatch.any(relFile, this.include)) &&
    !(micromatch.any(filename, this.exclude) || micromatch.any(relFile, this.exclude))
}

NYC.prototype.addAllFiles = function () {
  var _this = this

  this._createOutputDirectory()

  glob.sync('**/*.js', {nodir: true, ignore: this.exclude}).forEach(function (filename) {
    var obj = _this.addFile(filename, true)
    if (obj.instrument) {
      module._compile(
        _this.instrumenter().getPreamble(obj.content, obj.relFile),
        filename
      )
    }
  })

  this.writeCoverageFile()
}

var hashCache = {}

NYC.prototype._addSource = function (code, filename, relFile) {
  var instrument = this.shouldInstrumentFile(filename, relFile)

  if (!instrument) {
    return null
  }

  var hash = md5(code)
  hashCache['./' + relFile] = hash
  var cacheFilePath = path.join(this.cacheDirectory(), hash + '.js')

  try {
    return fs.readFileSync(cacheFilePath, 'utf8')
  } catch (e) {
    var sourceMap = convertSourceMap.fromSource(code) || convertSourceMap.fromMapFileSource(code, path.dirname(filename))
    if (sourceMap) {
      var mapPath = path.join(this.cacheDirectory(), hash + '.map')
      fs.writeFileSync(mapPath, sourceMap.toJSON())
    }
    var instrumented = this.instrumenter().instrumentSync(code, './' + relFile)
    fs.writeFileSync(cacheFilePath, instrumented)
    return instrumented
  }
}

NYC.prototype._wrapRequire = function () {
  var _this = this
  appendTransform(function (code, filename) {
    var relFile = path.relative(_this.cwd, filename)
    return _this._addSource(code, filename, relFile) || code
  })
}

NYC.prototype.cleanup = function () {
  if (!process.env.NYC_CWD) rimraf.sync(this.tmpDirectory())
}

NYC.prototype._createOutputDirectory = function () {
  mkdirp.sync(this.tempDirectory())
  mkdirp.sync(this.cacheDirectory())
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

  Object.keys(coverage).forEach(function (relFile) {
    if (hashCache[relFile] && coverage[relFile]) {
      coverage[relFile].contentHash = hashCache[relFile]
    }
  })

  fs.writeFileSync(
    path.resolve(this.tmpDirectory(), './', process.pid + '.json'),
    JSON.stringify(coverage),
    'utf-8'
  )
}

NYC.prototype.istanbul = function () {
  return this._istanbul || (this._istanbul = require('istanbul'))
}

NYC.prototype.report = function (cb, _collector, _reporter) {
  cb = cb || function () {}

  var collector = _collector || new (this.istanbul()).Collector()
  var reporter = _reporter || new (this.istanbul()).Reporter()

  this._loadReports().forEach(function (report) {
    collector.add(report)
  })

  this.reporter.forEach(function (_reporter) {
    reporter.add(_reporter)
  })

  reporter.write(collector, true, cb)
}

var loadedMaps = {}

NYC.prototype._loadReports = function () {
  var _this = this
  var files = fs.readdirSync(this.tmpDirectory())

  var SourceMapCache = require('./lib/source-map-cache')
  var sourceMapCache = new SourceMapCache()

  var cacheDir = _this.cacheDirectory()

  return files.map(function (f) {
    var report
    try {
      report = JSON.parse(fs.readFileSync(
        path.resolve(_this.tmpDirectory(), './', f),
        'utf-8'
      ))
    } catch (e) { // handle corrupt JSON output.
      return {}
    }

    if (report) {
      Object.keys(report).forEach(function (relFile) {
        var fileReport = report[relFile]
        if (fileReport && fileReport.contentHash) {
          var hash = fileReport.contentHash
          if (!(loadedMaps[hash] || (loadedMaps[hash] === false))) {
            try {
              var mapPath = path.join(cacheDir, hash + '.map')
              loadedMaps[hash] = fs.readFileSync(mapPath, 'utf8')
            } catch (e) {
              loadedMaps[hash] = false
            }
          }
          if (loadedMaps[hash]) {
            sourceMapCache.addMap(relFile, loadedMaps[hash])
          }
        }
      })
      report = sourceMapCache.applySourceMaps(report)
    }
    return report
  })
}

NYC.prototype.tmpDirectory = NYC.prototype.tempDirectory = function () {
  return path.resolve(this.cwd, './', this._tempDirectory)
}

NYC.prototype.cacheDirectory = function () {
  return path.resolve(this.cwd, './', this._cacheDirectory)
}

NYC.prototype.mungeArgs = function (yargv) {
  var argv = process.argv.slice(1)
  argv = argv.slice(argv.indexOf(yargv._[0]))
  if (!/^(node|iojs)$/.test(argv[0]) &&
      process.platform === 'win32' &&
      (/\.js$/.test(argv[0]) ||
        (!/\.(cmd|exe)$/.test(argv[0]) &&
        !fs.existsSync(argv[0] + '.cmd') &&
        !fs.existsSync(argv[0] + '.exe')))) {
    argv.unshift(process.execPath)
  }

  return argv
}

module.exports = NYC
