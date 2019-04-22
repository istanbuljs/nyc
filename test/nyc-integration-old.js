/* global describe, it, beforeEach, afterEach */

// TODO: finish migrating these tests to use snapshots
const _ = require('lodash')
const path = require('path')
const bin = path.resolve(__dirname, '../self-coverage/bin/nyc')
const fixturesCLI = path.resolve(__dirname, './fixtures/cli')
const fixturesSourceMaps = path.resolve(__dirname, './fixtures/source-maps')
const fakebin = path.resolve(fixturesCLI, 'fakebin')
const fs = require('fs')
const glob = require('glob')
const isWindows = require('is-windows')()
const rimraf = require('rimraf')
const makeDir = require('make-dir')
const { spawn, spawnSync } = require('child_process')
const si = require('strip-indent')

require('chai').should()
require('tap').mochaGlobals()

// beforeEach
rimraf.sync(path.resolve(fakebin, 'node'))
rimraf.sync(path.resolve(fakebin, 'npm'))
rimraf.sync(path.resolve(fixturesCLI, 'subdir', 'output-dir'))

describe('the nyc cli', function () {
  var env = { PATH: process.env.PATH }

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

  describe('instrument', function () {
    beforeEach(() => {
      rimraf.sync(path.resolve(fixturesCLI, 'subdir', 'output-dir'))
    })

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
          stdout.should.contain(`path:${JSON.stringify(path.resolve(fixturesCLI, 'half-covered.js'))}`)
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

      it('returns unmodified source if there is no transform', function (done) {
        const args = [bin, 'instrument', './no-transform/half-covered.xjs']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        let stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdout.should.contain(`var a = 0`)
          done()
        })
      })
    })

    describe('output folder specified', function () {
      afterEach(function () {
        rimraf.sync(path.resolve(fixturesCLI, 'output'))
      })

      it('works in directories without a package.json', function (done) {
        const args = [bin, 'instrument', './input-dir', './output-dir']

        const subdir = path.resolve(fixturesCLI, 'subdir')
        const proc = spawn(process.execPath, args, {
          cwd: subdir,
          env: env
        })

        proc.on('exit', function (code) {
          code.should.equal(0)
          const target = path.resolve(subdir, 'output-dir', 'index.js')
          fs.readFileSync(target, 'utf8')
            .should.match(/console.log\('Hello, World!'\)/)
          done()
        })
      })

      it('can be configured to exit on error', function (done) {
        const args = [bin, 'instrument', '--exit-on-error', './input-dir', './output-dir']

        const subdir = path.resolve(fixturesCLI, 'subdir')
        const proc = spawn(process.execPath, args, {
          cwd: subdir,
          env: env
        })

        proc.on('exit', function (code) {
          code.should.equal(1)
          done()
        })
      })

      it('allows a single file to be instrumented', function (done) {
        const args = [bin, 'instrument', './half-covered.js', './output']

        const inputPath = path.resolve(fixturesCLI, './half-covered.js')
        const inputMode = fs.statSync(inputPath).mode & 0o7777
        const newMode = 0o775
        if (process.platform !== 'win32') {
          fs.chmodSync(inputPath, newMode)
        }

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.equal(1)
          files.should.include('half-covered.js')

          if (process.platform !== 'win32') {
            const outputPath = path.resolve(fixturesCLI, 'output', 'half-covered.js')
            const outputMode = fs.statSync(outputPath).mode & 0o7777
            outputMode.should.equal(newMode)

            fs.chmodSync(inputPath, inputMode)
          }

          done()
        })
      })

      it('allows a directory of files to be instrumented', function (done) {
        const args = [bin, 'instrument', './nyc-config-js', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.should.include('index.js')
          files.should.include('ignore.js')
          files.should.not.include('package.json')
          files.should.not.include('node_modules')
          const includeTarget = path.resolve(fixturesCLI, 'output', 'ignore.js')
          fs.readFileSync(includeTarget, 'utf8')
            .should.match(/var cov_/)
          done()
        })
      })

      it('copies all files from <input> to <output> as well as those that have been instrumented', function (done) {
        const args = [bin, 'instrument', '--complete-copy', './nyc-config-js', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.should.include('index.js')
          files.should.include('ignore.js')
          files.should.include('package.json')
          files.should.include('node_modules')
          const includeTarget = path.resolve(fixturesCLI, 'output', 'ignore.js')
          fs.readFileSync(includeTarget, 'utf8')
            .should.match(/var cov_/)
          done()
        })
      })

      it('can instrument the project directory', function (done) {
        const args = [bin, 'instrument', '.', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.should.include('args.js')
          files.should.include('subdir')
          done()
        })
      })

      it('allows a sub-directory of files to be instrumented', function (done) {
        const args = [bin, 'instrument', './subdir/input-dir', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.should.include('index.js')
          done()
        })
      })

      it('allows a subdirectory to be excluded via .nycrc file', function (done) {
        const args = [bin, 'instrument', '--nycrc-path', './.instrument-nycrc', './subdir/input-dir', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.not.equal(0)
          files.should.include('exclude-me')
          files.should.include('node_modules')
          files.should.include('index.js')
          files.should.include('bad.js')
          const includeTarget = path.resolve(fixturesCLI, 'output', 'index.js')
          fs.readFileSync(includeTarget, 'utf8')
            .should.match(/var cov_/)
          const excludeTarget = path.resolve(fixturesCLI, 'output', 'exclude-me', 'index.js')
          fs.readFileSync(excludeTarget, 'utf8')
            .should.not.match(/var cov_/)
          done()
        })
      })

      it('allows a file to be excluded', function (done) {
        const args = [bin, 'instrument', '--complete-copy', '--exclude', 'exclude-me/index.js', './subdir/input-dir', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.not.equal(0)
          files.should.include('exclude-me')
          const excludeTarget = path.resolve(fixturesCLI, 'output', 'exclude-me', 'index.js')
          fs.readFileSync(excludeTarget, 'utf8')
            .should.not.match(/var cov_/)
          done()
        })
      })

      it('allows specifying a single sub-directory to be included', function (done) {
        const args = [bin, 'instrument', '--include', '**/include-me/**', './subdir/input-dir', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.not.equal(0)
          files.should.include('include-me')
          const instrumented = path.resolve(fixturesCLI, 'output', 'include-me', 'include-me.js')
          fs.readFileSync(instrumented, 'utf8')
            .should.match(/var cov_/)
          done()
        })
      })

      it('allows a file to be excluded from an included directory', function (done) {
        const args = [bin, 'instrument', '--complete-copy', '--exclude', '**/exclude-me.js', '--include', '**/include-me/**', './subdir/input-dir', './output']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
          files.length.should.not.equal(0)
          files.should.include('include-me')
          const includeMeFiles = fs.readdirSync(path.resolve(fixturesCLI, 'output', 'include-me'))
          includeMeFiles.length.should.not.equal(0)
          includeMeFiles.should.include('include-me.js')
          includeMeFiles.should.include('exclude-me.js')
          const includeTarget = path.resolve(fixturesCLI, 'output', 'include-me', 'include-me.js')
          fs.readFileSync(includeTarget, 'utf8')
            .should.match(/var cov_/)
          const excludeTarget = path.resolve(fixturesCLI, 'output', 'exclude-me', 'index.js')
          fs.readFileSync(excludeTarget, 'utf8')
            .should.not.match(/var cov_/)
          done()
        })
      })

      it('aborts if trying to write files in place', function (done) {
        const args = [bin, 'instrument', '--delete', './', './']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        let stderr = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(1)
          stderr.should.include('nyc instrument failed: cannot instrument files in place')
          done()
        })
      })

      it('aborts if trying to instrument files from outside the project root directory', function (done) {
        const args = [bin, 'instrument', '--delete', '../', './']

        const proc = spawn(process.execPath, args, {
          cwd: fixturesCLI,
          env: env
        })

        let stderr = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(1)
          stderr.should.include('nyc instrument failed: cannot instrument files outside of project root directory')
          done()
        })
      })

      describe('es-modules', function () {
        afterEach(function () {
          rimraf.sync(path.resolve(fixturesCLI, './output'))
        })

        it('instruments file with `package` keyword when es-modules is disabled', function (done) {
          const args = [bin, 'instrument', '--no-es-modules', './not-strict.js', './output']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          proc.on('close', function (code) {
            code.should.equal(0)
            const subdirExists = fs.existsSync(path.resolve(fixturesCLI, './output'))
            subdirExists.should.equal(true)
            const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
            files.should.include('not-strict.js')
            done()
          })
        })

        it('fails on file with `package` keyword when es-modules is enabled', function (done) {
          const args = [bin, 'instrument', '--exit-on-error', './not-strict.js', './output']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          let stderr = ''
          proc.stderr.on('data', function (chunk) {
            stderr += chunk
          })

          proc.on('close', function (code) {
            code.should.equal(1)
            stdoutShouldEqual(stderr, `
              Failed to instrument ${path.resolve(fixturesCLI, 'not-strict.js')}`)
            const subdirExists = fs.existsSync(path.resolve(fixturesCLI, './output'))
            subdirExists.should.equal(false)
            done()
          })
        })
      })

      describe('delete', function () {
        beforeEach(function () {
          makeDir.sync(path.resolve(fixturesCLI, 'output', 'removed-by-clean'))
        })

        it('cleans the output directory if `--delete` is specified', function (done) {
          const args = [bin, 'instrument', '--delete', 'true', './subdir/input-dir', './output']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          proc.on('close', function (code) {
            code.should.equal(0)
            const subdirExists = fs.existsSync(path.resolve(fixturesCLI, './output'))
            subdirExists.should.equal(true)
            const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
            files.should.not.include('removed-by-clean')
            files.should.include('exclude-me')
            done()
          })
        })

        it('does not clean the output directory by default', function (done) {
          const args = [bin, 'instrument', './subdir/input-dir', './output']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          proc.on('close', function (code) {
            code.should.equal(0)
            const subdirExists = fs.existsSync(path.resolve(fixturesCLI, './output'))
            subdirExists.should.equal(true)
            const files = fs.readdirSync(path.resolve(fixturesCLI, './output'))
            files.should.include('removed-by-clean')
            done()
          })
        })

        it('aborts if trying to clean process.cwd()', function (done) {
          const args = [bin, 'instrument', '--delete', './src', './']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          let stderr = ''
          proc.stderr.on('data', function (chunk) {
            stderr += chunk
          })

          proc.on('close', function (code) {
            code.should.equal(1)
            stderr.should.include('nyc instrument failed: attempt to delete')
            done()
          })
        })

        it('aborts if trying to clean outside working directory', function (done) {
          const args = [bin, 'instrument', '--delete', './', '../']

          const proc = spawn(process.execPath, args, {
            cwd: fixturesCLI,
            env: env
          })

          let stderr = ''
          proc.stderr.on('data', function (chunk) {
            stderr += chunk
          })

          proc.on('close', function (code) {
            code.should.equal(1)
            stderr.should.include('nyc instrument failed: attempt to delete')
            done()
          })
        })
      })
    })
  })

  it('help shows to stderr when main command doesn\'t know what to do', () => {
    const opts = {
      cwd: fixturesCLI,
      env,
      encoding: 'utf8'
    }

    const help = spawnSync(process.execPath, [bin, '--help'], opts)
    const unknown = spawnSync(process.execPath, [bin], opts)
    help.status.should.equal(0)
    unknown.status.should.equal(1)
    help.stderr.should.equal('')
    unknown.stdout.should.equal('')
    help.stdout.should.not.equal('')
    help.stdout.should.equal(unknown.stderr)
  })

  describe('--temp-dir', function () {
    beforeEach(() => {
      rimraf.sync(path.resolve(fixturesCLI, '.nyc_output'))
      rimraf.sync(path.resolve(fixturesCLI, '.temp_directory'))
      rimraf.sync(path.resolve(fixturesCLI, '.temp_dir'))
    })

    it('creates the default \'tempDir\' when none is specified', function (done) {
      var args = [bin, process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        var tempFiles = fs.readdirSync(path.resolve(fixturesCLI, '.nyc_output'))
        tempFiles.length.should.equal(2) // the coverage file, and processinfo
        var cliFiles = fs.readdirSync(path.resolve(fixturesCLI))
        cliFiles.should.include('.nyc_output')
        cliFiles.should.not.include('.temp_dir')
        cliFiles.should.not.include('.temp_directory')
        done()
      })
    })

    it('prefers \'tempDirectory\' to \'tempDir\'', function (done) {
      var args = [bin, '--tempDirectory', '.temp_directory', '--tempDir', '.temp_dir', process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      proc.on('exit', function (code) {
        code.should.equal(0)
        var tempFiles = fs.readdirSync(path.resolve(fixturesCLI, '.temp_directory'))
        tempFiles.length.should.equal(2)
        var cliFiles = fs.readdirSync(path.resolve(fixturesCLI))
        cliFiles.should.not.include('.nyc_output')
        cliFiles.should.not.include('.temp_dir')
        cliFiles.should.include('.temp_directory')
        done()
      })
    })

    it('uses the \'tempDir\' option if \'tempDirectory\' is not set', function (done) {
      var args = [bin, '--tempDir', '.temp_dir', process.execPath, './half-covered.js']

      var proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      proc.on('exit', function (code) {
        code.should.equal(0)
        var tempFiles = fs.readdirSync(path.resolve(fixturesCLI, '.temp_dir'))
        tempFiles.length.should.equal(2)
        var cliFiles = fs.readdirSync(path.resolve(fixturesCLI))
        cliFiles.should.not.include('.nyc_output')
        cliFiles.should.include('.temp_dir')
        cliFiles.should.not.include('.temp_directory')
        rimraf.sync(path.resolve(fixturesCLI, '.temp_dir'))
        done()
      })
    })
  })

  it('handles --clean / --no-clean properly', () => {
    rimraf.sync(path.resolve(fixturesCLI, '.nyc_output'))
    const args = (doClean, arg) => [
      bin,
      doClean ? '--clean' : '--no-clean',
      process.execPath,
      './by-arg2.js',
      arg
    ]
    const opts = {
      cwd: fixturesCLI,
      env: env,
      encoding: 'utf8'
    }

    const proc1 = spawnSync(process.execPath, args(true, '1'), opts)
    proc1.status.should.equal(0)
    stdoutShouldEqual(proc1.stdout, `
      1
      ------------|----------|----------|----------|----------|-------------------|
      File        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
      ------------|----------|----------|----------|----------|-------------------|
      All files   |       50 |       25 |      100 |       50 |                   |
       by-arg2.js |       50 |       25 |      100 |       50 |             4,5,7 |
      ------------|----------|----------|----------|----------|-------------------|`
    )
    proc1.stderr.should.equal('')

    const proc2 = spawnSync(process.execPath, args(false, '2'), opts)
    proc2.status.should.equal(0)
    stdoutShouldEqual(proc2.stdout, `
      2
      ------------|----------|----------|----------|----------|-------------------|
      File        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
      ------------|----------|----------|----------|----------|-------------------|
      All files   |    83.33 |       75 |      100 |    83.33 |                   |
       by-arg2.js |    83.33 |       75 |      100 |    83.33 |                 7 |
      ------------|----------|----------|----------|----------|-------------------|`
    )
    proc2.stderr.should.equal('')
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
            Object.keys(coverage['./external-instrumenter.js'].s).forEach(function (k) {
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

  // see: https://github.com/istanbuljs/nyc/issues/563
  it('does not create .cache folder if cache is "false"', function (done) {
    var args = [bin, '--cache=false', process.execPath, './index.js']

    var proc = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: env
    })

    rimraf.sync('./node_modules/.cache')

    proc.on('close', function (code) {
      code.should.equal(0)
      fs.existsSync('./node_modules/.cache').should.equal(false)
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
      stdout.should.match(/\[31;1m\W+50\W+/)
      // 50% statement coverage is above our high-watermark (so it's green).
      stdout.should.match(/\[32;1m\W+50\W+/)
      done()
    })
  })

  // the following tests exercise nyc's behavior around source-maps
  // that have been included with pre-instrumented files. Perhaps, as an
  // example, unit tests are being run against minified JavaScript.
  // --exclude-after-remap will likely need to be set to false when
  // using nyc with this type of configuration.
  describe('source-maps', () => {
    describe('--all', () => {
      it('includes files with both .map files and inline source-maps', (done) => {
        const args = [
          bin,
          '--all',
          '--cache', 'false',
          '--exclude-after-remap', 'false',
          '--exclude', 'original',
          process.execPath, './instrumented/s1.min.js'
        ]

        const proc = spawn(process.execPath, args, {
          cwd: fixturesSourceMaps,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdoutShouldEqual(stdout, `
            ----------|----------|----------|----------|----------|-------------------|
            File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
            ----------|----------|----------|----------|----------|-------------------|
            All files |    44.44 |      100 |    33.33 |    44.44 |                   |
             s1.js    |       80 |      100 |       50 |       80 |                 7 |
             s2.js    |        0 |      100 |        0 |        0 |           1,2,4,6 |
            ----------|----------|----------|----------|----------|-------------------|`
          )
          done()
        })
      })

      it('uses source-maps to exclude original sources from reports', (done) => {
        const args = [
          bin,
          '--all',
          '--cache', 'false',
          '--exclude', 'original/s1.js',
          process.execPath, './instrumented/s1.min.js'
        ]

        const proc = spawn(process.execPath, args, {
          cwd: fixturesSourceMaps,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdoutShouldEqual(stdout, `
            ----------|----------|----------|----------|----------|-------------------|
            File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
            ----------|----------|----------|----------|----------|-------------------|
            All files |        0 |      100 |        0 |        0 |                   |
             s2.js    |        0 |      100 |        0 |        0 |           1,2,4,6 |
            ----------|----------|----------|----------|----------|-------------------|`
          )
          done()
        })
      })
    })

    describe('.map file', () => {
      it('appropriately instruments file with corresponding .map file', (done) => {
        const args = [
          bin,
          '--cache', 'false',
          '--exclude-after-remap', 'false',
          '--exclude', 'original',
          process.execPath, './instrumented/s1.min.js'
        ]

        const proc = spawn(process.execPath, args, {
          cwd: fixturesSourceMaps,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdoutShouldEqual(stdout, `
          ----------|----------|----------|----------|----------|-------------------|
          File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
          ----------|----------|----------|----------|----------|-------------------|
          All files |       80 |      100 |       50 |       80 |                   |
           s1.js    |       80 |      100 |       50 |       80 |                 7 |
          ----------|----------|----------|----------|----------|-------------------|`)
          done()
        })
      })
    })

    describe('inline', () => {
      it('appropriately instruments a file with an inline source-map', (done) => {
        const args = [
          bin,
          '--cache', 'false',
          '--exclude-after-remap', 'false',
          '--exclude', 'original',
          process.execPath, './instrumented/s2.min.js'
        ]

        const proc = spawn(process.execPath, args, {
          cwd: fixturesSourceMaps,
          env: env
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', function (code) {
          code.should.equal(0)
          stdoutShouldEqual(stdout, `
            ----------|----------|----------|----------|----------|-------------------|
            File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
            ----------|----------|----------|----------|----------|-------------------|
            All files |      100 |      100 |      100 |      100 |                   |
             s2.js    |      100 |      100 |      100 |      100 |                   |
            ----------|----------|----------|----------|----------|-------------------|`)
          done()
        })
      })
    })
  })

  describe('skip-empty', () => {
    it('does not display 0-line files in coverage output', (done) => {
      const args = [
        bin,
        '--cache', 'false',
        '--skip-empty', 'true',
        process.execPath, './empty.js'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.stdout.on('error', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdoutShouldEqual(stdout, `
        ----------|----------|----------|----------|----------|-------------------|
        File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
        ----------|----------|----------|----------|----------|-------------------|
        ----------|----------|----------|----------|----------|-------------------|`)
        done()
      })
    })
  })

  describe('skip-full', () => {
    it('does not display files with 100% statement, branch, and function coverage', (done) => {
      const args = [
        bin,
        '--skip-full',
        process.execPath, './skip-full.js'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdoutShouldEqual(stdout, `
        -----------------|----------|----------|----------|----------|-------------------|
        File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
        -----------------|----------|----------|----------|----------|-------------------|
        All files        |     62.5 |       50 |      100 |     62.5 |                   |
         half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
        -----------------|----------|----------|----------|----------|-------------------|`)
        done()
      })
    })
  })

  describe('es-modules', () => {
    it('allows reserved word when es-modules is disabled', (done) => {
      const args = [
        bin,
        '--cache', 'false',
        '--es-modules', 'false',
        process.execPath, './not-strict.js'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(0)
        stdoutShouldEqual(stdout, `
        ---------------|----------|----------|----------|----------|-------------------|
        File           |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
        ---------------|----------|----------|----------|----------|-------------------|
        All files      |      100 |      100 |      100 |      100 |                   |
         not-strict.js |      100 |      100 |      100 |      100 |                   |
        ---------------|----------|----------|----------|----------|-------------------|`)
        done()
      })
    })

    it('forbids reserved word when es-modules is not disabled', (done) => {
      const args = [
        bin,
        '--cache', 'false',
        '--exit-on-error', 'true',
        process.execPath, './not-strict.js'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      var stderr = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })

      proc.on('close', function (code) {
        code.should.equal(1)
        stdoutShouldEqual(stderr, `
        Failed to instrument ${path.join(fixturesCLI, 'not-strict.js')}`)
        stdoutShouldEqual(stdout, `
        ----------|----------|----------|----------|----------|-------------------|
        File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
        ----------|----------|----------|----------|----------|-------------------|
        All files |        0 |        0 |        0 |        0 |                   |
        ----------|----------|----------|----------|----------|-------------------|`)
        done()
      })
    })
  })

  describe('merge', () => {
    it('combines multiple coverage reports', (done) => {
      const args = [
        bin,
        'merge',
        './merge-input'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      proc.on('close', function (code) {
        const mergedCoverage = require('./fixtures/cli/coverage')
        // the combined reports should have 100% function
        // branch and statement coverage.
        mergedCoverage['/private/tmp/contrived/library.js']
          .s.should.eql({ '0': 2, '1': 1, '2': 1, '3': 2, '4': 1, '5': 1 })
        mergedCoverage['/private/tmp/contrived/library.js']
          .f.should.eql({ '0': 1, '1': 1, '2': 2 })
        mergedCoverage['/private/tmp/contrived/library.js']
          .b.should.eql({ '0': [1, 1] })
        rimraf.sync(path.resolve(fixturesCLI, 'coverage.json'))
        return done()
      })
    })

    it('reports error if input directory is missing', (done) => {
      const args = [
        bin,
        'merge',
        './DIRECTORY_THAT_IS_MISSING'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stderr = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })

      proc.on('close', function (code) {
        stderr.should.match(/failed access input directory/)
        return done()
      })
    })

    it('reports error if input is not a directory', (done) => {
      const args = [
        bin,
        'merge',
        './package.json'
      ]

      const proc = spawn(process.execPath, args, {
        cwd: fixturesCLI,
        env: env
      })

      var stderr = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })

      proc.on('close', function (code) {
        stderr.should.match(/was not a directory/)
        return done()
      })
    })
  })

  describe('exclude-node-modules', () => {
    const fixturesENM = path.resolve(__dirname, './fixtures/exclude-node-modules')
    const globalArgs = [
      bin,
      '--all=true',
      '--cache=false',
      '--per-file=true',
      '--exclude-node-modules=false',
      '--include=node_modules/@istanbuljs/fake-module-1/**'
    ]
    const spawnOpts = {
      cwd: fixturesENM,
      env: env
    }
    const noCoverageError = `ERROR: Coverage for lines (0%) does not meet threshold (90%) for ${path.join(fixturesENM, 'node_modules/@istanbuljs/fake-module-1/index.js')}\n`

    it('execute', done => {
      function checkReport (code, stderr, stdout, next) {
        code.should.equal(1)
        stderr.should.equal(noCoverageError)
        stdoutShouldEqual(stdout, `
          ----------|----------|----------|----------|----------|-------------------|
          File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
          ----------|----------|----------|----------|----------|-------------------|
          All files |        0 |      100 |      100 |        0 |                   |
           index.js |        0 |      100 |      100 |        0 |                 1 |
          ----------|----------|----------|----------|----------|-------------------|`)
        next()
      }

      function executeMainCommand () {
        const args = [
          ...globalArgs,
          '--check-coverage=true',
          process.execPath, './bin/do-nothing.js'
        ]

        const proc = spawn(process.execPath, args, spawnOpts)

        var stderr = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', code => checkReport(code, stderr, stdout, executeReport))
      }

      function executeReport () {
        const args = [
          ...globalArgs,
          '--check-coverage=true',
          'report'
        ]

        const proc = spawn(process.execPath, args, spawnOpts)

        var stderr = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', code => checkReport(code, stderr, stdout, executeCheckCoverage))
      }

      function executeCheckCoverage () {
        const args = [
          ...globalArgs,
          'check-coverage'
        ]

        const proc = spawn(process.execPath, args, spawnOpts)

        var stderr = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })

        var stdout = ''
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })

        proc.on('close', code => {
          code.should.equal(1)
          stderr.should.equal(noCoverageError)
          stdoutShouldEqual(stdout, '')
          done()
        })
      }

      executeMainCommand()
    })

    it('instrument', done => {
      const args = [
        ...globalArgs,
        'instrument',
        'node_modules'
      ]

      const proc = spawn(process.execPath, args, spawnOpts)

      var stderr = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })

      var stdout = ''
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })

      proc.on('close', code => {
        code.should.equal(0)
        stderr.should.equal('')
        stdout.should.match(/fake-module-1/)
        stdout.should.not.match(/fake-module-2/)
        done()
      })
    })
  })

  it('recursive run does not throw', done => {
    const args = [
      bin,
      process.execPath,
      bin,
      process.execPath,
      bin,
      process.execPath,
      bin,
      'true'
    ]
    const proc = spawn(process.execPath, args, {
      cwd: path.resolve(__dirname, './fixtures/recursive-run')
    })

    let stdio = ''
    proc.stderr.on('data', chunk => {
      stdio += chunk
    })

    proc.stdout.on('data', chunk => {
      stdio += chunk
    })

    proc.on('close', code => {
      code.should.equal(0)
      stdio.should.equal('')
      done()
    })
  })
})

function stdoutShouldEqual (stdout, expected) {
  `\n${stdout}`.should.equal(`${si(expected)}\n`)
}
