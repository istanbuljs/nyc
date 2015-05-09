/* global describe, it, afterEach */

require('chai').should()

var cp = require('child_process'),
  NYC = require('../'),
  path = require('path')

describe('nyc', function () {
  describe('cwd', function () {
    afterEach(function () {
      delete process.env.NYC_CWD
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
      var nyc = new NYC()

      nyc.exclude.length.should.eql(1)
    })
  })

  describe('wrapSpawn', function () {
    var child = cp.spawn('echo', [])

    it('wraps spawn() and replaces node/iojs with subprocessBin', function (done) {
      var ChildProcess = child.constructor,
        nyc = new NYC()

      ChildProcess.prototype.spawn = function (options) {
        options.args.length.should.equal(2)
        options.args[1].should.equal(nyc.subprocessBin)
        return done()
      }

      nyc.wrapSpawn(child)

      cp.spawn('node', {})
    })

    it('wraps exec() and replaces node/iojs', function (done) {
      var nyc = new NYC()

      cp.exec = function (command) {
        return done()
      }

      nyc.wrapSpawn(child)

      cp.exec('node foo bar')
    })
  })

  describe('wrapRequire', function () {
    it('uses istanbul to wrap modules when required', function () {
      (new NYC()).wrapRequire()

      var A = require('./fixtures/a')
      A.should.match(/__cov_/)
    })
  })

  describe('report', function () {
  })
})
