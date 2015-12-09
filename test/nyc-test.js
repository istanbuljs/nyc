/* global describe, it */

var _ = require('lodash')
var fs = require('fs')
var NYC = require('../')
var path = require('path')
var rimraf = require('rimraf')
var sinon = require('sinon')
var spawn = require('child_process').spawn
var fixtures = path.resolve(__dirname, './fixtures')

// require('chai').should()
// require('tap').mochaGlobals()

describe('nyc', function () {

  describe('cwd', function () {
    it('sets cwd to process.cwd() if no environment variable is set', function () {
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
      cwdAfterEach()
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = fixtures

      var nyc = new NYC()

      nyc.cwd.should.equal(path.resolve(__dirname, './fixtures'))
      cwdAfterEach()
    })
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json", function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, './fixtures')
      })

      nyc.exclude.length.should.eql(5)
    })
  })

  describe('_prepGlobPatterns', function () {
    it('should adjust patterns appropriately', function () {
      var _prepGlobPatterns = NYC.prototype._prepGlobPatterns

      var result = _prepGlobPatterns(['./foo', 'bar/**', 'baz/'])

      result.should.deep.equal([
        './foo',
        'bar/**',
        'baz/',
        './foo/**', // Appended `/**`
        'baz/**'  // Removed trailing slash before appending `/**`
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

      var relPath = '../../nyc/node_modules/glob/glob.js'
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
      nyc.wrap()

      // clear the module cache so that
      // we pull index.js in again and wrap it.
      var name = require.resolve('../')
      delete require.cache[name]

      // when we require index.js it should be wrapped.
      var index = require('../')
      index.should.match(/__cov_/)
    })

    describe('custom require hooks are installed', function () {
      it('wraps modules with coverage counters when the custom require hook compiles them', function () {
        var hook = sinon.spy(function (module, filename) {
          module._compile(fs.readFileSync(filename, 'utf8'))
        })

        var nyc = new NYC({
          cwd: process.cwd()
        })
        nyc.wrap()

        // clear the module cache so that
        // we pull index.js in again and wrap it.
        var name = require.resolve('../')
        delete require.cache[name]

        // install the custom require hook
        require.extensions['.js'] = hook

        // when we require index.js it should be wrapped.
        var index = require('../')
        index.should.match(/__cov_/)

        // and the hook should have been called
        hook.calledOnce.should.be.true
      })
    })

    it('writes coverage report when process is killed with SIGTERM', function (done) {
      testSignal('sigterm', done)
    })

    it('writes coverage report when process is killed with SIGINT', function (done) {
      testSignal('sigint', done)
    })

    it('does not output coverage for files that have not been included, by default', function (done) {
      var nyc = (new NYC({
        cwd: process.cwd()
      })).wrap()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      reports.length.should.equal(0)
      return done()
    })
  })

  describe('report', function () {
    /*it('runs reports for all JSON in output directory', function (done) {
      var nyc = new NYC({
        cwd: process.cwd()
      }).wrap()
     var start = fs.readdirSync(nyc.tmpDirectory()).length
      var proc = spawn(process.execPath, ['./test/fixtures/sigint.js'], {
        cwd: process.cwd(),
        env: {},
        stdio: 'inherit'
      })

      proc.on('close', function (code, signal) {
        signal.should.be.equal('SIGINT');
        nyc.writeCoverageFile()
        nyc.report(
          null,
          {
            add: function (report) {
              // the subprocess we ran should output reports
              // for files in the fixtures directory.
              Object.keys(report).should.match(/.\/sigint/)
              done()
            }
          },
          {
            add: function (reporter) {
              // reporter defaults to 'text'/
              reporter.should.equal('text')
              done()
            },
            write: function () {
              console.log('foooo write', nyc.tmpDirectory())
              // we should have output a report for the new subprocess.
              var stop = fs.readdirSync(nyc.tmpDirectory()).length

             // stop.should.be.gt(start)
              // return done()
            }
          }
        )
      })
    })*/

    it('handles corrupt JSON files', function (done) {
      var nyc = new NYC({
        cwd: process.cwd()
      })
      var proc = spawn(process.execPath, ['./test/fixtures/sigint.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
      })

      fs.writeFileSync('./.nyc_output/bad.json', '}', 'utf-8')

      proc.on('close', function () {
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
    })

    it('handles multiple reporters', function (done) {
      var reporters = ['text-summary', 'text-lcov']
      var incr = 0
      var nyc = new NYC({
        cwd: process.cwd(),
        reporter: reporters
      })
      var proc = spawn(process.execPath, ['./test/fixtures/sigint.js'], {
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
    it('it handles having no .istanbul.yml in the root directory', function (done) {
      ymlAfterEach()
      var nyc = new NYC()
      nyc.wrap()
      return done()
    })

    it('uses the values in .istanbul.yml to instantiate the instrumenter', function (done) {
      writeYmlConfig()

      var nyc = new NYC({
        istanbul: istanbul
      })
      nyc.wrap()

      istanbul.config.loadFile.calledWithMatch('.istanbul.yml').should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: false
      }).should.equal(true)

      ymlAfterEach()
      return done()
    })

    it('loads the .istanbul.yml configuration from NYC_CWD', function (done) {
      var nyc = new NYC({
        istanbul: istanbul,
        cwd: './test/fixtures'
      })
      nyc.wrap()

      istanbul.config.loadFile.calledWithMatch(path.join('test', 'fixtures', '.istanbul.yml')).should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: true
      }).should.equal(true)

      ymlAfterEach()
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
      nyc.addAllFiles()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      var report = reports[0]['./test/fixtures/not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(0)
      report.s['2'].should.equal(0)
      return done()
    })

    it('tracks coverage appropriately once the file is required', function (done) {
      cwdAfterEach()
      var nyc = (new NYC({
        cwd: fixtures
      })).wrap()
      require('./fixtures/not-loaded')

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
})
