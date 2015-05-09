var _ = require('lodash'),
  cp = require('child_process'),
  fs = require('fs'),
  istanbul = require('istanbul'),
  instrumenter = new istanbul.Instrumenter(),
  mkdirp = require('mkdirp'),
  path = require('path'),
  rimraf = require('rimraf')

function NYC (opts) {
  _.extend(this, {
    subprocessBin: path.resolve(
      __dirname,
      './bin/nyc.js'
    ),
    tempDirectory: './nyc_output',
    cwd: process.env.NYC_CWD || process.cwd()
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

NYC.prototype.wrapSpawn = function (_child /* for mocking in tests */) {
  var _this = this,
    child = _child || cp.spawn('echo', []),
    ChildProcess = child.constructor

  var spawn = ChildProcess.prototype.spawn
  ChildProcess.prototype.spawn = function (options) {
    if (path.basename(options.file) === 'node' ||
        path.basename(options.file) === 'iojs') {
      options.args = _.map(options.args, function (arg) {
        if (arg === options.file) return _this.subprocessBin
        else return arg
      })

      options.envPairs.push('NYC_CWD=' + _this.cwd)
      options.args.unshift(process.execPath)
    }

    return spawn.call(this, options)
  }

  // handle cp.exec('node foo.js')
  var exec = cp.exec
  cp.exec = function (command/*...*/) {
    var b = command.trim().split(/\s+/)
    if (path.basename(b[0]) === 'node' ||
        path.basename(b[0]) === 'iojs') {
      b[0] = this.subprocessBin
    }

    var args = [b.join(' ')]
    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i])
    }
    return exec.apply(cp, args)
  }
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
        '/' + relFile
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
  this.wrapSpawn()
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

  reporter.add('text')

  reporter.write(collector, true, function () {
    console.log('All reports generated')
  })
}

NYC.prototype.tmpDirectory = function () {
  return path.resolve(this.cwd, './', this.tempDirectory)
}

module.exports = NYC
