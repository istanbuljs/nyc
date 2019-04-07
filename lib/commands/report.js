const testExclude = require('test-exclude')
const NYC = require('../../index.js')

exports.command = 'report'

exports.describe = 'run coverage report for .nyc_output'

exports.builder = function (yargs) {
  return yargs
    .option('reporter', {
      alias: 'r',
      describe: 'coverage reporter(s) to use',
      default: 'text'
    })
    .option('report-dir', {
      describe: 'directory to output coverage reports in',
      default: 'coverage'
    })
    .option('temp-dir', {
      alias: 't',
      describe: 'directory to read raw coverage information from',
      default: './.nyc_output'
    })
    .option('temp-directory', {
      hidden: true
    })
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
    .option('show-process-tree', {
      describe: 'display the tree of spawned processes',
      default: false,
      type: 'boolean'
    })
    .option('skip-empty', {
      describe: 'don\'t show empty files (no lines of code) in report',
      default: false,
      type: 'boolean',
      global: false
    })
    .option('check-coverage', {
      type: 'boolean',
      default: false,
      describe: 'check whether coverage is within thresholds provided',
      global: false
    })
    .option('branches', {
      default: 0,
      description: 'what % of branches must be covered?',
      global: false
    })
    .option('functions', {
      default: 0,
      description: 'what % of functions must be covered?',
      global: false
    })
    .option('lines', {
      default: 90,
      description: 'what % of lines must be covered?',
      global: false
    })
    .option('statements', {
      default: 0,
      description: 'what % of statements must be covered?',
      global: false
    })
    .option('per-file', {
      default: false,
      type: 'boolean',
      description: 'check thresholds per file',
      global: false
    })
    .example('$0 report --reporter=lcov', 'output an HTML lcov report to ./coverage')
}

exports.handler = function (argv) {
  process.env.NYC_CWD = process.cwd()
  var nyc = new NYC(argv)
  nyc.report()
  if (argv.checkCoverage) {
    nyc.checkCoverage({
      lines: argv.lines,
      functions: argv.functions,
      branches: argv.branches,
      statements: argv.statements
    }, argv['per-file'])
  }
}
