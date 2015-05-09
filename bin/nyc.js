#!/usr/bin/env node

var _ = require('lodash'),
  fs = require('fs'),
  NYC = require('../'),
  nyc = new NYC({
    cwd: '/Users/benjamincoe/bcoe/node-tap/'
  })

nyc.wrap()

// make it so we can run coverage on nyc.
// turtles all the way down.
var name = require.resolve('../')
delete require.cache[name]

// hide the fact that nyc.js was used to execute command.
fs.appendFileSync('/Users/benjamincoe/output.log', JSON.stringify(process.argv) + '\n', 'utf-8')
process.argv = _.filter(process.argv, function (arg) {
  return !arg.match(/(nyc.js$)|(nyc$)|(nyc-sub.js$)|(nyc-sub$)/)
})

// execute main on the file passed to nyc:
// ./bin/nyc.js ./node_modules/.bin/mocha
if (process.argv[1]) {
  delete require('module')._cache[process.argv[1]]
  process.argv[1] = require('path').resolve(process.argv[1])
  require('module').runMain()
}
