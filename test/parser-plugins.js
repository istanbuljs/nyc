'use strict'

const path = require('path')

const t = require('tap')

const { runNYC } = require('./helpers')

const cwd = path.resolve(__dirname, './fixtures/parser-plugins')

t.test('parser plugin set', async t => {
  const { status, stdout, stderr } = await runNYC({
    args: ['instrument', 'v8.js'],
    cwd
  })
  t.strictEqual(status, 0)
  t.strictEqual(stderr, '')
  t.match(stdout, /function cov_/)
})

t.test('parser plugin unset', async t => {
  const { status, stdout, stderr } = await runNYC({
    args: ['instrument', '--nycrc-path=no-plugins.json', 'v8.js'],
    cwd
  })
  t.strictEqual(status, 0)
  t.strictEqual(stderr, '')
  t.notMatch(stdout, /function cov_/)
})
