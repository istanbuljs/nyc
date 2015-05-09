/* global describe, it */

require('chai').should()

var cp = require('child_process'),
  NYC = require('../')

describe('nyc', function () {
  describe('pattern', function () {
    it('loads pattern from package.json in cwd', function () {
      var nyc = new NYC()

      nyc.pattern.length.should.eql(1)
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
