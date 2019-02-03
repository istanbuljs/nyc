var NYC
try {
  NYC = require('../../index.covered.js')
} catch (e) {
  NYC = require('../../index.js')
}

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
