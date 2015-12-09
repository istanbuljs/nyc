var _ = require('lodash')
var fs = require('fs')
var NYC = require('../')
var path = require('path')
var rimraf = require('rimraf')
var sinon = require('sinon')
var spawn = require('child_process').spawn
var tap = require('tap')
var tapMocha = require('tap/lib/mocha')

require('chai').should()

// All NYC instances that need to access disk should use fixturesDir as their
// working directory.
var fixturesDir = path.join(__dirname, 'fixtures')
// The instances use a .nyc_output directory within the fixturesDir. This makes
// it easier to clean up the data.
var tempDir = path.join(fixturesDir, '.nyc_output')
// Track all instances created in this process, to be cleaned up when the test
// is done.
var instances = []
// Wrapper to instantiate NYC, forcing the tempDirectory option.
function instantiate (opts) {
  opts = _.assign({ tempDirectory: tempDir }, opts)
  var nyc = new NYC(opts)
  instances.push(nyc)
  return nyc
}
// Deletes the .nyc_output directory. Overrides writeCoverageFile() on each
// instance in case it wants to write coverage when the process exits.
function cleanup () {
  instances.forEach(function (nyc) {
    nyc.writeCoverageFile = function () {}
  })
  instances = []
  rimraf.sync(tempDir)
}

// Use bin/nyc.js to run the file in a child process. This should cause a
// coverage report to be written to the .nyc_output directory within the
// fixturesDir.
function coverChild (file, cb) {
  spawn(
    process.execPath,
    [path.resolve(__dirname, '..', 'bin', 'nyc.js'), file],
    { cwd: fixturesDir }
  ).on('close', cb)
}

// If set, NYC_TEST_SPAWN contains the index of the test that should be
// executed. Otherwise the test runner should be initialized.
var spawnNthTest = parseInt(process.env.NYC_TEST_SPAWN || '-1', 10)
// Increased after every call to it() below, allows for the current test to be
// executed when in a tap.spawn() process.
var testCounter = 0
// Keep track of the nested tests. Deepest nested test is first.
var stack = [tap.current()]

// describe() and it() adopted from tap's mocha interface.
function describe (name, fn) {
  if (spawnNthTest === -1) {
    // Initialize the test runner.
    var c = stack[0]
    if (!fn) {
      c.test(name)
    } else {
      c.test(name, function (tt) {
        stack.unshift(tt)
        fn()
        stack.shift()
        tt.end()
      })
    }
  } else if (fn) {
    // Execute the function in order to get to the test that needs to be executed.
    fn()
  }
}

function it (name, fn) {
  if (spawnNthTest === -1) {
    // Initialize the test runner. It'll have to run the current file through
    // tap.spawn(), setting the NYC_TEST_SPAWN variable.
    if (fn) {
      stack[0].spawn(process.execPath, process.argv.slice(1), { env: { NYC_TEST_SPAWN: testCounter } }, '(in child process)')
    } else {
      tapMocha.it(name)
    }
  } else if (spawnNthTest === testCounter) {
    // Execute this test.
    tapMocha.it(name, function (done) {
      try {
        if (fn.length) {
          fn(function (err) {
            cleanup()
            done(err)
          })
        } else {
          fn()
          cleanup()
          done()
        }
      } catch (err) {
        cleanup()
        done(err)
      }
    })
  }

  testCounter++
}

