#!/usr/bin/env node
'use strict'

const configUtil = require('../lib/config-util')
const foreground = require('foreground-child')
const NYC = require('../index.js')
const processArgs = require('../lib/process-args')

const sw = require('spawn-wrap')
const wrapper = require.resolve('./wrap.js')

// parse configuration and command-line arguments;
// we keep these values in a few different forms,
// used in the various execution contexts of nyc:
// reporting, instrumenting subprocesses, etc.
const yargs = configUtil.buildYargs()
const instrumenterArgs = processArgs.hideInstrumenteeArgs()
const config = configUtil.loadConfig(yargs.parse(instrumenterArgs))
configUtil.addCommandsAndHelp(yargs)
const argv = yargs.config(config).parse(instrumenterArgs)

async function main () {
  if (['check-coverage', 'report', 'instrument', 'merge'].includes(argv._[0])) {
    // look in lib/commands for logic.
    return
  }

  if (argv._.length === 0) {
    // I don't have a clue what you're doing.
    process.exitCode = 1
    yargs.showHelp()
    return
  }

  // if instrument is set to false,
  // enable a noop instrumenter.
  if (!argv.instrument) argv.instrumenter = './lib/instrumenters/noop'
  else argv.instrumenter = './lib/instrumenters/istanbul'

  var nyc = (new NYC(argv))
  if (argv.clean) {
    await nyc.reset()
  } else {
    await nyc.createTempDirectory()
  }

  if (argv.all) {
    await nyc.addAllFiles()
  }

  var env = {
    // Support running nyc as a user without HOME (e.g. linux 'nobody'),
    // https://github.com/istanbuljs/nyc/issues/951
    SPAWN_WRAP_SHIM_ROOT: process.env.SPAWN_WRAP_SHIM_ROOT || process.env.XDG_CACHE_HOME || require('os').homedir(),
    NYC_CONFIG: JSON.stringify(argv),
    NYC_CWD: process.cwd()
  }

  if (argv['babel-cache'] === false) {
    // babel's cache interferes with some configurations, so is
    // disabled by default. opt in by setting babel-cache=true.
    env.BABEL_DISABLE_CACHE = process.env.BABEL_DISABLE_CACHE = '1'
  }

  sw([wrapper], env)

  // Both running the test script invocation and the check-coverage run may
  // set process.exitCode. Keep track so that both children are run, but
  // a non-zero exit codes in either one leads to an overall non-zero exit code.
  process.exitCode = 0
  foreground(processArgs.hideInstrumenterArgs(
    // use the same argv description, but don't exit
    // for flags like --help.
    configUtil.buildYargs().parse(process.argv.slice(2))
  ), async () => {
    var mainChildExitCode = process.exitCode

    await nyc.writeProcessIndex()

    nyc.maybePurgeSourceMapCache()
    if (argv.checkCoverage) {
      await nyc.checkCoverage({
        lines: argv.lines,
        functions: argv.functions,
        branches: argv.branches,
        statements: argv.statements
      }, argv['per-file'])
      process.exitCode = process.exitCode || mainChildExitCode
    }

    if (!argv.silent) {
      await nyc.report()
    }
  })
}

main()
