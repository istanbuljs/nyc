#!/usr/bin/env node
var NYC = require('../'),
  argv = require('yargs')
    .usage('$0 [options]')
    .option('d', {
      alias: 'cwd',
      default: process.cwd(),
      describe: 'root directory that contains the nyc_output folder'
    })
    .option('r', {
      alias: 'reporter',
      describe: 'coverage reporter to use',
      default: 'text'
    })
    .help('h')
    .alias('h', 'help')
    .epilog('github.com/gotwarlost/istanbul for available reporters')
    .argv

process.env.NYC_CWD = argv['cwd']

;(new NYC({
  reporter: argv.reporter
})).report()
