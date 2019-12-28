#!/usr/bin/env node
'use strict';

const foreground = require('foreground-child');
const resolveFrom = require('resolve-from');

const configUtil = require('../lib/config-util');
const {cliWrapper, suppressEPIPE} = require('../lib/commands/helpers');
const NYC = require('..');

// Parse configuration and command-line arguments;
// we keep these values in a few different forms,
// used in the various execution contexts of nyc:
// reporting, instrumenting subprocesses, etc.

async function main() {
  const {argv, childArgs, yargs} = await configUtil();

  if (['check-coverage', 'report', 'instrument', 'merge'].includes(argv._[0])) {
    // See lib/commands for logic.
    return;
  }

  if (argv._.length === 0) {
    // I don't have a clue what you're doing.
    process.exitCode = 1;
    yargs.showHelp();
    return;
  }

  // Enable noop instrumenter if instrument=false.
  argv.instrumenter = `./lib/instrumenters/${argv.instrument ? 'istanbul' : 'noop'}`;

  const nyc = new NYC(argv);
  if (argv.clean) {
    await nyc.reset();
  } else {
    await nyc.createTempDirectory();
  }

  const env = {
    NYC_CONFIG: JSON.stringify(argv),
    NYC_CWD: process.cwd()
  };

  /* istanbul ignore else */
  if (argv['babel-cache'] === false) {
    // Disable babel cache by default as it interferes with some
    // configurations.  Can opt-in by seting babel-cache=true.
    env.BABEL_DISABLE_CACHE = '1';
    process.env.BABEL_DISABLE_CACHE = '1';
  }

  if (!argv.useSpawnWrap) {
    const requireModules = [
      require.resolve('../lib/register-env.js'),
      ...nyc.require.map(mod => resolveFrom.silent(nyc.cwd, mod) || mod)
    ];
    const preloadList = require('node-preload');
    preloadList.push(
      ...requireModules,
      require.resolve('../lib/wrap.js')
    );

    Object.assign(process.env, env);
    requireModules.forEach(mod => {
      require(mod);
    });
  }

  if (argv.all) {
    await nyc.addAllFiles();
  }

  if (argv.useSpawnWrap) {
    const wrapper = require.resolve('./wrap.js');
    // Support running nyc as a user without HOME (e.g. linux 'nobody'),
    // https://github.com/istanbuljs/nyc/issues/951
    env.SPAWN_WRAP_SHIM_ROOT = process.env.SPAWN_WRAP_SHIM_ROOT || process.env.XDG_CACHE_HOME || require('os').homedir();
    const sw = require('spawn-wrap');

    sw([wrapper], env);
  }

  // Both running the test script invocation and the check-coverage run may
  // set process.exitCode. Keep track so that both children are run, but
  // a non-zero exit codes in either one leads to an overall non-zero exit code.
  process.exitCode = 0;
  foreground(childArgs, async () => {
    const mainChildExitCode = process.exitCode;

    try {
      await nyc.writeProcessIndex();

      nyc.maybePurgeSourceMapCache();
      if (argv.checkCoverage) {
        await nyc.checkCoverage({
          lines: argv.lines,
          functions: argv.functions,
          branches: argv.branches,
          statements: argv.statements
        }, argv['per-file']).catch(suppressEPIPE);
        process.exitCode = process.exitCode || mainChildExitCode;
      }

      if (!argv.silent) {
        await nyc.report().catch(suppressEPIPE);
      }
    } catch (error) {
      /* istanbul ignore next */
      process.exitCode = process.exitCode || mainChildExitCode || 1;
      /* istanbul ignore next */
      console.error(error.message);
    }
  });
}

cliWrapper(main)();
