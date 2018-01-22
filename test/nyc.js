/* global describe, it */

const NYC = require('../')
const path = require('path')

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

  describe('cacheDirectory', function () {
    it('should resolve default cache folder to absolute path', function () {
      const nyc = new NYC({
        cache: true
      })
      path.isAbsolute(nyc.cacheDirectory).should.equal(true)
    })

    it('should resolve custom cache folder to absolute path', function () {
      const nyc = new NYC({
        cacheDir: '.nyc_cache',
        cache: true
      })
      path.isAbsolute(nyc.cacheDirectory).should.equal(true)
    })
  })
})
