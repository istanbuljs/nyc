#!/usr/bin/env node
var foreground = require('foreground-child')
var NYC
try {
  NYC = require('../index.covered.js')
} catch (e) {
  NYC = require('../index.js')
}

var path = require('path')
var sw = require('spawn-wrap')
var wrapper = require.resolve('./wrap.js')

var yargs = require('yargs')
  .usage('$0 [command] [options]\n\nrun your tests with the nyc bin to instrument them with coverage')
  .command('report', 'run coverage report for .nyc_output', function (yargs) {
    yargs
      .usage('$0 report [options]')
      .option('r', {
        alias: 'reporter',
        describe: 'coverage reporter(s) to use',
        default: 'text'
      })
      .option('report-dir', {
        describe: 'default directory to output coverage reports in',
        default: 'coverage'
      })
      .help('h')
      .alias('h', 'help')
      .example('$0 report --reporter=lcov', 'output an HTML lcov report to ./coverage')
  })
  .command('check-coverage', 'check whether coverage is within thresholds provided', function (yargs) {
    yargs
      .usage('$0 check-coverage [options]')
      .option('b', {
        alias: 'branches',
        default: 0,
        description: 'what % of branches must be covered?'
      })
      .option('f', {
        alias: 'functions',
        default: 0,
        description: 'what % of functions must be covered?'
      })
      .option('l', {
        alias: 'lines',
        default: 90,
        description: 'what % of lines must be covered?'
      })
      .option('s', {
        alias: 'statements',
        default: 0,
        description: 'what % of statements must be covered?'
      })
      .help('h')
      .alias('h', 'help')
      .example('$0 check-coverage --lines 95', "check whether the JSON in nyc's output folder meets the thresholds provided")
  })
  .option('r', {
    alias: 'reporter',
    describe: 'coverage reporter(s) to use',
    default: 'text'
  })
  .option('report-dir', {
    describe: 'default directory to output coverage reports in',
    default: 'coverage'
  })
  .option('s', {
    alias: 'silent',
    default: false,
    type: 'boolean',
    describe: "don't output a report after tests finish running"
  })
  .option('a', {
    alias: 'all',
    default: false,
    type: 'boolean',
    describe: 'whether or not to instrument all files of the project (not just the ones touched by your test suite)'
  })
  .option('i', {
    alias: 'require',
    default: [],
    describe: 'a list of additional modules that nyc should attempt to require in its subprocess, e.g., babel-register, babel-polyfill.'
  })
  .option('c', {
    alias: 'cache',
    default: false,
    type: 'boolean',
    describe: 'cache instrumentation results for improved performance'
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
  .help('h')
  .alias('h', 'help')
  .version(require('../package.json').version)
  .example('$0 npm test', 'instrument your tests with coverage')
  .example('$0 --require babel-core/polyfill --require babel-core/register npm test', 'instrument your tests with coverage and babel')
  .example('$0 report --reporter=text-lcov', 'output lcov report after running your tests')
  .epilog('visit http://git.io/vTJJB for list of available reporters')
var argv = yargs.argv

if (argv._[0] === 'report') {
  // run a report.
  process.env.NYC_CWD = process.cwd()

  report(argv)
} else if (argv._[0] === 'check-coverage') {
  checkCoverage(argv)
} else if (argv._.length) {
  // wrap subprocesses and execute argv[1]
  if (!Array.isArray(argv.require)) argv.require = [argv.require]

  var nyc = (new NYC({
    require: argv.require
  }))
  nyc.reset()

  if (argv.all) nyc.addAllFiles()

  var env = {
    NYC_CWD: process.cwd(),
    NYC_CACHE: argv.cache ? 'enable' : 'disable'
  }
  if (argv.require.length) {
    env.NYC_REQUIRE = argv.require.join(',')
  }
  sw([wrapper], env)

  foreground(nyc.mungeArgs(argv), function (done) {
    if (argv.checkCoverage) {
      checkCoverage(argv, function (done) {
        if (!argv.silent) report(argv)
        return done()
      })
    } else {
      if (!argv.silent) report(argv)
      return done()
    }
  })
} else {
  // I don't have a clue what you're doing.
  yargs.showHelp()
}

function report (argv) {
  process.env.NYC_CWD = process.cwd()

  ;(new NYC({
    reporter: argv.reporter,
    reportDir: argv.reportDir
  })).report()
}

function checkCoverage (argv, cb) {
  foreground(
    process.execPath,
    [
      require.resolve('istanbul/lib/cli'),
      'check-coverage',
      '--lines=' + argv.lines,
      '--functions=' + argv.functions,
      '--branches=' + argv.branches,
      '--statements=' + argv.statements,
      path.resolve(process.cwd(), './.nyc_output/*.json')
    ],
    cb
  )
}
