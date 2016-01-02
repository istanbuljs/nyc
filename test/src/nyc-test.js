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
var rimraf = require('rimraf')
var sinon = require('sinon')
var isWindows = require('is-windows')()
var spawn = require('child_process').spawn
var fixtures = path.resolve(__dirname, '../fixtures')
var projectDir = path.resolve(__dirname, '../..')
var projectTempDir = path.join(projectDir, '.nyc_output')
var projectCacheDir = path.join(projectDir, 'node_modules', '.cache', 'nyc')
var fixtureTempDir = path.join(fixtures, '.nyc_output')
var fixtureCacheDir = path.join(fixtures, 'node_modules', '.cache', 'nyc')
var bin = path.resolve(__dirname, '../../bin/nyc')

// beforeEach
rimraf.sync(projectTempDir)
rimraf.sync(fixtureTempDir)
rimraf.sync(projectCacheDir)
rimraf.sync(fixtureCacheDir)
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
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json", function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, '../fixtures')
      })

      nyc.exclude.length.should.eql(5)
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
      var nyc = new NYC()

      // Root package contains config.exclude
      // Restore exclude to default patterns
      nyc.exclude = nyc._prepGlobPatterns([
        '**/node_modules/**',
        'test/**',
        'test{,-*}.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // nyc always excludes "node_modules/**"
      shouldInstrumentFile('foo', 'foo').should.equal(true)
      shouldInstrumentFile('node_modules/bar', 'node_modules/bar').should.equal(false)
      shouldInstrumentFile('foo/node_modules/bar', 'foo/node_modules/bar').should.equal(false)
      shouldInstrumentFile('test.js', 'test.js').should.equal(false)
      shouldInstrumentFile('testfoo.js', 'testfoo.js').should.equal(true)
      shouldInstrumentFile('test-foo.js', 'test-foo.js').should.equal(false)
      shouldInstrumentFile('lib/test.js', 'lib/test.js').should.equal(true)
      shouldInstrumentFile('/foo/bar/test.js', './test.js').should.equal(false)
    })

    it('should exclude appropriately with config.exclude', function () {
      var nyc = new NYC({
        cwd: fixtures
      })
      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // config.excludes: "blarg", "blerg"
      shouldInstrumentFile('blarg', 'blarg').should.equal(false)
      shouldInstrumentFile('blarg/foo.js', 'blarg/foo.js').should.equal(false)
      shouldInstrumentFile('blerg', 'blerg').should.equal(false)
      shouldInstrumentFile('./blerg', './blerg').should.equal(false)
    })

    it('should handle example symlinked node_module', function () {
      var nyc = new NYC({
        cwd: fixtures
      })
      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      var relPath = '../../../nyc/node_modules/glob/glob.js'
      var fullPath = '/Users/user/nyc/node_modules/glob/glob.js'

      shouldInstrumentFile(fullPath, relPath).should.equal(false)

      // Full path should be excluded (node_modules)
      shouldInstrumentFile(fullPath, relPath).should.equal(false)

      // Send both relative and absolute path
      // Results in exclusion (include = false)
      shouldInstrumentFile(fullPath, relPath).should.equal(false)
    })

    it('allows a file to be included rather than excluded', function () {
      var nyc = new NYC()

      // Root package contains config.exclude
      // Restore exclude to default patterns
      nyc.include = nyc._prepGlobPatterns([
        'test.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)
      shouldInstrumentFile('test.js', 'test.js').should.equal(true)
      shouldInstrumentFile('index.js', 'index.js').should.equal(false)
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
          return report['./' + signal + '.js']
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
              Object.keys(report).should.match(/.\/(spawn|child-1|child-2)\.js/)
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

      var yargv = require('yargs').argv

      var munged = (new NYC()).mungeArgs(yargv)

      munged.should.eql(['node', 'test/nyc-test.js'])
    })
  })

  describe('addAllFiles', function () {
    it('outputs an empty coverage report for all files that are not excluded', function (done) {
      var nyc = (new NYC())
      nyc.reset()
      nyc.addAllFiles()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return ap(report)['./test/fixtures/not-loaded.js']
      })
      var report = reports[0]['./test/fixtures/not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(0)
      report.s['2'].should.equal(0)
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
      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./not-loaded.js']
      })
      var report = reports[0]['./not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(1)
      report.s['2'].should.equal(1)

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
})
