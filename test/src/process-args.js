/* global describe, it */

require('chai').should()
require('tap').mochaGlobals()

const processArgs = require('../../lib/process-args')

describe('process-args', function () {
  describe('hideInstrumenterArgs', function () {
    it('removes dashed options that proceed bin', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--reporter',
        'lcov',
        'node',
        'test/nyc-test.js'
      ]

      var yargv = require('yargs/yargs')(process.argv.slice(2)).argv

      var munged = processArgs.hideInstrumenterArgs(yargv)

      munged.should.eql(['node', 'test/nyc-test.js'])
    })

    it('parses extra args directly after -- as Node execArgv', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--',
        '--expose-gc',
        'index.js'
      ]

      var yargv = require('yargs/yargs')(process.argv.slice(2)).argv

      var munged = processArgs.hideInstrumenterArgs(yargv)

      munged.should.eql([process.execPath, '--expose-gc', 'index.js'])
    })
  })

  describe('hideInstrumenteeArgs', function () {
    it('ignores arguments after the instrumented bin', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--reporter',
        'lcov',
        'node',
        'test/nyc-test.js',
        '--arg',
        '--'
      ]

      var munged = processArgs.hideInstrumenteeArgs()
      munged.should.eql(['--reporter', 'lcov', 'node'])
    })

    it('does not ignore arguments if command is recognized', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        'report',
        '--reporter',
        'lcov'
      ]

      var munged = processArgs.hideInstrumenteeArgs()
      munged.should.eql(['report', '--reporter', 'lcov'])
    })

    it('does not ignore arguments if no command is provided', function () {
      process.argv = ['/Users/benjamincoe/bin/iojs',
        '/Users/benjamincoe/bin/nyc.js',
        '--version'
      ]

      var munged = processArgs.hideInstrumenteeArgs()
      munged.should.eql(['--version'])
    })
  })
})
