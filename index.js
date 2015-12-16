/* global __coverage__ */
var _ = require('lodash')
var fs = require('fs')
var glob = require('glob')
var micromatch = require('micromatch')
var mkdirp = require('mkdirp')
var appendTransform = require('append-transform')
var path = require('path')
var rimraf = require('rimraf')
var onExit = require('signal-exit')
var stripBom = require('strip-bom')
var SourceMapCache = require('./lib/source-map-cache')
var resolveFrom = require('resolve-from')

/* istanbul ignore next */
if (/index\.covered\.js$/.test(__filename)) {
  require('./lib/self-coverage-helper')
}

function NYC (opts) {
  if (opts && opts.istanbul) {
    opts._istanbul = opts.istanbul
    delete opts.istanbul
  }
  _.extend(this, {
    subprocessBin: path.resolve(
      __dirname,
      './bin/nyc.js'
    ),
    tempDirectory: './.nyc_output',
    cacheDirectory: './.nyc_cache',
    cwd: process.env.NYC_CWD || process.cwd(),
    reporter: 'text',
    sourceMapCache: new SourceMapCache(),
    require: []
  }, opts)

  if (!Array.isArray(this.reporter)) this.reporter = [this.reporter]

  // you can specify config in the nyc stanza of package.json.
  var config = require(path.resolve(this.cwd, './package.json')).config || {}
  config = config.nyc || {}

  // load exclude stanza from config.
  this.include = config.include || ['**']
  this.include = this._prepGlobPatterns(this.include)

  this.exclude = ['**/node_modules/**'].concat(config.exclude || ['test/**', 'test{,-*}.js'])
  if (!Array.isArray(this.exclude)) this.exclude = [this.exclude]
  this.exclude = this._prepGlobPatterns(this.exclude)

  // require extensions can be provided as config in package.json.
  this.require = config.require ? config.require : this.require

  this.instrumenter = this._createInstrumenter()
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

/* NYC.prototype.instrumenter = function () {
  return this._instrumenter || (this._instrumenter = this._createInstrumenter())
} */

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

  var directories = []
  patterns = _.map(patterns, function (pattern) {
    // Allow gitignore style of directory exclusion
    if (!_.endsWith(pattern, '/**')) {
      directories.push(pattern.replace(/\/$/, '').concat('/**'))
    }

    return pattern
  })
  return _.union(patterns, directories)
}

NYC.prototype.addFile = function (filename, returnImmediately) {
  var relFile = path.relative(this.cwd, filename)
  var instrument = this.shouldInstrumentFile(filename, relFile)
  var content = stripBom(fs.readFileSync(filename, 'utf8'))

  if (instrument) {
    this.sourceMapCache.add(filename, content)
    content = this.instrumenter.instrumentSync(content, './' + relFile)
  } else if (returnImmediately) {
    return {}
  }

  return {
    instrument: instrument,
    content: content,
    relFile: relFile
  }
}

NYC.prototype.shouldInstrumentFile = function (filename, relFile) {
  relFile = relFile.replace(/^\.\//, '') // remove leading './'.

  return (micromatch.any(filename, this.include) || micromatch.any(relFile, this.include)) &&
    !(micromatch.any(filename, this.exclude) || micromatch.any(relFile, this.exclude))
}

NYC.prototype.addAllFiles = function () {
  var _this = this

  this._createOutputDirectory()

  glob.sync('**/*.js', {nodir: true, ignore: this.exclude}).forEach(function (filename) {
    var obj = _this.addFile(filename, true)
    if (obj.instrument) {
      module._compile(
        _this.instrumenter.getPreamble(obj.content, obj.relFile),
        filename
      )
    }
  })

  this.writeCoverageFile()
}

NYC.prototype._wrapRequire = function () {
  var _this = this
  appendTransform(function (code, filename) {
    var relFile = path.relative(_this.cwd, filename)
    var instrument = _this.shouldInstrumentFile(filename, relFile)

    if (!instrument) {
      return code
    }

    _this.sourceMapCache.add(filename, code)

    // now instrument the compiled code.
    return _this.instrumenter.instrumentSync(code, './' + relFile)
  })
}

NYC.prototype.cleanup = function () {
  if (!process.env.NYC_CWD) rimraf.sync(this.tmpDirectory())
}

NYC.prototype._createOutputDirectory = function () {
  mkdirp.sync(this.tmpDirectory())
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

  fs.writeFileSync(
    path.resolve(this.tmpDirectory(), './', process.pid + '.json'),
    JSON.stringify(this.sourceMapCache.applySourceMaps(coverage)),
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

NYC.prototype._loadReports = function () {
  var _this = this
  var files = fs.readdirSync(this.tmpDirectory())

  return _.map(files, function (f) {
    try {
      return JSON.parse(fs.readFileSync(
        path.resolve(_this.tmpDirectory(), './', f),
        'utf-8'
      ))
    } catch (e) { // handle corrupt JSON output.
      return {}
    }
  })
}

NYC.prototype.tmpDirectory = function () {
  return path.resolve(this.cwd, './', this.tempDirectory)
}

NYC.prototype.cacheDirectory = function () {
  return path.resolve(this.cwd, './', this.tempDirectory)
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
