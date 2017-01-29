/* global describe, it */

require('source-map-support').install({hookRequire: true})
var _ = require('lodash')
var ap = require('any-path')
var configUtil = require('../../lib/config-util')
var fs = require('fs')
var enableCache = false
var _NYC

try {
  _NYC = require('../../index.covered.js')
} catch (e) {
  _NYC = require('../../')
}

function NYC (opts) {
  opts = opts || {}
  if (!opts.hasOwnProperty('enableCache')) {
    opts.enableCache = enableCache
  }
  return new _NYC(opts)
}

var path = require('path')
var existsSync = require('exists-sync')
var glob = require('glob')
var rimraf = require('rimraf')
var sinon = require('sinon')
var isWindows = require('is-windows')()
var spawn = require('child_process').spawn
var fixtures = path.resolve(__dirname, '../fixtures')
var bin = path.resolve(__dirname, '../../bin/nyc')

// beforeEach
glob.sync('**/*/{.nyc_output,.cache}').forEach(function (path) {
  rimraf.sync(path)
})

delete process.env.NYC_CWD

require('chai').should()
require('tap').mochaGlobals()

describe('nyc', function () {
  describe('cwd', function () {
    it('sets cwd to process.cwd() if no environment variable is set', function () {
      var nyc = new NYC(configUtil.loadConfig())

      nyc.cwd.should.eql(process.cwd())
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, '../fixtures')
      var nyc = new NYC(configUtil.loadConfig())

      nyc.cwd.should.equal(path.resolve(__dirname, '../fixtures'))
    })

    it('will look upwards for package.json from cwd', function () {
      var nyc = new NYC(configUtil.loadConfig([], __dirname))
      nyc.cwd.should.eql(path.join(__dirname, '../..'))
    })
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json#nyc", function () {
      var nyc = new NYC(configUtil.loadConfig([], path.resolve(__dirname, '../fixtures')))
      nyc.exclude.exclude.length.should.eql(8)
    })

    it("loads 'extension' patterns from package.json#nyc", function () {
      var nyc = new NYC(configUtil.loadConfig([], path.resolve(__dirname, '../fixtures/conf-multiple-extensions')))
      nyc.extensions.length.should.eql(3)
    })

    it("ignores 'include' option if it's falsy or []", function () {
      var nyc1 = new NYC(configUtil.loadConfig(
        [],
        path.resolve(__dirname, '../fixtures/conf-empty')
      ))

      nyc1.exclude.include.should.equal(false)

      var nyc2 = new NYC({
        include: []
      })

      nyc2.exclude.include.should.equal(false)
    })

    it("ignores 'exclude' option if it's falsy", function () {
      var nyc1 = new NYC(configUtil.loadConfig([], path.resolve(__dirname, '../fixtures/conf-empty')))
      nyc1.exclude.exclude.length.should.eql(11)
    })

    it("allows for empty 'exclude'", function () {
      var nyc2 = new NYC({exclude: []})

      // an empty exclude still has **/node_modules/**, node_modules/** and added.
      nyc2.exclude.exclude.length.should.eql(2)
    })
  })

  describe('shouldInstrumentFile', function () {
    it('should exclude appropriately with defaults', function () {
      var nyc = new NYC(configUtil.loadConfig([
        '--exclude=test/**',
        '--exclude=test{,-*}.js',
        '--exclude=**/*.test.js',
        '--exclude=**/__tests__/**'
      ], '/cwd'))

      // nyc always excludes "node_modules/**"
      nyc.exclude.shouldInstrument('/cwd/foo', 'foo').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/node_modules/bar', 'node_modules/bar').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/foo/node_modules/bar', 'foo/node_modules/bar').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/test.js', 'test.js').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/testfoo.js', 'testfoo.js').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/test-foo.js', 'test-foo.js').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/lib/test.js', 'lib/test.js').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/foo/bar/test.js', './test.js').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/foo/bar/test.js', '.\\test.js').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/foo/bar/foo.test.js', './foo.test.js').should.equal(false)
      nyc.exclude.shouldInstrument('/cwd/foo/bar/__tests__/foo.js', './__tests__/foo.js').should.equal(false)
    })

    it('should exclude appropriately with config.exclude', function () {
      var nyc = new NYC(configUtil.loadConfig([], fixtures))

      // fixtures/package.json configures excludes: "blarg", "blerg"
      nyc.exclude.shouldInstrument('blarg', 'blarg').should.equal(false)
      nyc.exclude.shouldInstrument('blarg/foo.js', 'blarg/foo.js').should.equal(false)
      nyc.exclude.shouldInstrument('blerg', 'blerg').should.equal(false)
      nyc.exclude.shouldInstrument('./blerg', './blerg').should.equal(false)
      nyc.exclude.shouldInstrument('./blerg', '.\\blerg').should.equal(false)
    })

    it('should exclude outside of the current working directory', function () {
      var nyc = new NYC(configUtil.loadConfig([], '/cwd/foo/'))
      nyc.exclude.shouldInstrument('/cwd/bar', '../bar').should.equal(false)
    })

    it('should not exclude if the current working directory is inside node_modules', function () {
      var nyc = new NYC(configUtil.loadConfig([], '/cwd/node_modules/foo/'))
      nyc.exclude.shouldInstrument('/cwd/node_modules/foo/bar', './bar').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/node_modules/foo/bar', '.\\bar').should.equal(true)
    })

    it('allows files to be explicitly included, rather than excluded', function () {
      var nyc = new NYC(configUtil.loadConfig(['--include=foo.js'], '/cwd/'))

      nyc.exclude.shouldInstrument('/cwd/foo.js', 'foo.js').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/index.js', 'index.js').should.equal(false)
    })

    it('exclude overrides include', function () {
      var nyc = new NYC(configUtil.loadConfig([
        '--include=foo.js',
        '--include=test.js',
        '--exclude=**/node_modules/**',
        '--exclude=test/**',
        '--exclude=test{,-*}.js'
      ], '/cwd/'))

      nyc.exclude.shouldInstrument('/cwd/foo.js', 'foo.js').should.equal(true)
      nyc.exclude.shouldInstrument('/cwd/test.js', 'test.js').should.equal(false)
    })
  })

  describe('wrap', function () {
    it('wraps modules with coverage counters when they are required', function () {
      var nyc = new NYC(configUtil.loadConfig())
      nyc.reset()
      nyc.wrap()

      var check = require('../fixtures/check-instrumented')
      check().should.be.true
    })

    describe('custom require hooks are installed', function () {
      it('wraps modules with coverage counters when the custom require hook compiles them', function () {
        var hook = sinon.spy(function (module, filename) {
          module._compile(fs.readFileSync(filename, 'utf8'), filename)
        })

        // the `require` call to istanbul is deferred, loaded here so it doesn't mess with the hooks callCount
        require('istanbul-lib-instrument')

        var nyc = new NYC(configUtil.loadConfig())
        nyc.reset()
        nyc.wrap()

        // install the custom require hook
        require.extensions['.js'] = hook

        var check = require('../fixtures/check-instrumented')
        check().should.be.true

        // and the hook should have been called
        hook.callCount.should.equal(1)
      })
    })

    describe('produce source map', function () {
      it('handles stack traces', function () {
        var nyc = new NYC(configUtil.loadConfig('--produce-source-map'))
        nyc.reset()
        nyc.wrap()

        var check = require('../fixtures/stack-trace')
        check().should.match(/stack-trace.js:4:/)
      })

      it('does not handle stack traces when disabled', function () {
        var nyc = new NYC(configUtil.loadConfig())
        nyc.reset()
        nyc.wrap()

        var check = require('../fixtures/stack-trace')
        check().should.match(/stack-trace.js:1:/)
      })

      // TODO: add test for merge source-map logic.
    })

    describe('compile handlers for custom extensions are assigned', function () {
      it('assigns a function to custom extensions', function () {
        var nyc = new NYC(configUtil.loadConfig([],
          path.resolve(__dirname, '../fixtures/conf-multiple-extensions')
        ))
        nyc.reset()
        nyc.wrap()

        require.extensions['.es6'].should.be.a.function
        require.extensions['.foo.bar'].should.be.a.function

        // default should still exist
        require.extensions['.js'].should.be.a.function
      })

      it('calls the `_handleJs` function for custom file extensions', function () {
        // the `require` call to istanbul is deferred, loaded here so it doesn't mess with the hooks callCount
        require('istanbul-lib-instrument')

        var nyc = new NYC(configUtil.loadConfig([],
          path.resolve(__dirname, '../fixtures/conf-multiple-extensions')
        ))

        sinon.spy(nyc, '_handleJs')

        nyc.reset()
        nyc.wrap()

        var check1 = require('../fixtures/conf-multiple-extensions/check-instrumented.es6')
        var check2 = require('../fixtures/conf-multiple-extensions/check-instrumented.foo.bar')
        check1().should.be.true
        check2().should.be.true
        nyc._handleJs.callCount.should.equal(2)
      })
    })

    function testSignal (signal, done) {
      var nyc = (new NYC(configUtil.loadConfig([], fixtures)))

      var proc = spawn(process.execPath, [bin, './' + signal + '.js'], {
        cwd: fixtures,
        env: {},
        stdio: 'ignore'
      })

      proc.on('close', function () {
        var reports = _.filter(nyc.loadReports(), function (report) {
          return report[path.join(fixtures, signal + '.js')]
        })
        reports.length.should.equal(1)
        return done()
      })
    }

    it('writes coverage report when process is killed with SIGTERM', function (done) {
      if (isWindows) return done()
      testSignal('sigterm', done)
    })

    it('writes coverage report when process is killed with SIGINT', function (done) {
      if (isWindows) return done()
      testSignal('sigint', done)
    })

    it('does not output coverage for files that have not been included, by default', function (done) {
      var nyc = (new NYC(configUtil.loadConfig([], process.cwd())))
      nyc.wrap()
      nyc.reset()

      var reports = _.filter(nyc.loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      reports.length.should.equal(0)
      return done()
    })
  })

  describe('report', function () {
    it('allows coverage report to be output in an alternative directory', function (done) {
      var nyc = new NYC(configUtil.loadConfig(
        ['--report-dir=./alternative-report', '--reporter=lcov']
      ))
      nyc.reset()

      var proc = spawn(process.execPath, ['./test/fixtures/child-1.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
      })

      proc.on('close', function () {
        nyc.report()
        existsSync('./alternative-report/lcov.info').should.equal(true)
        rimraf.sync('./alternative-report')
        return done()
      })
    })
  })

  describe('addAllFiles', function () {
    it('outputs an empty coverage report for all files that are not excluded', function (done) {
      var nyc = new NYC(configUtil.loadConfig([], fixtures))
      nyc.reset()
      nyc.addAllFiles()

      var notLoadedPath = path.join(fixtures, './not-loaded.js')
      var reports = _.filter(nyc.loadReports(), function (report) {
        return ap(report)[notLoadedPath]
      })
      var report = reports[0][notLoadedPath]

      reports.length.should.equal(1)
      report.s['0'].should.equal(0)
      report.s['1'].should.equal(0)
      return done()
    })

    it('outputs an empty coverage report for multiple configured extensions', function (done) {
      var cwd = path.resolve(fixtures, './conf-multiple-extensions')
      var nyc = new NYC(configUtil.loadConfig([], cwd))
      nyc.reset()
      nyc.addAllFiles()

      var notLoadedPath1 = path.join(cwd, './not-loaded.es6')
      var notLoadedPath2 = path.join(cwd, './not-loaded.js')
      var reports = _.filter(nyc.loadReports(), function (report) {
        var apr = ap(report)
        return apr[notLoadedPath1] || apr[notLoadedPath2]
      })

      reports.length.should.equal(1)

      var report1 = reports[0][notLoadedPath1]
      report1.s['0'].should.equal(0)
      report1.s['1'].should.equal(0)

      var report2 = reports[0][notLoadedPath2]
      report2.s['0'].should.equal(0)
      report2.s['1'].should.equal(0)

      return done()
    })

    it('tracks coverage appropriately once the file is required', function (done) {
      var nyc = (new NYC(configUtil.loadConfig([], fixtures)))
      nyc.reset()
      nyc.wrap()

      require('../fixtures/not-loaded')

      nyc.writeCoverageFile()

      var notLoadedPath = path.join(fixtures, './not-loaded.js')
      var reports = _.filter(nyc.loadReports(), function (report) {
        return report[notLoadedPath]
      })
      var report = reports[0][notLoadedPath]

      reports.length.should.equal(1)
      report.s['0'].should.equal(1)
      report.s['1'].should.equal(1)

      return done()
    })

    it('transpiles .js files added via addAllFiles', function (done) {
      fs.writeFileSync(
        './test/fixtures/needs-transpile.js',
        '--> pork chop sandwiches <--\nvar a = 99',
        'utf-8'
      )

      var nyc = (new NYC(configUtil.loadConfig(['--require', './test/fixtures/transpile-hook'], fixtures)))
      nyc.reset()
      nyc.addAllFiles()

      var needsTranspilePath = path.join(fixtures, './needs-transpile.js')
      var reports = _.filter(nyc.loadReports(), function (report) {
        return ap(report)[needsTranspilePath]
      })
      var report = reports[0][needsTranspilePath]

      reports.length.should.equal(1)
      report.s['0'].should.equal(0)

      fs.unlinkSync(needsTranspilePath)
      return done()
    })
  })

  it('transpiles non-.js files added via addAllFiles', function (done) {
    fs.writeFileSync(
      './test/fixtures/needs-transpile.whatever',
      '--> pork chop sandwiches <--\nvar a = 99',
      'utf-8'
    )

    var nyc = (new NYC(configUtil.loadConfig([
      '--require=./test/fixtures/transpile-hook',
      '--extension=.whatever'
    ], fixtures)))

    nyc.reset()
    nyc.addAllFiles()

    var needsTranspilePath = path.join(fixtures, './needs-transpile.whatever')
    var reports = _.filter(nyc.loadReports(), function (report) {
      return ap(report)[needsTranspilePath]
    })
    var report = reports[0][needsTranspilePath]

    reports.length.should.equal(1)
    report.s['0'].should.equal(0)

    fs.unlinkSync(needsTranspilePath)
    return done()
  })

  describe('cache', function () {
    it('handles collisions', function (done) {
      var nyc = new NYC(configUtil.loadConfig([], fixtures))
      nyc.clearCache()

      var args = [bin, process.execPath, './cache-collision-runner.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixtures,
        env: {}
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })
  })
})
