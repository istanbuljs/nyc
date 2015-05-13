/* global describe, it, afterEach, before */

require('chai').should()

var _ = require('lodash'),
  fs = require('fs'),
  spawn = require('child_process').spawn,
  NYC = require('../'),
  path = require('path'),
  rimraf = require('rimraf')

describe('nyc', function () {
  var fixtures = path.resolve(__dirname, './fixtures')

  describe('cwd', function () {

    afterEach(function () {
      delete process.env.NYC_CWD
      rimraf.sync(path.resolve(fixtures, './nyc_output'))
    })

    it('sets cwd to process.cwd() if no environment variable is set', function () {
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, './fixtures')

      var nyc = new NYC()

      nyc.cwd.should.match(/nyc\/test\/fixtures/)
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

    before(function () {
      nyc = (new NYC({
        cwd: process.cwd()
      })).wrap()
    })

    it('wraps modules with coverage counters when they are required', function () {
      // clear the module cache so that
      // we pull index.js in again and wrap it.
      var name = require.resolve('../')
      delete require.cache[name]

      // when we require index.js it shoudl be wrapped.
      var index = require('../')
      index.should.match(/__cov_/)
    })

    it('writes coverage report when process exits', function (done) {
      var proc = spawn('./bin/nyc.js', ['index.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: [process.stdin, process.stdout, process.stderr]
      })

      proc.on('close', function () {
        fs.readdirSync('./nyc_output').length.should.be.gte(1)
        return done()
      })
    })

    function testSignal (signal, done) {
      var proc = spawn('./bin/nyc.js', ['./test/fixtures/' + signal + '.js'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: [process.stdin, process.stdout, process.stderr]
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

    it('writes coverage report when process is killed with SIGHUP', function (done) {
      testSignal('sighup', done)
    })

    it('writes coverage report when process is killed with SIGINT', function (done) {
      testSignal('sigint', done)
    })
  })

  describe('report', function () {
    it('runs reports for all JSON in output directory', function (done) {
      var nyc = new NYC({
          cwd: fixtures
        }),
        proc = spawn('../../bin/nyc.js', ['sigterm.js'], {
          cwd: fixtures,
          env: process.env,
          stdio: [process.stdin, process.stdout, process.stderr]
        })

      proc.on('close', function () {
        nyc.report(
          {
            add: function (report) {
              // the subprocess we ran should have created
              // a coverage report on ./sigterm.js.
              Object.keys(report).should.include('./sigterm.js')
            }
          },
          {
            add: function (reporter) {
              // reporter defaults to 'text'/
              reporter.should.equal('text')
            },
            write: function () {
              return done()
            }
          }
        )
      })
    })
  })
})
