var _ = require('lodash'),
  cp = require('child_process'),
  fs = require('fs'),
  istanbul = require('istanbul'),
  instrumenter = new istanbul.Instrumenter(),
  mkdirp = require('mkdirp'),
  path = require('path')
  // rimraf = require('rimraf')

function NYC (opts) {
  _.extend(this, {
    subprocessBin: path.resolve(
      __dirname,
      './bin/nyc.js'
    ),
    tempDirectory: './nyc_output',
    cwd: __dirname
  }, opts)

  // set config in config.nyc stanza of package.json.
  if (!this.cwd) throw Error('can no find file', process.cwd())
  // don't have a plan for loading config yet, we should pass
  // around the cwd using ENV, and use the ENV for config/package.json
  var config = require(path.resolve(this.cwd, './package.json')).config.nyc

  // which files should we apply coverage to?
  this.pattern = config.pattern || ['lib', 'index.js']
  if (!Array.isArray(this.pattern)) this.pattern = [this.pattern]
  this.pattern = _.map(this.pattern, function (p) {
    return new RegExp('^' + p + '.*')
  })

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
      options.args.unshift(process.execPath)
    }
    // node fakeamabob test/foo.js
    // require('fs').appendFileSync('/Users/benjamincoe/output.log', 'Attempt Spawn: ' + JSON.stringify(options) + '\n', 'utf-8')

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
    var instrument = false
    var content = fs.readFileSync(filename, 'utf8')

    // only instrument the file if it matches our coverage pattern.
    var relFile = path.relative(_this.cwd, filename)
    for (var i = 0, pattern; (pattern = _this.pattern[i]) !== undefined; i++) {
      if (pattern.test(relFile)) {
        instrument = true
      }
    }

    if (instrument) content = instrumenter.instrumentSync(content, filename)
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

  console.log(_this.tmpDirectory())

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