describe('nyc', function () {
  describe('cwd', function () {
    it('sets cwd to process.cwd() if no environment variable is set', function () {
      var nyc = instantiate()
      nyc.cwd.should.eql(process.cwd())
    })

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = fixturesDir

      var nyc = instantiate()
      nyc.cwd.should.equal(fixturesDir)
    })
  })

  describe('config', function () {
    it("loads 'exclude' patterns from package.json", function () {
      var nyc = instantiate({ cwd: fixturesDir })

      nyc.exclude.length.should.eql(5)
    })
  })

  describe('_prepGlobPatterns', function () {
    it('should adjust patterns appropriately', function () {
      var _prepGlobPatterns = NYC.prototype._prepGlobPatterns

      var result = _prepGlobPatterns(['./foo', 'bar/**', 'baz/'])

      result.should.deep.equal([
        './foo',
        'bar/**',
        'baz/',
        './foo/**', // Appended `/**`
        'baz/**'  // Removed trailing slash before appending `/**`
      ])
    })
  })

  describe('shouldInstrumentFile', function () {
    it('should exclude appropriately with defaults', function () {
      var nyc = instantiate()

      // Root package contains config.exclude
      // Restore exclude to default patterns
      nyc.exclude = nyc._prepGlobPatterns([
        '**/node_modules/**',
        'test/**',
        'test{,-*}.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // nyc always excludes "node_modules/**"
      shouldInstrumentFile('foo', 'foo').should.equal(true)
      shouldInstrumentFile('node_modules/bar', 'node_modules/bar').should.equal(false)
      shouldInstrumentFile('foo/node_modules/bar', 'foo/node_modules/bar').should.equal(false)
      shouldInstrumentFile('test.js', 'test.js').should.equal(false)
      shouldInstrumentFile('testfoo.js', 'testfoo.js').should.equal(true)
      shouldInstrumentFile('test-foo.js', 'test-foo.js').should.equal(false)
      shouldInstrumentFile('lib/test.js', 'lib/test.js').should.equal(true)
      shouldInstrumentFile('/foo/bar/test.js', './test.js').should.equal(false)
    })

    it('should exclude appropriately with config.exclude', function () {
      var nyc = instantiate({ cwd: fixturesDir })
      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      // config.excludes: "blarg", "blerg"
      shouldInstrumentFile('blarg', 'blarg').should.equal(false)
      shouldInstrumentFile('blarg/foo.js', 'blarg/foo.js').should.equal(false)
      shouldInstrumentFile('blerg', 'blerg').should.equal(false)
      shouldInstrumentFile('./blerg', './blerg').should.equal(false)
    })

    it('should handle example symlinked node_module', function () {
      var nyc = instantiate({ cwd: fixturesDir })
      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)

      var relPath = '../../nyc/node_modules/glob/glob.js'
      var fullPath = '/Users/user/nyc/node_modules/glob/glob.js'

      shouldInstrumentFile(fullPath, relPath).should.equal(false)

      // Full path should be excluded (node_modules)
      shouldInstrumentFile(fullPath, relPath).should.equal(false)

      // Send both relative and absolute path
      // Results in exclusion (include = false)
      shouldInstrumentFile(fullPath, relPath).should.equal(false)
    })

    it('allows a file to be included rather than excluded', function () {
      var nyc = instantiate()

      // Root package contains config.exclude
      // Restore exclude to default patterns
      nyc.include = nyc._prepGlobPatterns([
        'test.js'
      ])

      var shouldInstrumentFile = nyc.shouldInstrumentFile.bind(nyc)
      shouldInstrumentFile('test.js', 'test.js').should.equal(true)
      shouldInstrumentFile('index.js', 'index.js').should.equal(false)
    })
  })

  describe('wrap', function () {
    it('wraps modules with coverage counters when they are required', function () {
      instantiate().wrap()

      // clear the module cache so that
      // we pull index.js in again and wrap it.
      var name = require.resolve('../')
      delete require.cache[name]

      // when we require index.js it should be wrapped.
      var index = require('../')
      index.should.match(/__cov_/)
    })

    describe('custom require hooks are installed', function () {
      it('wraps modules with coverage counters when the custom require hook compiles them', function () {
        var hook = sinon.spy(function (module, filename) {
          module._compile(fs.readFileSync(filename, 'utf8'))
        })

        instantiate().wrap()

        // clear the module cache so that
        // we pull index.js in again and wrap it.
        var name = require.resolve('../')
        delete require.cache[name]

        // install the custom require hook
        require.extensions['.js'] = hook

        // when we require index.js it should be wrapped.
        var index = require('../')
        index.should.match(/__cov_/)

        // and the hook should have been called
        hook.calledOnce.should.be.true
      })
    })

    function testSignal (signal, done) {
      var nyc = instantiate({ cwd: fixturesDir })

      coverChild(path.join(fixturesDir, signal + '.js'), function () {
        var reports = _.filter(nyc._loadReports(), function (report) {
          return report['./' + signal + '.js']
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

    it('does not output coverage for files that have not been included, by default', function (done) {
      var nyc = instantiate().wrap()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      reports.length.should.equal(0)
      return done()
    })
  })

  describe('report', function () {
    it('runs reports for all JSON in output directory', function (done) {
      var nyc = instantiate({ cwd: fixturesDir })
      var start = fs.readdirSync(nyc.tmpDirectory()).length

      coverChild(path.join(fixturesDir, 'spawn.js'), function () {
        nyc.report(
          null,
          {
            add: function (report) {
              // the subprocess we ran should output reports
              // for files in the fixtures directory.
              Object.keys(report).should.match(/\.\/(spawn|sigint|sigterm)\.js/)
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

    it('handles corrupt JSON files', function (done) {
      var nyc = instantiate({ cwd: fixturesDir })

      var bad = path.join(fixturesDir, '.nyc_output', 'bad.json')
      fs.writeFileSync(bad, '}', 'utf-8')

      nyc.report(
        null,
        {
          add: function (report) {}
        },
        {
          add: function (reporter) {},
          write: function () {
            // we should get here without exception.
            fs.unlinkSync(bad)
            return done()
          }
        }
      )
    })

    it('handles multiple reporters', function (done) {
      var reporters = ['text-summary', 'text-lcov']
      var incr = 0
      var nyc = instantiate({
        cwd: fixturesDir,
        reporter: reporters
      })

      coverChild(path.join(fixturesDir, 'sigint.js'), function () {
        nyc.report(
          null,
          {
            add: function (report) {}
          },
          {
            add: function (reporter) {
              incr += !!~reporters.indexOf(reporter)
            },
            write: function () {
              incr.should.eql(reporters.length)
              return done()
            }
          }
        )
      })
    })
  })

  describe('.istanbul.yml configuration', function () {
    var istanbul = require('istanbul')
    var configSpy = sinon.spy(istanbul.config, 'loadFile')
    var instrumenterSpy = sinon.spy(istanbul, 'Instrumenter')

    function writeConfig () {
      fs.writeFileSync('./.istanbul.yml', 'instrumentation:\n\tpreserve-comments: true', 'utf-8')
    }

    function afterEach () {
      configSpy.reset()
      instrumenterSpy.reset()
      rimraf.sync('./.istanbul.yml')
    }

    it('it handles having no .istanbul.yml in the root directory', function (done) {
      afterEach()
      instantiate().wrap()
      return done()
    })

    it('uses the values in .istanbul.yml to instantiate the instrumenter', function (done) {
      writeConfig()

      instantiate({ istanbul: istanbul }).wrap()

      istanbul.config.loadFile.calledWithMatch('.istanbul.yml').should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: false
      }).should.equal(true)

      afterEach()
      return done()
    })

    it('loads the .istanbul.yml configuration from NYC_CWD', function (done) {
      instantiate({
        istanbul: istanbul,
        cwd: './test/fixtures'
      }).wrap()

      istanbul.config.loadFile.calledWithMatch(path.join('test', 'fixtures', '.istanbul.yml')).should.equal(true)
      istanbul.Instrumenter.calledWith({
        coverageVariable: '__coverage__',
        embedSource: false,
        noCompact: false,
        preserveComments: true
      }).should.equal(true)

      afterEach()
      return done()
    })
  })

  describe('mungeArgs', function () {
    it('removes dashed options that proceed bin', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--reporter',
        'lcov',
        'node',
        'test/nyc-test.js'
      ]

      var yargv = require('yargs').argv

      var munged = instantiate().mungeArgs(yargv)

      munged.should.eql(['node', 'test/nyc-test.js'])
    })
  })

  describe('addAllFiles', function () {
    it('outputs an empty coverage report for all files that are not excluded', function (done) {
      var nyc = instantiate()
      nyc.addAllFiles()

      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./test/fixtures/not-loaded.js']
      })
      var report = reports[0]['./test/fixtures/not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(0)
      report.s['2'].should.equal(0)
      return done()
    })

    it('tracks coverage appropriately once the file is required', function (done) {
      var nyc = instantiate({
        cwd: fixturesDir
      }).wrap()
      require('./fixtures/not-loaded')

      nyc.writeCoverageFile()
      var reports = _.filter(nyc._loadReports(), function (report) {
        return report['./not-loaded.js']
      })
      var report = reports[0]['./not-loaded.js']

      reports.length.should.equal(1)
      report.s['1'].should.equal(1)
      report.s['2'].should.equal(1)

      return done()
    })
  })
})
