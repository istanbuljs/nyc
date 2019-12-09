'use strict'

const path = require('path')

const { test } = require('tap')

const NYC = require('../self-coverage')

const { parseArgv } = require('./helpers')

test("loads 'exclude' patterns from package.json#nyc", async t => {
  const nyc = new NYC(await parseArgv(path.resolve(__dirname, './fixtures')))

  t.strictEqual(nyc.exclude.exclude.length, 8)
})

test("loads 'extension' patterns from package.json#nyc", async t => {
  const nyc = new NYC(await parseArgv(path.resolve(__dirname, './fixtures/conf-multiple-extensions')))

  t.strictEqual(nyc.extensions.length, 3)
})

test("ignores 'include' option if it's falsy or []", async t => {
  const nyc1 = new NYC(await parseArgv(path.resolve(__dirname, './fixtures/conf-empty')))

  t.strictEqual(nyc1.exclude.include, false)

  const nyc2 = new NYC({
    include: []
  })

  t.strictEqual(nyc2.exclude.include, false)
})

test("ignores 'exclude' option if it's falsy", async t => {
  const nyc = new NYC(await parseArgv(path.resolve(__dirname, './fixtures/conf-empty')))

  t.strictEqual(nyc.exclude.exclude.length, 27)
})

test("allows for empty 'exclude'", async t => {
  const nyc = new NYC({ exclude: [] })

  // an empty exclude still has **/node_modules/**, node_modules/** and added.
  t.strictEqual(nyc.exclude.exclude.length, 2)
})

test("allows for completely empty 'exclude' with exclude-node-modules", async t => {
  const nyc = new NYC({ exclude: [], excludeNodeModules: false })

  t.strictEqual(nyc.exclude.exclude.length, 0)
})

test('should resolve default cache folder to absolute path', async t => {
  const nyc = new NYC({
    cache: true
  })

  t.strictEqual(path.isAbsolute(nyc.cacheDirectory), true)
})

test('should resolve custom cache folder to absolute path', async t => {
  const nyc = new NYC({
    cacheDir: '.nyc_cache',
    cache: true
  })

  t.strictEqual(path.isAbsolute(nyc.cacheDirectory), true)
})

test('if cache is false _disableCachingTransform is true', async t => {
  const nycParent = new NYC({ cache: false, isChildProcess: false })
  const nycChild = new NYC({ cache: false, isChildProcess: true })

  t.strictEqual(nycParent._disableCachingTransform(), true)
  t.strictEqual(nycChild._disableCachingTransform(), true)
})

test('if cache is true _disableCachingTransform is equal to !isChildProcess', async t => {
  const nycParent = new NYC({ cache: true, isChildProcess: false })
  const nycChild = new NYC({ cache: true, isChildProcess: true })

  t.strictEqual(nycParent._disableCachingTransform(), true)
  t.strictEqual(nycChild._disableCachingTransform(), false)
})
