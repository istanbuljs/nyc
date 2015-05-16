#!/usr/bin/env node
var foreground = require('foreground-child'),
  sw = require('spawn-wrap')

if (process.env.NYC_CWD) {
  var NYC = require('../')
  ;(new NYC()).wrap()

  // make sure we can run coverage on
  // our own index.js, I like turtles.
  var name = require.resolve('../')
  delete require.cache[name]

  sw.runMain()
} else {
  var NYC = require('../')

  ;(new NYC()).cleanup()

  sw([__filename], {
    NYC_CWD: process.cwd()
  })

  foreground(process.argv.slice(2))
}
