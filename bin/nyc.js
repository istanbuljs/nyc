#!/usr/bin/env node

var NYC = require('../')

;(new NYC()).wrap()

// make it so we can run coverage on nyc.
// turtles all the way down.
var name = require.resolve('../')
delete require.cache[name]

// hide the fact that nyc.js was used to execute command.
if (process.argv[1].match((/(nyc.js$)|(nyc$)/))) process.argv.splice(1, 1)

// execute main on the file passed to nyc:
// ./bin/nyc.js ./node_modules/.bin/mocha
if (process.argv[1]) {
  delete require('module')._cache[process.argv[1]]
  process.argv[1] = require('path').resolve(process.argv[1])
  require('module').runMain()
}
