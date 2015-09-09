/* global describe, it */

var _ = require('lodash')
var fs = require('fs')
var NYC = require('../')
var path = require('path')
var rimraf = require('rimraf')
var sinon = require('sinon')
var spawn = require('child_process').spawn

require('chai').should()
require('tap').mochaGlobals()

describe('nyc', function () {
  var fixtures = path.resolve(__dirname, './fixtures')

  describe('cwd', function () {
    function afterEach () {
      delete process.env.NYC_CWD
      rimraf.sync(path.resolve(fixtures, './nyc_output'))
    }

    it('sets cwd to process.cwd() if no environment variable is set', function () {
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
      afterEach()
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, './fixtures')

      var nyc = new NYC()

      nyc.cwd.should.equal(path.resolve(__dirname, './fixtures'))
      afterEach()
    })
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json", function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, './fixtures')
      })

      nyc.exclude.length.should.eql(3)
    })
  })

  describe('wrap', function () {
    var nyc

    it('wraps modules with coverage counters when they are required', function () {
      nyc = (new NYC({
        cwd: process.cwd()
      })).wrap()

      // clear the module cache so that
      // we pull index.js in again and wrap it.
      var name = require.resolve('../')
      delete require.cache[name]

      // when we require index.js it should be wrapped.
      var index = require('../')
      index.should.match(/__cov_/)
    })

    function testSignal (signal, done) {
      var proc = spawn(process.execPath, ['./test/fixtures/' + signal + '.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
      })

      proc.on('close', function () {
        var reports = _.filter(nyc._loadReports(), function (report) {
          return report['./test/fixtures/' + signal + '.js']
        })
        reports.length.should.equal(1)
        return done()
      })
    }

    it('writes coverage report when process is killed with SIGTERM', function (done) {
      testSignal('sigterm', done)
    })

    it('writes coverage report when process is killed with SIGINT', function (done) {
      testSignal('sigint', done)
    })

    it('does not output coverage for files that have not been included, by default', function (done) {
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
        cwd: process.cwd()
      })
      var proc = spawn(process.execPath, ['./test/fixtures/sigint.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
      })
      var start = fs.readdirSync(nyc.tmpDirectory()).length

      proc.on('close', function () {
        nyc.report(
          null,
          {
            add: function (report) {
              // the subprocess we ran should output reports
              // for files in the fixtures directory.
              Object.keys(report).should.match(/.\/test\/fixtures\//)
            }
          },
          {
            add: function (reporter) {
              // reporter defaults to 'text'/
              reporter.should.equal('text')
            },
            write: function () {
              // we should have output a report for the new subprocess.
              var stop = fs.readdirSync(nyc.tmpDirectory()).length
              stop.should.be.gt(start)
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
      var nyc = (new NYC({
        cwd: process.cwd()
      })).wrap()
      require('./fixtures/not-loaded')
      nyc.writeCoverageFile()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      var report = reports[0]['./test/fixtures/not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(1)
      report.s['2'].should.equal(1)

      return done()
    })
  })
})
