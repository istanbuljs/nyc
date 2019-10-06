'use strict'

const fs = require('../lib/fs-promises')
const path = require('path')
const { promisify } = require('util')

const t = require('tap')
const rimraf = promisify(require('rimraf'))

const { runNYC, fixturesCLI } = require('./helpers')

function cleanup () {
  return Promise.all([
    rimraf(path.resolve(fixturesCLI, '.nyc_output')),
    rimraf(path.resolve(fixturesCLI, '.temp_directory')),
    rimraf(path.resolve(fixturesCLI, '.temp_dir'))
  ])
}

t.beforeEach(cleanup)
t.teardown(cleanup)

t.test('creates the default \'tempDir\' when none is specified', async t => {
  const { status } = await runNYC({
    args: [process.execPath, './half-covered.js']
  })

  t.strictEqual(status, 0)

  const cliFiles = await fs.readdir(path.resolve(fixturesCLI))
  t.strictEqual(cliFiles.includes('.nyc_output'), true)
  t.strictEqual(cliFiles.includes('.temp_dir'), false)
  t.strictEqual(cliFiles.includes('.temp_directory'), false)

  const tempFiles = await fs.readdir(path.resolve(fixturesCLI, '.nyc_output'))
  t.strictEqual(tempFiles.length, 2) // the coverage file, and processinfo
})

t.test('prefers \'tempDirectory\' to \'tempDir\'', async t => {
  const { status } = await runNYC({
    args: [
      '--tempDirectory',
      '.temp_directory',
      '--tempDir',
      '.temp_dir',
      process.execPath,
      './half-covered.js'
    ]
  })

  t.strictEqual(status, 0)

  const cliFiles = await fs.readdir(path.resolve(fixturesCLI))
  t.strictEqual(cliFiles.includes('.nyc_output'), false)
  t.strictEqual(cliFiles.includes('.temp_dir'), false)
  t.strictEqual(cliFiles.includes('.temp_directory'), true)

  const tempFiles = await fs.readdir(path.resolve(fixturesCLI, '.temp_directory'))
  t.strictEqual(tempFiles.length, 2)
})

t.test('uses the \'tempDir\' option if \'tempDirectory\' is not set', async t => {
  const { status } = await runNYC({
    args: [
      '--tempDir',
      '.temp_dir',
      process.execPath,
      './half-covered.js'
    ]
  })

  t.strictEqual(status, 0)

  const cliFiles = await fs.readdir(path.resolve(fixturesCLI))
  t.strictEqual(cliFiles.includes('.nyc_output'), false)
  t.strictEqual(cliFiles.includes('.temp_dir'), true)
  t.strictEqual(cliFiles.includes('.temp_directory'), false)

  const tempFiles = await fs.readdir(path.resolve(fixturesCLI, '.temp_dir'))
  t.strictEqual(tempFiles.length, 2)
})
