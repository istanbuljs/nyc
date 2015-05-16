/* global describe, it */

var _ = require('lodash'),
  fs = require('fs'),
  NYC = require('../'),
  path = require('path'),
  rimraf = require('rimraf'),
  spawn = require('child_process').spawn

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

      nyc.cwd.should.match(/nyc\/test\/fixtures/)
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
  })

  describe('report', function () {
    it('runs reports for all JSON in output directory', function (done) {
      var nyc = new NYC({
          cwd: process.cwd()
        }),
        proc = spawn(process.execPath, ['./test/fixtures/sigint.js'], {
          cwd: process.cwd(),
          env: process.env,
          stdio: 'inherit'
        }),
        start = fs.readdirSync(nyc.tmpDirectory()).length

      proc.on('close', function () {
        nyc.report(
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
  })
})
