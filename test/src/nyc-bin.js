/* global describe, it */

var _ = require('lodash')
var path = require('path')
var bin = path.resolve(__dirname, '../../bin/nyc')
var fixturesCLI = path.resolve(__dirname, '../fixtures/cli')
var fakebin = path.resolve(fixturesCLI, 'fakebin')
var fixturesHooks = path.resolve(__dirname, '../fixtures/hooks')
var fs = require('fs')
var glob = require('glob')
var isWindows = require('is-windows')()
var rimraf = require('rimraf')
var spawn = require('child_process').spawn

require('chai').should()
require('tap').mochaGlobals()

// beforeEach
rimraf.sync(path.resolve(fakebin, 'node'))
rimraf.sync(path.resolve(fakebin, 'npm'))
rimraf.sync(path.resolve(fixturesCLI, 'subdir', 'output-dir'))

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

    // https://github.com/istanbuljs/nyc/issues/384
    it('fails when check-coverage command is used rather than flag', function (done) {
      var args = [bin, 'check-coverage', '--lines', '51', process.execPath, './half-covered.js']
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

  describe('configuration', function () {
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
        instrumenter: './lib/instrumenters/istanbul',
        silent: true,
        cache: true,
        sourceMap: true
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
        var config = JSON.parse(env.NYC_CONFIG, null, 2)
        config.should.include(expected)
        config.include.should.include('env.js')
        config.exclude.should.include('batman.js')
        config.extension.should.include('.js')
        done()
      })
    })

    it('allows package.json configuration to be overridden with command line args', function (done) {
      var args = [bin, '--reporter=text-lcov', process.execPath, './half-covered.js']

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
        stdout.should.match(/SF:.*half-covered\.js/)
        done()
      })
    })

    describe('.nycrc', function () {
      var cwd = path.resolve(fixturesCLI, './nycrc')

      it('loads configuration from package.json and .nycrc', function (done) {
        var args = [bin, process.execPath, './index.js']

        var proc = spawn(process.execPath, args, {
          cwd: cwd,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdout.should.match(/SF:.*index\.js/)
          stdout.should.not.match(/SF:.*ignore\.js/)
          done()
        })
      })

      it('allows .nycrc configuration to be overridden with command line args', function (done) {
        var args = [bin, '--exclude=foo.js', process.execPath, './index.js']

        var proc = spawn(process.execPath, args, {
          cwd: cwd,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdout.should.match(/SF:.*index\.js/)
          stdout.should.match(/SF:.*ignore\.js/)
          done()
        })
      })
    })
  })

  describe('coverage', function () {
    if (parseInt(process.versions.node.split('.')[0]) < 4) return
    it('reports appropriate coverage information for es6 source files', function (done) {
      var args = [bin, '--reporter=lcov', '--reporter=text', process.execPath, './es6.js']

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
        // we should miss covering the appropriate lines.
        stdout.should.match(/11,16,17/)
        done()
      })
    })
  })

  describe('instrument', function () {
    describe('no output folder', function () {
      it('allows a single file to be instrumented', function (done) {
        var args = [bin, 'instrument', './half-covered.js']

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
          stdout.should.match(/path:"\.\/half-covered\.js"/)
          done()
        })
      })

      it('allows a directory of files to be instrumented', function (done) {
        var args = [bin, 'instrument', './']

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
          stdout.should.match(/half-covered\.js"/)
          stdout.should.match(/half-covered-failing\.js"/)
          stdout.should.not.match(/spawn\.js"/)
          done()
        })
      })

      it('works in directories without a package.json', function (done) {
        var args = [bin, 'instrument', './input-dir', './output-dir']

        var subdir = path.resolve(fixturesCLI, 'subdir')
        var proc = spawn(process.execPath, args, {
          cwd: subdir,
          env: env
        })

        proc.on('exit', function (code) {
          code.should.equal(0)
          var target = path.resolve(subdir, 'output-dir', 'index.js')
          fs.readFileSync(target, 'utf8')
              .should.match(/console.log\('Hello, World!'\)/)
          done()
        })
      })
    })

    describe('output folder specified', function () {
      it('allows a single file to be instrumented', function (done) {
        var args = [bin, 'instrument', './half-covered.js', './output']

        var proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          var files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.equal(1)
          files.should.include('half-covered.js')
          rimraf.sync(path.resolve(fixturesCLI, 'output'))
          done()
        })
      })

      it('allows a directory of files to be instrumented', function (done) {
        var args = [bin, 'instrument', './', './output']

        var proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          var files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.should.include('env.js')
          files.should.include('es6.js')
          rimraf.sync(path.resolve(fixturesCLI, 'output'))
          done()
        })
      })
    })
  })

  describe('hooks', function () {
    it('provides coverage for requireJS and AMD modules', function (done) {
      var args = [bin, process.execPath, './index.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesHooks,
        env: process.env
      })
      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })
      proc.on('close', function (code) {
        code.should.equal(0)
        stdout.should.match(/ipsum\.js/)
        stdout.should.match(/lorem\.js/)
        done()
      })
    })
  })

  describe('args', function () {
    it('does not interpret args intended for instrumented bin', function (done) {
      var args = [bin, '--silent', process.execPath, 'args.js', '--help', '--version']

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
        var args = JSON.parse(stdout)
        args.should.include('--help')
        args.should.include('--version')
        args.should.not.include('--silent')
        done()
      })
    })

    it('interprets first args after -- as Node.js execArgv', function (done) {
      var args = [bin, '--', '--expose-gc', path.resolve(fixturesCLI, 'gc.js')]

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.setEncoding('utf8')
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdout.should.include('still running')
        done()
      })
    })
  })

  describe('--show-process-tree', function () {
    it('displays a tree of spawned processes', function (done) {
      var args = [bin, '--show-process-tree', process.execPath, 'selfspawn-fibonacci.js', '5']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.setEncoding('utf8')
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdout.should.match(new RegExp(
          'nyc\n' +
          '└─┬.*selfspawn-fibonacci.js 5\n' +
          '  │.* % Lines\n' +
          '  ├─┬.*selfspawn-fibonacci.js 4\n' +
          '  │ │.* % Lines\n' +
          '  │ ├─┬.*selfspawn-fibonacci.js 3\n' +
          '  │ │ │.* % Lines\n' +
          '  │ │ ├──.*selfspawn-fibonacci.js 2\n' +
          '  │ │ │.* % Lines\n' +
          '  │ │ └──.*selfspawn-fibonacci.js 1\n' +
          '  │ │    .* % Lines\n' +
          '  │ └──.*selfspawn-fibonacci.js 2\n' +
          '  │    .* % Lines\n' +
          '  └─┬.*selfspawn-fibonacci.js 3\n' +
          '    │.* % Lines\n' +
          '    ├──.*selfspawn-fibonacci.js 2\n' +
          '    │.* % Lines\n' +
          '    └──.*selfspawn-fibonacci.js 1\n' +
          '       .* % Lines\n'
        ))
        done()
      })
    })

    it('doesn’t create the temp directory for process info files when not present', function (done) {
      var args = [bin, process.execPath, 'selfspawn-fibonacci.js', '5']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      proc.on('exit', function (code) {
        code.should.equal(0)
        fs.stat(path.resolve(fixturesCLI, '.nyc_output', 'processinfo'), function (err, stat) {
          err.code.should.equal('ENOENT')
          done()
        })
      })
    })
  })

  describe('noop instrumenter', function () {
    it('setting instrument to "false" configures noop instrumenter', function (done) {
      var args = [
        bin,
        '--silent',
        '--no-instrument',
        '--no-source-map',
        process.execPath,
        './env.js'
      ]
      var expected = {
        silent: true,
        instrument: false,
        sourceMap: false,
        instrumenter: './lib/instrumenters/noop'
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
        var config = JSON.parse(env.NYC_CONFIG, null, 2)
        config.should.include(expected)
        done()
      })
    })

    describe('--all', function () {
      it('extracts coverage headers from unexecuted files', function (done) {
        var nycOutput = path.resolve(fixturesCLI, '.nyc_output')
        rimraf.sync(nycOutput)

        var args = [
          bin,
          '--all',
          '--silent',
          '--no-instrument',
          '--no-source-map',
          process.execPath,
          // any file other than external-instrument.js, which we
          // want to ensure has its header loaded.
          './env.js'
        ]

        var proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          glob(nycOutput + '/*.json', function (_err, files) {
            // we should have extracted the coverage header from external-instrumenter.js.
            var coverage = {}
            files.forEach(function (file) {
              _.assign(coverage, JSON.parse(
                fs.readFileSync(file, 'utf-8')
              ))
            })
            Object.keys(coverage).should.include('./external-instrumenter.js')

            // we should not have executed file, so all counts sould be 0.
            var sum = 0
            ;Object.keys(coverage['./external-instrumenter.js'].s).forEach(function (k) {
              sum += coverage['./external-instrumenter.js'].s[k]
            })
            sum.should.equal(0)

            return done()
          })
        })
      })
    })
  })

  it('allows an alternative cache folder to be specified', function (done) {
    var args = [bin, '--cache-dir=./foo-cache', '--cache=true', process.execPath, './half-covered.js']

    var proc = spawn(process.execPath, args, {
      cwd: fixturesCLI,
      env: env
    })
    proc.on('close', function (code) {
      code.should.equal(0)
      // we should have created ./foo-cache rather
      // than the default ./node_modules/.cache.
      fs.readdirSync(path.resolve(
        fixturesCLI, './foo-cache'
      )).length.should.equal(1)
      rimraf.sync(path.resolve(fixturesCLI, 'foo-cache'))
      done()
    })
  })

  it('allows alternative high and low watermarks to be configured', function (done) {
    var args = [
      bin,
      '--watermarks.lines=90',
      '--watermarks.lines=100',
      '--watermarks.statements=30',
      '--watermarks.statements=40',
      '--cache=true',
      process.execPath,
      './half-covered.js'
    ]

    var proc = spawn(process.execPath, args, {
      cwd: fixturesCLI,
      env: {
        PATH: process.env.PATH,
        FORCE_COLOR: true
      }
    })

    var stdout = ''
    proc.stdout.on('data', function (chunk) {
      stdout += chunk
    })

    proc.on('close', function (code) {
      code.should.equal(0)
      // 50% line coverage is below our low watermark (so it's red).
      stdout.should.match(/\[91m\W+50\W+/)
      // 50% statement coverage is above our high-watermark (so it's green).
      stdout.should.match(/\[92m\W+50\W+/)
      done()
    })
  })
})
