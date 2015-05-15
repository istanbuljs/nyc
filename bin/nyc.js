#!/usr/bin/env node
var sw = require('spawn-wrap')

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

  // this spawn gets wrapped
  var child = require('child_process').spawn(
    process.argv[2],
    process.argv.slice(3),
    { stdio: 'inherit' }
  )

  child.on('close', function (code, signal) {
    if (signal) {
      process.kill(process.pid, signal)
    } else {
      process.exit(code)
    }
  })
}
