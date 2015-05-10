var _ = require('lodash'),
  fs = require('fs'),
  istanbul = require('istanbul'),
  instrumenter = new istanbul.Instrumenter(),
  mkdirp = require('mkdirp'),
  path = require('path'),
  rimraf = require('rimraf'),
  spawnWrap = require('spawn-wrap')

function NYC (opts) {
  _.extend(this, {
    subprocessBin: path.resolve(
      __dirname,
      './bin/nyc.js'
    ),
    tempDirectory: './nyc_output',
    cwd: process.env.NYC_CWD || process.cwd(),
    reporter: 'text'
  }, opts)

  var config = require(path.resolve(this.cwd, './package.json')).config || {}
  config = config.nyc || {}

  this.exclude = config.exclude || ['node_modules\/', 'test\/']
  if (!Array.isArray(this.exclude)) this.exclude = [this.exclude]
  this.exclude = _.map(this.exclude, function (p) {
    return new RegExp(p)
  })

  if (!process.env.NYC_CWD) rimraf.sync(this.tmpDirectory())
  mkdirp.sync(this.tmpDirectory())
}

NYC.prototype.wrapRequire = function () {
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
      content = instrumenter.instrumentSync(
        content,
        './' + relFile
      )
    }

    module._compile(stripBOM(content), filename)
  }

  // ouptut temp coverage reports as processes exit.
  process.on('exit', function () {
    if (!global.__coverage__) return

    fs.writeFileSync(
      path.resolve(_this.tmpDirectory(), './', process.pid + '.json'),
      JSON.stringify(global.__coverage__),
      'utf-8'
    )
  })
}

function stripBOM (content) {
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}

NYC.prototype.wrap = function () {
  spawnWrap([this.subprocessBin], {NYC_CWD: this.cwd})
  this.wrapRequire()
}

NYC.prototype.report = function () {
  var _this = this,
    collector = new istanbul.Collector(),
    reporter = new istanbul.Reporter(),
    files = fs.readdirSync(_this.tmpDirectory()),
    reports = _.map(files, function (f) {
      return JSON.parse(fs.readFileSync(
        path.resolve(_this.tmpDirectory(), './', f),
        'utf-8'
      ))
    })

  reports.forEach(function (report) {
    collector.add(report)
  })

  reporter.add(this.reporter)

  reporter.write(collector, true, function () {})
}

NYC.prototype.tmpDirectory = function () {
  return path.resolve(this.cwd, './', this.tempDirectory)
}

module.exports = NYC
