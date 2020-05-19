'use strict'

const t = require('tap')

const NYC = require('../self-coverage')

const { parseArgv, resetState } = require('./helpers')

// we test exit handlers in nyc-integration.js.
NYC.prototype._wrapExit = () => {}

require('source-map-support').install({ hookRequire: true })

t.beforeEach(resetState)

t.test('handles stack traces', async t => {
  const nyc = new NYC(await parseArgv(undefined, [
    '--produce-source-map=true'
  ]))
  await nyc.reset()
  nyc.wrap()

  const check = require('./fixtures/stack-trace')
  t.match(check(), /stack-trace.js:4:/)
})

t.test('does not handle stack traces when disabled', async t => {
  const nyc = new NYC(await parseArgv(undefined, [
    '--produce-source-map=false'
  ]))
  await nyc.reset()
  nyc.wrap()

  const check = require('./fixtures/stack-trace')
  t.notMatch(check(), /stack-trace.js:4:/)
})
