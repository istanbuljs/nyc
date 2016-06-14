/* global describe, it */

var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var isWindows = require('is-windows')()
var fixturesCLI = path.resolve(__dirname, '../fixtures/cli')
var fakebin = path.resolve(fixturesCLI, 'fakebin')
var bin = path.resolve(__dirname, '../../bin/nyc')
var rimraf = require('rimraf')

require('chai').should()
require('tap').mochaGlobals()

// beforeEach
rimraf.sync(path.resolve(fakebin, 'node'))
rimraf.sync(path.resolve(fakebin, 'npm'))

describe('the nyc cli', function () {
  var env = { PATH: process.env.PATH }

  describe('--include', function () {
    it('can be used to limit bin to instrumenting specific files', function (done) {
      var args = [bin, '--all', '--include', 'half-covered.js', process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdout.should.match(/half-covered\.js/)
        stdout.should.not.match(/half-covered-failing\.js/)
        stdout.should.not.match(/test\.js/)
        done()
      })
    })
  })

  describe('--exclude', function () {
    it('should allow default exclude rules to be overridden', function (done) {
      var args = [bin, '--all', '--exclude', '**/half-covered.js', process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdout.should.not.match(/half-covered\.js/)
        stdout.should.match(/test\.js/)
        done()
      })
    })
  })

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

    function writeFakeNPM (shebang) {
      var targetPath = path.resolve(fakebin, 'npm')
      var source = fs.readFileSync(path.resolve(fakebin, 'npm-template.js'))
      fs.writeFileSync(targetPath, '#!' + shebang + '\n' + source)
      fs.chmodSync(targetPath, 493) // 0o755
    }

    it('can run "npm test", absolute shebang edition', function (done) {
      if (isWindows) return done()

      writeFakeNPM(process.execPath)

      var args = [bin, 'npm', 'test']
      var directory = path.resolve(fixturesCLI, 'run-npm-test-recursive')
      var proc = spawn(process.execPath, args, {
        cwd: directory,
        env: {
          PATH: fakebin + ':' + env.PATH
        }
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })

    it('can run "npm test", weird bash+dirname shebang edition', function (done) {
      if (isWindows) return done()

      // This string is taken verbatim from tools/install.py in Node core v5.x
      writeFakeNPM('/bin/sh\n// 2>/dev/null; exec "`dirname "$0"`/node" "$0" "$@"')
      fs.symlinkSync(process.execPath, path.resolve(fakebin, 'node'))

      var args = [bin, 'npm', 'test']
      var directory = path.resolve(fixturesCLI, 'run-npm-test-recursive')
      var proc = spawn(process.execPath, args, {
        cwd: directory,
        env: {
          PATH: fakebin + ':' + env.PATH
        }
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        done()
      })
    })
  })

  it('passes configuration via environment variables', function (done) {
    var args = [
      bin,
      '--silent',
      '--require=mkdirp',
      '--include=env.js',
      '--exclude=batman.js',
      '--extension=.js',
      '--cache=true',
      '--source-map=true',
      process.execPath,
      './env.js'
    ]
    var expected = {
      NYC_REQUIRE: 'mkdirp',
      NYC_INCLUDE: 'env.js',
      NYC_EXCLUDE: 'batman.js',
      NYC_EXTENSION: '.js',
      NYC_CACHE: 'enable',
      NYC_SOURCE_MAP: 'enable',
      NYC_INSTRUMENTER: './lib/instrumenters/istanbul'
    }

    var proc = spawn(process.execPath, args, {
      cwd: fixturesCLI,
      env: env
    })

    var stdout = ''
    proc.stdout.on('data', function (chunk) {
      stdout += chunk
    })

    proc.on('close', function (code) {
      code.should.equal(0)
      var env = JSON.parse(stdout)
      env.should.include(expected)
      done()
    })
  })

  it('setting instrument to "false" sets noop instrumenter', function (done) {
    var args = [
      bin,
      '--silent',
      '--no-instrument',
      '--no-source-map',
      process.execPath,
      './env.js'
    ]
    var expected = {
      NYC_SOURCE_MAP: 'disable',
      NYC_INSTRUMENTER: './lib/instrumenters/noop'
    }

    var proc = spawn(process.execPath, args, {
      cwd: fixturesCLI,
      env: env
    })

    var stdout = ''
    proc.stdout.on('data', function (chunk) {
      stdout += chunk
    })

    proc.on('close', function (code) {
      code.should.equal(0)
      var env = JSON.parse(stdout)
      env.should.include(expected)
      done()
    })
  })
})
