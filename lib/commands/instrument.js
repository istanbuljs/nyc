const testExclude = require('test-exclude')
const Config = require('../config-util')

var NYC
try {
  NYC = require('../../index.covered.js')
} catch (e) {
  NYC = require('../../index.js')
}

exports.command = 'instrument <input> [output]'

exports.describe = 'instruments a file or a directory tree and writes the instrumented code to the desired output location'

exports.builder = function (yargs) {
  const cwd = Config.guessCWD()
  return yargs
    .option('require', {
      alias: 'i',
      default: [],
      describe: 'a list of additional modules that nyc should attempt to require in its subprocess, e.g., @babel/register, @babel/polyfill.'
    })
    .option('extension', {
      alias: 'e',
      default: [],
      describe: 'a list of extensions that nyc should handle in addition to .js'
    })
    .option('source-map', {
      default: true,
      type: 'boolean',
      description: 'should nyc detect and handle source maps?'
    })
    .option('produce-source-map', {
      default: false,
      type: 'boolean',
      description: "should nyc's instrumenter produce source maps?"
    })
    .option('compact', {
      default: true,
      type: 'boolean',
      description: 'should the output be compacted?'
    })
    .option('preserve-comments', {
      default: true,
      type: 'boolean',
      description: 'should comments be preserved in the output?'
    })
    .option('instrument', {
      default: true,
      type: 'boolean',
      description: 'should nyc handle instrumentation?'
    })
    .option('exit-on-error', {
      default: false,
      type: 'boolean',
      description: 'should nyc exit when an instrumentation failure occurs?'
    })
    .option('exclude', {
      alias: 'x',
      default: testExclude.defaultExclude,
      describe: 'a list of specific files and directories that should not be instrumented, glob patterns are supported'
    })
    .option('include', {
      alias: 'n',
      default: [],
      describe: 'a list of specific files that should be instrumented, glob patterns are supported'
    })
    .option('cwd', {
      describe: 'working directory used when resolving paths',
      default: cwd
    })
    .option('es-modules', {
      default: true,
      type: 'boolean',
      describe: 'tell the instrumenter to treat files as ES Modules'
    })
    .example('$0 instrument ./lib ./output', 'instrument all .js files in ./lib with coverage and output in ./output')
}

exports.handler = function (argv) {
  // if instrument is set to false enable a noop instrumenter.
  argv.instrumenter = (argv.instrument) ? './lib/instrumenters/istanbul' : './lib/instrumenters/noop'

  var nyc = new NYC({
    instrumenter: argv.instrumenter,
    sourceMap: argv.sourceMap,
    produceSourceMap: argv.produceSourceMap,
    extension: argv.extension,
    require: argv.require,
    compact: argv.compact,
    preserveComments: argv.preserveComments,
    exitOnError: argv.exitOnError,
    exclude: argv.exclude,
    include: argv.include,
    cwd: argv.cwd,
    esModules: argv.esModules
  })

  nyc.instrumentAllFiles(argv.input, argv.output, function (err) {
    if (err) {
      console.error(err.message)
      process.exit(1)
    } else {
      process.exit(0)
    }
  })
}
