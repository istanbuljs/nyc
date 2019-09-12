'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const t = require('tap')
const isWindows = require('is-windows')()

const { spawn, fixturesCLI, nycBin } = require('./helpers')

const fakebin = path.resolve(fixturesCLI, 'fakebin')

const unlink = promisify(fs.unlink)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const chmod = promisify(fs.chmod)
const symlink = promisify(fs.symlink)

const spawnOptions = {
  cwd: path.resolve(fixturesCLI, 'run-npm-test-recursive'),
  env: {
    PATH: fakebin + ':' + process.env.PATH
  }
}

async function writeFakeNPM (shebang) {
  const targetPath = path.resolve(fakebin, 'npm')
  const source = await readFile(path.resolve(fakebin, 'npm-template.js'))
  await writeFile(targetPath, '#!' + shebang + '\n' + source)
  await chmod(targetPath, 493) // 0o755
}

async function runFakeNPM (t) {
  const args = [nycBin, 'npm', 'test']
  const { stderr, status } = await spawn(process.execPath, args, spawnOptions)

  t.strictEqual(status, 0)
  t.strictEqual(stderr, '')
}

t.beforeEach(() => Promise.all([
  unlink(path.resolve(fakebin, 'node')).catch(() => {}),
  unlink(path.resolve(fakebin, 'npm')).catch(() => {})
]))

t.test('can run "npm test", absolute shebang edition', async t => {
  if (isWindows) {
    return
  }

  await writeFakeNPM(process.execPath)
  await runFakeNPM(t)
})

t.test('can run "npm test", weird bash+dirname shebang edition', async t => {
  if (isWindows) {
    return
  }

  // This string is taken verbatim from tools/install.py in Node core v5.x
  await writeFakeNPM('/bin/sh\n// 2>/dev/null; exec "`dirname "$0"`/node" "$0" "$@"')
  await symlink(process.execPath, path.resolve(fakebin, 'node'))
  await runFakeNPM(t)
})
