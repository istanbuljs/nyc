#!/usr/bin/env node
var foreground = require('foreground-child')
var NYC = require('../')
var path = require('path')
var sw = require('spawn-wrap')

if (process.env.NYC_CWD) {
  ;(new NYC()).wrap()

  // make sure we can run coverage on
  // our own index.js, I like turtles.
  var name = require.resolve('../')
  delete require.cache[name]

  sw.runMain()
} else {
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
    .help('h')
    .alias('h', 'help')
    .version(require('../package.json').version)
    .example('$0 npm test', 'instrument your tests with coverage')
    .example('$0 report --reporter=text-lcov', 'output lcov report after running your tests')
    .epilog('visit http://git.io/vTJJB for list of available reporters')
  var argv = yargs.argv

  if (~argv._.indexOf('report')) {
    // run a report.
    process.env.NYC_CWD = process.cwd()

    report(argv)
  } else if (~argv._.indexOf('check-coverage')) {
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
      ]
    )
  } else if (argv._.length) {
    // wrap subprocesses and execute argv[1]
    var nyc = (new NYC())
    nyc.cleanup()

    if (argv.all) nyc.addAllFiles()

    sw([__filename], {
      NYC_CWD: process.cwd()
    })

    foreground(nyc.mungeArgs(argv), function (done) {
      if (!argv.silent) report(argv)
      return done()
    })
  } else {
    // I don't have a clue what you're doing.
    yargs.showHelp()
  }
}

function report (argv) {
  process.env.NYC_CWD = process.cwd()

  ;(new NYC({
    reporter: argv.reporter
  })).report()
}
