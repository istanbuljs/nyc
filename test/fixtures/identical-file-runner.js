const path = require('path')
const assert = require('assert')
const file1 = require('./identical-file1.js')
const file2 = require('./identical-file2.js')

assert.equal(file1(), file2())

const cov = (new Function('return this.__coverage__'))()

assert.deepEqual(Object.keys(cov).sort(), [
  __filename,
  path.resolve('identical-file1.js'),
  path.resolve('identical-file2.js')
])
