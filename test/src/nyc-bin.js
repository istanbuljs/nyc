/* global describe, it */

var path = require('path')
var spawn = require('child_process').spawn
var fixturesCLI = path.resolve(__dirname, '../fixtures/cli')
var bin = path.resolve(__dirname, '../../bin/nyc')

require('chai').should()
require('tap').mochaGlobals()

describe('the nyc cli', function () {
  var env = { PATH: process.env.PATH }

  describe('--check-coverage', function () {
    it('fails when the expected coverage is below a threshold', function (done) {
      var args = [bin, '--check-coverage', '--lines', '51', process.execPath, './half-covered.js']
      var message = 'ERROR: Coverage for lines (50%) does not meet global threshold (51%)'

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
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
        cwd: fixturesCLI,
        env: env
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
        cwd: fixturesCLI,
        env: env
      })

      proc.on('close', function (code) {
        code.should.not.equal(0)
        done()
      })
    })
  })

  // https://github.com/bcoe/nyc/issues/190
  describe('running "npm test"', function () {
    it('can run "npm test" which directly invokes a test file', function (done) {
      var args = [bin, 'npm', 'test']
      var directory = path.resolve(fixturesCLI, 'run-npm-test')
      var proc = spawn(process.execPath, args, {
        cwd: directory,
        env: env
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })

    it('can run "npm test" which indirectly invokes a test file', function (done) {
      var args = [bin, 'npm', 'test']
      var directory = path.resolve(fixturesCLI, 'run-npm-test-recursive')
      var proc = spawn(process.execPath, args, {
        cwd: directory,
        env: env
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })
  })
})
