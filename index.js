/* global __coverage__ */
var _ = require('lodash')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var onExit = require('signal-exit')
var stripBom = require('strip-bom')

function NYC (opts) {
  _.extend(this, {
    subprocessBin: path.resolve(
      __dirname,
      './bin/nyc.js'
    ),
    tempDirectory: './.nyc_output',
    cwd: process.env.NYC_CWD || process.cwd(),
    reporter: 'text',
    istanbul: require('istanbul')
  }, opts)

  if (!Array.isArray(this.reporter)) this.reporter = [this.reporter]

  var config = require(path.resolve(this.cwd, './package.json')).config || {}
  config = config.nyc || {}

  this.exclude = config.exclude || ['node_modules\/', 'test\/', 'test\\.js']
  if (!Array.isArray(this.exclude)) this.exclude = [this.exclude]
  this.exclude = _.map(this.exclude, function (p) {
    return new RegExp(p)
  })

  this.instrumenter = this._createInstrumenter()

  mkdirp.sync(this.tmpDirectory())
}

NYC.prototype._createInstrumenter = function () {
  var configFile = path.resolve(this.cwd, './.istanbul.yml')

  if (!fs.existsSync(configFile)) configFile = undefined

  var instrumenterConfig = this.istanbul.config.loadFile(configFile).instrumentation.config

  return new this.istanbul.Instrumenter({
    coverageVariable: '__coverage__',
    embedSource: instrumenterConfig['embed-source'],
    noCompact: !instrumenterConfig.compact,
    preserveComments: instrumenterConfig['preserve-comments']
  })
}

NYC.prototype.cleanup = function () {
  if (!process.env.NYC_CWD) rimraf.sync(this.tmpDirectory())
}

NYC.prototype._wrapRequire = function () {
  var _this = this

  // any JS you require should get coverage added.
  require.extensions['.js'] = function (module, filename) {
    var instrument = true
    var content = fs.readFileSync(filename, 'utf8')

    // only instrument a file if it's not on the exclude list.
    var relFile = path.relative(_this.cwd, filename)
    for (var i = 0, exclude; (exclude = _this.exclude[i]) !== undefined; i++) {
      if (exclude.test(relFile)) instrument = false
    }

    if (instrument) {
      content = _this.instrumenter.instrumentSync(
        content,
        './' + relFile
      )
    }

    module._compile(stripBom(content), filename)
  }
}

NYC.prototype._wrapExit = function () {
  var _this = this
  var outputCoverage = function () {
    var coverage = global.__coverage__
    if (typeof __coverage__ === 'object') coverage = __coverage__
    if (!coverage) return

    fs.writeFileSync(
      path.resolve(_this.tmpDirectory(), './', process.pid + '.json'),
      JSON.stringify(coverage),
      'utf-8'
    )
  }

  // we always want to write coverage
  // regardless of how the process exits.
  onExit(function () {
    outputCoverage()
  }, {alwaysLast: true})
}

NYC.prototype.wrap = function (bin) {
  this._wrapRequire()
  this._wrapExit()
  return this
}

NYC.prototype.report = function (cb, _collector, _reporter) {
  cb = cb || function () {}

  var collector = _collector || new this.istanbul.Collector()
  var reporter = _reporter || new this.istanbul.Reporter()

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

NYC.prototype.mungeArgs = function (yargv) {
  var argv = process.argv.slice(1)

  return argv.slice(argv.indexOf(yargv._[0]))
}

module.exports = NYC
