/* global it */

var NYC = require('../')

require('chai').should()
require('tap').mochaGlobals()

it('wraps modules with coverage counters when they are required', function () {
  var nyc = new NYC({
    cwd: process.cwd()
  })
  nyc.wrap()

  // clear the module cache so that
  // we pull index.js in again and wrap it.
  var name = require.resolve('../')
  delete require.cache[name]

  // when we require index.js it should be wrapped.
  var index = require('../')
  index.should.match(/__cov_/)
})
