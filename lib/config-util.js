var arrify = require('arrify')
var fs = require('fs')
var path = require('path')
var findUp = require('find-up')
var testExclude = require('test-exclude')
var Yargs = require('yargs/yargs')

var Config = {}

// load config from a cascade of sources:
// * command line arguments
// * package.json
// * .nycrc
Config.loadConfig = function (argv, cwd) {
  cwd = cwd || process.env.NYC_CWD || process.cwd()
  var pkgPath = findUp.sync('package.json', {cwd: cwd})
  var rcPath = findUp.sync('.nycrc', {cwd: cwd})
  var rcConfig = null

  if (rcPath) {
    rcConfig = JSON.parse(
      fs.readFileSync(rcPath, 'utf-8')
    )
  }

  if (pkgPath) {
    cwd = path.dirname(pkgPath)
  }

  var config = Config.buildYargs(cwd)
    .default({
      cwd: cwd
    })
  if (rcConfig) config.config(rcConfig)
  config = config.parse(argv || [])

  // post-hoc, we convert several of the
  // configuration settings to arrays, providing
  // a consistent contract to index.js.
  config.require = arrify(config.require)
  config.extension = arrify(config.extension)
  config.exclude = arrify(config.exclude)
  config.include = arrify(config.include)
  config.cwd = cwd

  return config
}

// build a yargs object, omitting any settings
// that would cause the application to exit early.
Config.buildYargs = function (cwd) {
  return Yargs([])
    .usage('$0 [command] [options]\n\nrun your tests with the nyc bin to instrument them with coverage')
    .command('report', 'run coverage report for .nyc_output', function (yargs) {
      return yargs
        .usage('$0 report [options]')
        .option('reporter', {
          alias: 'r',
          describe: 'coverage reporter(s) to use',
          default: 'text'
        })
        .option('report-dir', {
          describe: 'directory to output coverage reports in',
          default: 'coverage'
        })
        .option('temp-directory', {
          describe: 'directory from which coverage JSON files are read',
          default: './.nyc_output'
        })
        .option('show-process-tree', {
          describe: 'display the tree of spawned processes',
          default: false,
          type: 'boolean'
        })
        .example('$0 report --reporter=lcov', 'output an HTML lcov report to ./coverage')
    })
    .command('check-coverage', 'check whether coverage is within thresholds provided', function (yargs) {
      return yargs
        .usage('$0 check-coverage [options]')
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
        .example('$0 check-coverage --lines 95', "check whether the JSON in nyc's output folder meets the thresholds provided")
    })
    .option('reporter', {
      alias: 'r',
      describe: 'coverage reporter(s) to use',
      default: 'text'
    })
    .option('report-dir', {
      describe: 'directory to output coverage reports in',
      default: 'coverage'
    })
    .option('silent', {
      alias: 's',
      default: false,
      type: 'boolean',
      describe: "don't output a report after tests finish running"
    })
    .option('all', {
      alias: 'a',
      default: false,
      type: 'boolean',
      describe: 'whether or not to instrument all files of the project (not just the ones touched by your test suite)'
    })
    .option('exclude', {
      alias: 'x',
      default: testExclude.defaultExclude,
      describe: 'a list of specific files and directories that should be excluded from coverage, glob patterns are supported, node_modules is always excluded'
    })
    .option('include', {
      alias: 'n',
      default: [],
      describe: 'a list of specific files that should be covered, glob patterns are supported'
    })
    .option('require', {
      alias: 'i',
      default: [],
      describe: 'a list of additional modules that nyc should attempt to require in its subprocess, e.g., babel-register, babel-polyfill.'
    })
    .option('cache', {
      alias: 'c',
      default: false,
      type: 'boolean',
      describe: 'cache instrumentation results for improved performance'
    })
    .option('extension', {
      alias: 'e',
      default: [],
      describe: 'a list of extensions that nyc should handle in addition to .js'
    })
    .option('check-coverage', {
      type: 'boolean',
      default: false,
      describe: 'check whether coverage is within thresholds provided'
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
    .option('source-map', {
      default: true,
      type: 'boolean',
      description: 'should nyc detect and handle source maps?'
    })
    .option('instrument', {
      default: true,
      type: 'boolean',
      description: 'should nyc handle instrumentation?'
    })
    .option('hook-run-in-context', {
      default: true,
      type: 'boolean',
      description: 'should nyc wrap vm.runInThisContext?'
    })
    .option('show-process-tree', {
      describe: 'display the tree of spawned processes',
      default: false,
      type: 'boolean'
    })
    .pkgConf('nyc', cwd || process.cwd())
    .example('$0 npm test', 'instrument your tests with coverage')
    .example('$0 --require babel-core/register npm test', 'instrument your tests with coverage and babel')
    .example('$0 report --reporter=text-lcov', 'output lcov report after running your tests')
    .epilog('visit https://git.io/voHar for list of available reporters')
    .boolean('help')
    .boolean('h')
    .boolean('version')
}

// decorate yargs with all the actions
// that would make it exit: help, version, command.
Config.decorateYargs = function (yargs) {
  return yargs
    .help('h')
    .alias('h', 'help')
    .version()
    .command(require('../lib/commands/instrument'))
}

module.exports = Config
