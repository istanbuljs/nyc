#!/usr/bin/env node

var NYC = require('../'),
  yargs = require('yargs')
    .usage('$0 [file-to-instrument]')
    .example('$0 ./node_modules/.bin/mocha', 'run mocha test-suite and output JSON files with coverage information')

;(new NYC()).wrap()

// make it so we can run coverage on nyc itself.
var name = require.resolve('../')
delete require.cache[name]

// hide the fact that nyc.js was used to execute command.
if (process.argv[1].match((/(nyc.js$)|(nyc$)/))) process.argv.splice(1, 1)

// execute main on whatever file was wrapped by nyc.
// ./bin/nyc.js ./node_modules/.bin/mocha
if (process.argv[1]) {
  delete require('module')._cache[process.argv[1]]
  process.argv[1] = require('path').resolve(process.argv[1])
  require('module').runMain()
} else {
  yargs.showHelp()
}
