'use strict'

const path = require('path')

const t = require('tap')

const NYC = require('../self-coverage')

const { parseArgv } = require('./helpers')

t.beforeEach(async () => {
  delete process.env.NYC_CWD
})

t.test('sets cwd to process.cwd() if no environment variable is set', async t => {
  const nyc = new NYC(await parseArgv())

  t.strictEqual(nyc.cwd, process.cwd())
})

t.test('uses NYC_CWD environment variable for cwd if it is set', async t => {
  const fixtures = path.resolve(__dirname, './fixtures')
  process.env.NYC_CWD = fixtures
  const nyc = new NYC(await parseArgv())

  t.strictEqual(nyc.cwd, fixtures)
})

t.test('will look upwards for package.json from cwd', async t => {
  const nyc = new NYC(await parseArgv(__dirname))

  t.strictEqual(nyc.cwd, path.join(__dirname, '..'))
})

t.test('uses --cwd for cwd if it is set (highest priority and does not look upwards for package.json) ', async t => {
  const nyc = new NYC(await parseArgv(__dirname, ['--cwd', __dirname]))

  t.strictEqual(nyc.cwd, __dirname)
})
