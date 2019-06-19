/* global describe, it, beforeEach, afterEach */

// TODO: finish migrating these tests to use snapshots
const path = require('path')
const bin = path.resolve(__dirname, '../self-coverage/bin/nyc')
const fixturesCLI = path.resolve(__dirname, './fixtures/cli')
const fakebin = path.resolve(fixturesCLI, 'fakebin')
const fs = require('fs')
const isWindows = require('is-windows')()
const rimraf = require('rimraf')
const makeDir = require('make-dir')
const { spawn } = require('child_process')

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

        // force node_modules to exist so we can verify that it is copied.
        const nmDir = path.resolve(fixturesCLI, 'nyc-config-js', 'node_modules')
        makeDir.sync(nmDir)
        fs.writeFileSync(path.join(nmDir, 'test-file'), '')
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
