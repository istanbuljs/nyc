/* global describe, it, afterEach, beforeEach */

require('chai').should()

var fs = require('fs'),
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

    it('sets cwd to process.cwd() if no environment variable set', function () {
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, './fixtures')

      var nyc = new NYC()

      nyc.cwd.should.match(/nyc\/test\/fixtures/)
    })
  })

  describe('exclude', function () {
    it('loads exclude patterns from package.json in cwd', function () {
      var nyc = new NYC({
        cwd: path.resolve(__dirname, './fixtures')
      })

      nyc.exclude.length.should.eql(3)
    })
  })

  describe('wrap', function () {
    afterEach(function () {
      delete global.__coverage__['./a.js']
    })

    it('wraps modules with coverage counters when they are required', function () {
      (new NYC({
        cwd: path.resolve(__dirname, './fixtures')
      })).wrap()

      var A = require('./fixtures/a')
      A.should.match(/__cov_/)
    })

    it('wraps spawn and writes coverage report for subprocesses', function (done) {
      (new NYC({
        cwd: process.cwd()
      })).wrap()

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
  })

  describe('report', function () {
    beforeEach(function () {
      rimraf.sync(path.resolve(fixtures, './nyc_output'))
    })

    it('runs reports for JSON in output directory', function (done) {
      var nyc = new NYC({
          cwd: fixtures
        }),
        proc = spawn('../../bin/nyc.js', ['a.js'], {
          cwd: fixtures,
          env: process.env,
          stdio: [process.stdin, process.stdout, process.stderr]
        })

      proc.on('close', function () {
        nyc.report(
          {
            add: function (report) {
              // the subprocess we ran should have created
              // a coverage report on ./a.js.
              Object.keys(report).should.include('./a.js')
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
