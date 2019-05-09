const testExclude = require('test-exclude')
const NYC = require('../../index.js')

exports.command = 'check-coverage'

exports.describe = 'check whether coverage is within thresholds provided'

exports.builder = function (yargs) {
  yargs
    .demandCommand(0, 0)
    .option('exclude', {
      alias: 'x',
      default: testExclude.defaultExclude,
      describe: 'a list of specific files and directories that should be excluded from coverage, glob patterns are supported, node_modules is always excluded',
      global: false
    })
    .option('exclude-node-modules', {
      default: true,
      type: 'boolean',
      describe: 'whether or not to exclude all node_module folders (i.e. **/node_modules/**) by default',
      global: false
    })
    .option('exclude-after-remap', {
      default: true,
      type: 'boolean',
      description: 'should exclude logic be performed after the source-map remaps filenames?',
      global: false
    })
    .option('include', {
      alias: 'n',
      default: [],
      describe: 'a list of specific files that should be covered, glob patterns are supported',
      global: false
    })
    .option('branches', {
      default: 0,
      description: 'what % of branches must be covered?'
    })
    .option('functions', {
      default: 0,
      description: 'what % of functions must be covered?'
    })
    .option('lines', {
      default: 90,
      description: 'what % of lines must be covered?'
    })
    .option('statements', {
      default: 0,
      description: 'what % of statements must be covered?'
    })
    .option('per-file', {
      default: false,
      description: 'check thresholds per file'
    })
    .option('temp-dir', {
      alias: 't',
      describe: 'directory to read raw coverage information from',
      default: './.nyc_output',
      global: false
    })
    .option('temp-directory', {
      hidden: true,
      global: false
    })
    .example('$0 check-coverage --lines 95', "check whether the JSON in nyc's output folder meets the thresholds provided")
}

exports.handler = function (argv) {
  process.env.NYC_CWD = process.cwd()

  ;(new NYC(argv)).checkCoverage({
    lines: argv.lines,
    functions: argv.functions,
    branches: argv.branches,
    statements: argv.statements
  }, argv['per-file'])
}
