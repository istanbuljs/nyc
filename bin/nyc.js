#!/usr/bin/env node
var arrify = require('arrify')
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

var yargs = require('yargs/yargs')(process.argv.slice(2))
  .usage('$0 [command] [options]\n\nrun your tests with the nyc bin to instrument them with coverage')
  .command('report', 'run coverage report for .nyc_output', function (yargs) {
    return yargs
      .usage('$0 report [options]')
      .example('$0 report --reporter=lcov', 'output an HTML lcov report to ./coverage')
  })
  .command('check-coverage', 'check whether coverage is within thresholds provided', function (yargs) {
    return yargs
      .usage('$0 check-coverage [options]')
      .example('$0 check-coverage --lines 95', "check whether the JSON in nyc's output folder meets the thresholds provided")
  })
  .option('reporter', {
    alias: 'r',
    describe: 'coverage reporter(s) to use',
    default: 'text',
    global: true
  })
  .option('report-dir', {
    describe: 'default directory to output coverage reports in',
    default: 'coverage',
    global: true
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
    default: [],
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
  .options('extension', {
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
    description: 'what % of branches must be covered?',
    global: true
  })
  .option('functions', {
    default: 0,
    description: 'what % of functions must be covered?',
    global: true
  })
  .option('lines', {
    default: 90,
    description: 'what % of lines must be covered?',
    global: true
  })
  .option('statements', {
    default: 0,
    description: 'what % of statements must be covered?',
    global: true
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
  .option('instrumenter', {
    default: './lib/instrumenters/istanbul',
    type: 'string',
    description: 'what library should be used to instrument coverage?'
  })
  .help('h')
  .alias('h', 'help')
  .version()
  .pkgConf('nyc', process.cwd())
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
  argv.require = arrify(argv.require)
  argv.extension = arrify(argv.extension)
  argv.exclude = arrify(argv.exclude)
  argv.include = arrify(argv.include)

  // if instrument is set to false,
  // enable a noop instrumenter.
  if (!argv.instrument) argv.instrumenter = './lib/instrumenters/noop'

  var nyc = (new NYC({
    require: argv.require,
    include: argv.include,
    exclude: argv.exclude,
    sourceMap: !!argv.sourceMap
  }))
  nyc.reset()

  if (argv.all) nyc.addAllFiles()

  var env = {
    NYC_CWD: process.cwd(),
    NYC_CACHE: argv.cache ? 'enable' : 'disable',
    NYC_SOURCE_MAP: argv.sourceMap ? 'enable' : 'disable',
    NYC_INSTRUMENTER: argv.instrumenter
  }
  if (argv.require.length) {
    env.NYC_REQUIRE = argv.require.join(',')
  }
  if (argv.extension.length) {
    env.NYC_EXTENSION = argv.extension.join(',')
  }
  if (argv.exclude.length) {
    env.NYC_EXCLUDE = argv.exclude.join(',')
  }
  if (argv.include.length) {
    env.NYC_INCLUDE = argv.include.join(',')
  }
  sw([wrapper], env)

  // Both running the test script invocation and the check-coverage run may
  // set process.exitCode. Keep track so that both children are run, but
  // a non-zero exit codes in either one leads to an overall non-zero exit code.
  process.exitCode = 0
  foreground(nyc.mungeArgs(argv), function (done) {
    var mainChildExitCode = process.exitCode

    if (argv.checkCoverage) {
      checkCoverage(argv, function (done) {
        process.exitCode = process.exitCode || mainChildExitCode

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
