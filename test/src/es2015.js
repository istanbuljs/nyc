/* global describe, it */

var NYC

try {
  NYC = require('../../index.covered.js')
} catch (e) {
  NYC = require('../../')
}

(new NYC()).wrap()

require('babel-core/register')
require('tap').mochaGlobals()

describe('es2015 coverage', function () {
  it('covers async/await branch', function () {
    require('../fixtures/es2015/asyncawait')
  })
})
