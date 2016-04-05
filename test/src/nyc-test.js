/* global describe, it */

require('source-map-support').install()
var _ = require('lodash')
var ap = require('any-path')
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
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, '../fixtures')

      var nyc = new NYC()

      nyc.cwd.should.equal(path.resolve(__dirname, '../fixtures'))
    })

    it('will look upwards for package.json from cwd', function () {
      var nyc = new NYC({cwd: __dirname})
      nyc.cwd.should.eql(path.join(__dirname, '../..'))
    })
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json#nyc", function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, '../fixtures')
      })

      nyc.exclude.length.should.eql(5)
    })

    it("loads 'extension' patterns from package.json#nyc", function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, '../fixtures/conf-multiple-extensions')
      })

      nyc.extensions.length.should.eql(3)
    })
  })

  describe('_prepGlobPatterns', function () {
    it('should adjust patterns appropriately', function () {
      var _prepGlobPatterns = new NYC()._prepGlobPatterns

      var result = _prepGlobPatterns(['./foo', 'bar/**', 'baz/'])

      result.should.deep.equal([
        './foo/**', // Appended `/**`
        './foo',
        'bar/**',
        'baz/**',  // Removed trailing slash before appending `/**`
        'baz/'
      ])
    })
  })

  describe('shouldInstrumentFile', function () {
    it('should exclude appropriately with defaults', function () {
      var nyc = new NYC({
        cwd: '/cwd/'
      })

      // Root package contains config.exclude
      // Restore exclude to default patterns
      nyc.exclude = nyc._prepGlobPatterns([
        '**/node_modules/**',
        'test/**',
        'test{,-*}.js',
        '**/*.test.js',
        '**/__tests__/**'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // nyc always excludes "node_modules/**"
      shouldInstrumentFile('/cwd/foo', 'foo').should.equal(true)
      shouldInstrumentFile('/cwd/node_modules/bar', 'node_modules/bar').should.equal(false)
      shouldInstrumentFile('/cwd/foo/node_modules/bar', 'foo/node_modules/bar').should.equal(false)
      shouldInstrumentFile('/cwd/test.js', 'test.js').should.equal(false)
      shouldInstrumentFile('/cwd/testfoo.js', 'testfoo.js').should.equal(true)
      shouldInstrumentFile('/cwd/test-foo.js', 'test-foo.js').should.equal(false)
      shouldInstrumentFile('/cwd/lib/test.js', 'lib/test.js').should.equal(true)
      shouldInstrumentFile('/cwd/foo/bar/test.js', './test.js').should.equal(false)
      shouldInstrumentFile('/cwd/foo/bar/test.js', '.\\test.js').should.equal(false)
      shouldInstrumentFile('/cwd/foo/bar/foo.test.js', './foo.test.js').should.equal(false)
      shouldInstrumentFile('/cwd/foo/bar/__tests__/foo.js', './__tests__/foo.js').should.equal(false)
    })

    it('should exclude appropriately with config.exclude', function () {
      var nyc = new NYC({
        cwd: fixtures
      })
      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // fixtures/package.json configures excludes: "blarg", "blerg"
      shouldInstrumentFile('blarg', 'blarg').should.equal(false)
      shouldInstrumentFile('blarg/foo.js', 'blarg/foo.js').should.equal(false)
      shouldInstrumentFile('blerg', 'blerg').should.equal(false)
      shouldInstrumentFile('./blerg', './blerg').should.equal(false)
      shouldInstrumentFile('./blerg', '.\\blerg').should.equal(false)
    })

    it('should exclude outside of the current working directory', function () {
      var nyc = new NYC({
        cwd: '/cwd/foo/'
      })
      nyc.shouldInstrumentFile('/cwd/bar', '../bar').should.equal(false)
    })

    it('should not exclude if the current working directory is inside node_modules', function () {
      var nyc = new NYC({
        cwd: '/cwd/node_modules/foo/'
      })
      nyc.shouldInstrumentFile('/cwd/node_modules/foo/bar', './bar').should.equal(true)
      nyc.shouldInstrumentFile('/cwd/node_modules/foo/bar', '.\\bar').should.equal(true)
    })

    it('allows files to be explicitly included, rather than excluded', function () {
      var nyc = new NYC({
        cwd: '/cwd/'
      })

      nyc.include = nyc._prepGlobPatterns([
        'foo.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)
      shouldInstrumentFile('/cwd/foo.js', 'foo.js').should.equal(true)
      shouldInstrumentFile('/cwd/index.js', 'index.js').should.equal(false)
    })

    it('exclude overrides include', function () {
      var nyc = new NYC({
        cwd: '/cwd/'
      })

      nyc.include = nyc._prepGlobPatterns([
        'foo.js',
        'test.js'
      ])
      // Ensure default exclude patterns apply, which excludes test.js
      nyc.exclude = nyc._prepGlobPatterns([
        '**/node_modules/**',
        'test/**',
        'test{,-*}.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)
      shouldInstrumentFile('/cwd/foo.js', 'foo.js').should.equal(true)
      shouldInstrumentFile('/cwd/test.js', 'test.js').should.equal(false)
    })
  })

  describe('wrap', function () {
    it('wraps modules with coverage counters when they are required', function () {
      var nyc = new NYC({
        cwd: process.cwd()
      })
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
        require('istanbul')

        var nyc = new NYC({
          cwd: process.cwd()
        })
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

    describe('compile handlers for custom extensions are assigned', function () {
      it('assigns a function to custom extensions', function () {
        var nyc = new NYC({
          cwd: path.resolve(__dirname, '../fixtures/conf-multiple-extensions')
        })
        nyc.reset()
        nyc.wrap()

        require.extensions['.es6'].should.be.a.function
        require.extensions['.foo.bar'].should.be.a.function

        // default should still exist
        require.extensions['.js'].should.be.a.function
      })

      it('calls the `_handleJs` function for custom file extensions', function () {
        // the `require` call to istanbul is deferred, loaded here so it doesn't mess with the hooks callCount
        require('istanbul')

        var nyc = new NYC({
          cwd: path.resolve(__dirname, '../fixtures/conf-multiple-extensions')
        })

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
      var nyc = (new NYC({
        cwd: fixtures
      }))

      var proc = spawn(process.execPath, [bin, './' + signal + '.js'], {
        cwd: fixtures,
        env: {},
        stdio: 'ignore'
      })

      proc.on('close', function () {
        var reports = _.filter(nyc._loadReports(), function (report) {
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
      var nyc = (new NYC({
        cwd: process.cwd()
      }))
      nyc.wrap()
      nyc.reset()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      reports.length.should.equal(0)
      return done()
    })
  })

  describe('report', function () {
    it('runs reports for all JSON in output directory', function (done) {
      var nyc = new NYC({
        cwd: fixtures
      })

      var proc = spawn(process.execPath, [bin, './spawn.js'], {
        cwd: fixtures,
        env: {},
        stdio: 'ignore'
      })

      proc.on('close', function () {
        nyc.report(
          null,
          {
            add: function (report) {
              // the subprocess we ran should output reports
              // for files in the fixtures directory.
              var expected = [
                'spawn.js',
                'child-1.js',
                'child-2.js'
              ].map(function (relFile) {
                return path.join(fixtures, relFile)
              })
              expected.should.include.members(Object.keys(report))
            }
          },
          {
            add: function (reporter) {
              // reporter defaults to 'text'/
              reporter.should.equal('text')
            },
            write: function () {
              // we should have output a report for the new subprocess.
              var stop = fs.readdirSync(nyc.tempDirectory()).length
              stop.should.be.eql(3)
              return done()
            }
          }
        )
      })
    })

    it('handles corrupt JSON files', function (done) {
      var nyc = new NYC({
        cwd: process.cwd()
      })
      nyc.reset()

      fs.writeFileSync('./.nyc_output/bad.json', '}', 'utf-8')

      nyc.report(
        null,
        {
          add: function (report) {}
        },
        {
          add: function (reporter) {},
          write: function () {
            // we should get here without exception.
            fs.unlinkSync('./.nyc_output/bad.json')
            return done()
          }
        }
      )
    })

    it('handles multiple reporters', function (done) {
      var reporters = ['text-summary', 'text-lcov']
      var incr = 0
      var nyc = new NYC({
        cwd: process.cwd(),
        reporter: reporters
      })
      nyc.reset()

      var proc = spawn(process.execPath, ['./test/fixtures/child-1.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
      })

      proc.on('close', function () {
        nyc.report(
          null,
          {
            add: function (report) {}
          },
          {
            add: function (reporter) {
              incr += !!~reporters.indexOf(reporter)
            },
            write: function () {
              incr.should.eql(reporters.length)
              return done()
            }
          }
        )
      })
    })

    it('allows coverage report to be output in an alternative directory', function (done) {
      var reporters = ['lcov']
      var nyc = new NYC({
        cwd: process.cwd(),
        reporter: reporters,
        reportDir: './alternative-report'
      })
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

  describe('.istanbul.yml configuration', function () {
    var istanbul = require('istanbul')
    var configSpy = sinon.spy(istanbul.config, 'loadFile')
    var instrumenterSpy = sinon.spy(istanbul, 'Instrumenter')

    function writeConfig () {
      fs.writeFileSync('./.istanbul.yml', 'instrumentation:\n\tpreserve-comments: true', 'utf-8')
    }

    function afterEach () {
      configSpy.reset()
      instrumenterSpy.reset()
      rimraf.sync('./.istanbul.yml')
    }

    it('it handles having no .istanbul.yml in the root directory', function (done) {
      afterEach()
      var nyc = new NYC()
      nyc.wrap()
      return done()
    })

    it('uses the values in .istanbul.yml to instantiate the instrumenter', function (done) {
      writeConfig()

      var nyc = new NYC({
        istanbul: istanbul
      })
      nyc.wrap()

      nyc.instrumenter()

      istanbul.config.loadFile.calledWithMatch('.istanbul.yml').should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: false
      }).should.equal(true)

      afterEach()
      return done()
    })

    it('loads the .istanbul.yml configuration from NYC_CWD', function (done) {
      var nyc = new NYC({
        istanbul: istanbul,
        cwd: './test/fixtures'
      })
      nyc.wrap()

      nyc.instrumenter()

      istanbul.config.loadFile.calledWithMatch(path.join('test', 'fixtures', '.istanbul.yml')).should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: true
      }).should.equal(true)

      afterEach()
      return done()
    })
  })

  describe('mungeArgs', function () {
    it('removes dashed options that proceed bin', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--reporter',
        'lcov',
        'node',
        'test/nyc-test.js'
      ]

      var yargv = require('yargs/yargs')(process.argv.slice(2)).argv

      var munged = (new NYC()).mungeArgs(yargv)

      munged.should.eql(['node', 'test/nyc-test.js'])
    })
  })

  describe('addAllFiles', function () {
    it('outputs an empty coverage report for all files that are not excluded', function (done) {
      var nyc = new NYC({
        cwd: fixtures
      })
      nyc.reset()
      nyc.addAllFiles()

      var notLoadedPath = path.join(fixtures, './not-loaded.js')
      var reports = _.filter(nyc._loadReports(), function (report) {
        return ap(report)[notLoadedPath]
      })
      var report = reports[0][notLoadedPath]

      reports.length.should.equal(1)
      report.s['1'].should.equal(0)
      report.s['2'].should.equal(0)
      return done()
    })

    it('outputs an empty coverage report for multiple configured extensions', function (done) {
      var cwd = path.resolve(fixtures, './conf-multiple-extensions')
      var nyc = new NYC({
        cwd: cwd
      })
      nyc.reset()
      nyc.addAllFiles()

      var notLoadedPath1 = path.join(cwd, './not-loaded.es6')
      var notLoadedPath2 = path.join(cwd, './not-loaded.js')
      var reports = _.filter(nyc._loadReports(), function (report) {
        var apr = ap(report)
        return apr[notLoadedPath1] || apr[notLoadedPath2]
      })

      reports.length.should.equal(1)

      var report1 = reports[0][notLoadedPath1]
      report1.s['1'].should.equal(0)
      report1.s['2'].should.equal(0)

      var report2 = reports[0][notLoadedPath2]
      report2.s['1'].should.equal(0)
      report2.s['2'].should.equal(0)

      return done()
    })

    it('tracks coverage appropriately once the file is required', function (done) {
      var nyc = (new NYC({
        cwd: fixtures
      }))
      nyc.reset()
      nyc.wrap()

      require('../fixtures/not-loaded')

      nyc.writeCoverageFile()

      var notLoadedPath = path.join(fixtures, './not-loaded.js')
      var reports = _.filter(nyc._loadReports(), function (report) {
        return report[notLoadedPath]
      })
      var report = reports[0][notLoadedPath]

      reports.length.should.equal(1)
      report.s['1'].should.equal(1)
      report.s['2'].should.equal(1)

      return done()
    })

    it('transpiles files added via addAllFiles', function (done) {
      fs.writeFileSync(
        './test/fixtures/needs-transpile.js',
        '--> pork chop sandwiches <--\nvar a = 99',
        'utf-8'
      )

      var nyc = (new NYC({
        cwd: fixtures,
        require: './test/fixtures/transpile-hook'
      }))

      nyc.reset()
      nyc.addAllFiles()

      var needsTranspilePath = path.join(fixtures, './needs-transpile.js')
      var reports = _.filter(nyc._loadReports(), function (report) {
        return ap(report)[needsTranspilePath]
      })
      var report = reports[0][needsTranspilePath]

      reports.length.should.equal(1)
      report.s['1'].should.equal(0)

      fs.unlinkSync(needsTranspilePath)
      return done()
    })
  })

  describe('cache', function () {
    it('handles collisions', function (done) {
      var nyc = new NYC({cwd: fixtures})
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

  describe('--check-coverage (CLI)', function () {
    it('fails when the expected coverage is below a threshold', function (done) {
      var args = [bin, '--check-coverage', '--lines', '51', process.execPath, './half-covered.js']
      var message = 'ERROR: Coverage for lines (50%) does not meet global threshold (51%)'

      var proc = spawn(process.execPath, args, {
        cwd: fixtures,
        env: {}
      })

      var stderr = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })

      proc.on('close', function (code) {
        code.should.not.equal(0)
        stderr.trim().should.equal(message)
        done()
      })
    })

    it('succeeds when the expected coverage is above a threshold', function (done) {
      var args = [bin, '--check-coverage', '--lines', '49', process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixtures,
        env: {}
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })

    // https://github.com/bcoe/nyc/issues/209
    it('fails in any case when the underlying test failed', function (done) {
      var args = [bin, '--check-coverage', '--lines', '49', process.execPath, './half-covered-failing.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixtures,
        env: {}
      })

      proc.on('close', function (code) {
        code.should.not.equal(0)
        done()
      })
    })
  })
})
