/* global describe, it */

require('chai').should()
require('tap').mochaGlobals()

const { readFileSync } = require('fs')
const SourceMaps = require('../self-coverage/lib/source-maps')

describe('source-maps', function () {
  it('caches source maps globally', function () {
    const sm = new SourceMaps({})
    // load a source map into cache.
    const sourceFile = require.resolve('./fixtures/source-maps/instrumented/s1.min.js')
    sm.extractAndRegister(readFileSync(sourceFile, 'utf8'), sourceFile, 'abc123')
    // create a new SourceMaps instance.
    const sm2 = new SourceMaps({})
    // the two instances of SourceMaps should share a cache.
    sm._sourceMapCache.should.deep.equal(sm2._sourceMapCache)
  })
})
