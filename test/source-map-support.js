'use strict'

const t = require('tap')

const NYC = require('../self-coverage')
const configUtil = require('../self-coverage/lib/config-util')

const resetState = require('./helpers/reset-state')

// we test exit handlers in nyc-integration.js.
NYC.prototype._wrapExit = () => {}

require('source-map-support').install({ hookRequire: true })

t.beforeEach(resetState)

t.test('handles stack traces', async t => {
  const nyc = new NYC(configUtil.buildYargs().parse('--produce-source-map'))
  await nyc.reset()
  nyc.wrap()

  const check = require('./fixtures/stack-trace')
  // XXX investigate why this doesn't remap to line 4
  t.notMatch(check(), /stack-trace.js:1:/)
})

t.test('does not handle stack traces when disabled', async t => {
  const nyc = new NYC(configUtil.buildYargs().parse())
  await nyc.reset()
  nyc.wrap()

  const check = require('./fixtures/stack-trace')
  t.match(check(), /stack-trace.js:1:/)
})
