const NYC = require('../../index.js')
const path = require('path')
const rimraf = require('rimraf')
const testExclude = require('test-exclude')

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

exports.handler = function (argv) {
  if (argv.output && (path.resolve(argv.cwd, argv.input) === path.resolve(argv.cwd, argv.output))) {
    console.error(`nyc instrument failed: cannot instrument files in place, <input> must differ from <output>`)
    process.exitCode = 1
    return
  }

  if (path.relative(argv.cwd, path.resolve(argv.cwd, argv.input)).startsWith('..')) {
    console.error(`nyc instrument failed: cannot instrument files outside of project root directory`)
    process.exitCode = 1
    return
  }

  if (argv.delete && argv.output && argv.output.length !== 0) {
    const relPath = path.relative(process.cwd(), path.resolve(argv.output))
    if (relPath !== '' && !relPath.startsWith('..')) {
      rimraf.sync(argv.output)
    } else {
      console.error(`nyc instrument failed: attempt to delete '${process.cwd()}' or containing directory.`)
      process.exit(1)
    }
  }

  // If instrument is set to false enable a noop instrumenter.
  argv.instrumenter = (argv.instrument)
    ? './lib/instrumenters/istanbul'
    : './lib/instrumenters/noop'

  const nyc = new NYC(argv)

  nyc.instrumentAllFiles(argv.input, argv.output, err => {
    if (err) {
      console.error(err.message)
      process.exitCode = 1
    }
  })
}
