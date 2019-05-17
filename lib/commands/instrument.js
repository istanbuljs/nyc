const NYC = require('../../index.js')
const path = require('path')
const rimraf = require('rimraf')
const testExclude = require('test-exclude')

exports.command = 'instrument <input> [output]'

exports.describe = 'instruments a file or a directory tree and writes the instrumented code to the desired output location'

exports.builder = function (yargs) {
  return yargs
    .demandCommand(0, 0)
    .positional('input', {
      describe: 'file or directory to instrument',
      type: 'text'
    })
    .positional('output', {
      describe: 'directory to output instrumented files',
      type: 'text'
    })
    .option('require', {
      alias: 'i',
      default: [],
      describe: 'a list of additional modules that nyc should attempt to require in its subprocess, e.g., @babel/register, @babel/polyfill.'
    })
    .option('extension', {
      alias: 'e',
      default: ['.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
      describe: 'a list of extensions that nyc should handle in addition to .js'
    })
    .option('source-map', {
      default: true,
      type: 'boolean',
      describe: 'should nyc detect and handle source maps?'
    })
    .option('produce-source-map', {
      default: false,
      type: 'boolean',
      describe: "should nyc's instrumenter produce source maps?"
    })
    .option('compact', {
      default: true,
      type: 'boolean',
      describe: 'should the output be compacted?'
    })
    .option('preserve-comments', {
      default: true,
      type: 'boolean',
      describe: 'should comments be preserved in the output?'
    })
    .option('instrument', {
      default: true,
      type: 'boolean',
      describe: 'should nyc handle instrumentation?'
    })
    .option('in-place', {
      default: false,
      type: 'boolean',
      describe: 'should nyc run the instrumentation in place?'
    })
    .option('exit-on-error', {
      default: false,
      type: 'boolean',
      describe: 'should nyc exit when an instrumentation failure occurs?'
    })
    .option('include', {
      alias: 'n',
      default: [],
      describe: 'a list of specific files and directories that should be instrumented, glob patterns are supported'
    })
    .option('exclude', {
      alias: 'x',
      default: testExclude.defaultExclude,
      describe: 'a list of specific files and directories that should not be instrumented, glob patterns are supported'
    })
    .option('exclude-node-modules', {
      default: true,
      type: 'boolean',
      describe: 'whether or not to exclude all node_module folders (i.e. **/node_modules/**) by default',
      global: false
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
    .option('complete-copy', {
      describe: 'should nyc copy all files from input to output as well as instrumented files?',
      default: false,
      type: 'boolean'
    })
    .example('$0 instrument ./lib ./output', 'instrument all .js files in ./lib with coverage and output in ./output')
}

const errorExit = msg => {
  console.error(`nyc instrument failed:  ${msg}`)
  process.exitCode = 1
}

exports.handler = function (argv) {
  if (argv.output && !argv.inPlace && (path.resolve(argv.cwd, argv.input) === path.resolve(argv.cwd, argv.output))) {
    return errorExit(`cannot instrument files in place, <input> must differ from <output>.  Set '--in-place' to force`)
  }

  if (path.relative(argv.cwd, path.resolve(argv.cwd, argv.input)).startsWith('..')) {
    return errorExit('cannot instrument files outside project root directory')
  }

  if (argv.delete && argv.inPlace) {
    return errorExit(`cannot use '--delete' when instrumenting files in place`)
  }

  if (argv.delete && argv.output && argv.output.length !== 0) {
    const relPath = path.relative(process.cwd(), path.resolve(argv.output))
    if (relPath !== '' && !relPath.startsWith('..')) {
      rimraf.sync(argv.output)
    } else {
      return errorExit(`attempt to delete '${process.cwd()}' or containing directory.`)
    }
  }

  console.log(`Running nyc from ${process.cwd()}`)

  // If instrument is set to false enable a noop instrumenter.
  argv.instrumenter = (argv.instrument)
    ? './lib/instrumenters/istanbul'
    : './lib/instrumenters/noop'

  if (argv.inPlace) {
    argv.output = argv.input
    argv.completeCopy = false
  }

  const nyc = new NYC(argv)
  nyc.instrumentAllFiles(argv.input, argv.output, err => err ? errorExit(err.message) : null)
}
