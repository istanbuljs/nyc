const { spawn } = require('child_process')
const { resolve } = require('path')
const t = require('tap')
const node = process.execPath
const fixturesCLI = resolve(__dirname, './fixtures/cli')
const bin = resolve(__dirname, '../self-coverage/bin/nyc')
const rimraf = require('rimraf').sync
const tmp = 'conf-override-test'

rimraf(resolve(fixturesCLI, tmp))
t.teardown(() => rimraf(resolve(fixturesCLI, tmp)))

t.test('spawn that does config overriding', t => {
  const args = [
    bin, '-t', tmp,
    '--exclude-after-remap=false',
    '--include=conf-override-root.js',
    node, 'conf-override-root.js'
  ]
  const proc = spawn(node, args, {
    cwd: fixturesCLI
  })
  const out = []
  const err = []
  proc.stdout.on('data', c => out.push(c))
  proc.stderr.on('data', c => err.push(c))
  proc.on('close', (code, signal) => {
    t.equal(code, 0)
    t.equal(signal, null)
    t.matchSnapshot(Buffer.concat(out).toString(), 'stdout')
    t.end()
  })
})
