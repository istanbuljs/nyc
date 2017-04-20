/* global describe, it */

const NYC = require('../')
require('chai').should()

describe('NYC', function () {
  describe('_disableCachingTransform', function () {
    it('is disabled if cache is "false"', function () {
      const nyc = new NYC({cache: false})
      nyc._disableCachingTransform().should.equal(true)
    })

    it('is enabled if cache is "true" and isChildProcess is "true"', function () {
      const nyc = new NYC({
        cache: true,
        isChildProcess: true
      })
      nyc._disableCachingTransform().should.equal(false)
    })

    it('is disabled if cache is "true" and isChildProcess is "false"', function () {
      const nyc = new NYC({
        cache: true,
        isChildProcess: true
      })
      nyc._disableCachingTransform().should.equal(false)
    })
  })
})
