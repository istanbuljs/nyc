const NYC = require('../../index.js')
const path = require('path')
const rimraf = require('rimraf')

exports.command = 'instrument <input> [output]'

exports.describe = 'instruments a file or a directory tree and writes the instrumented code to the desired output location'

exports.builder = function (yargs) {
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
    .option('es-modules', {
      default: true,
      type: 'boolean',
      description: 'tell the instrumenter to treat files as ES Modules'
    })
    .option('delete', {
      describe: 'should the output folder be deleted before instrumenting files?',
      default: false,
      type: 'boolean'
    })
    .example('$0 instrument ./lib ./output', 'instrument all .js files in ./lib with coverage and output in ./output')
}

exports.handler = function (argv) {
  // If instrument is set to false enable a noop instrumenter.
  argv.instrumenter = (!argv.instrument)
    ? './lib/instrumenters/noop'
    : './lib/instrumenters/istanbul'

  const nyc = new NYC({
    instrumenter: argv.instrumenter,
    sourceMap: argv.sourceMap,
    produceSourceMap: argv.produceSourceMap,
    extension: argv.extension,
    require: argv.require,
    compact: argv.compact,
    preserveComments: argv.preserveComments,
    esModules: argv.esModules,
    exitOnError: argv.exitOnError
  })

  if (argv.delete && argv.output && argv.output.length !== 0) {
    const relPath = path.relative(process.cwd(), path.resolve(argv.output))
    if (relPath !== '' && !relPath.startsWith('..')) {
      rimraf.sync(argv.output)
    } else {
      console.error(`nyc instrument failed: attempt to delete '${process.cwd()}'`)
      process.exit(1)
    }
  }

  nyc.instrumentAllFiles(argv.input, argv.output, err => {
    if (err) {
      console.error(err.message)
      process.exitCode = 1
    }
  })
}
