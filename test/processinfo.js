'use strict'

const { resolve } = require('path')
const { promisify } = require('util')
const { spawn } = require('child_process')
const t = require('tap')
const rimraf = promisify(require('rimraf'))
const fs = require('../lib/fs-promises')

const node = process.execPath
const bin = resolve(__dirname, '../self-coverage/bin/nyc')
const fixturesCLI = resolve(__dirname, './fixtures/cli')
const tmp = 'processinfo-test'
const resolvedJS = resolve(fixturesCLI, 'selfspawn-fibonacci.js')

rimraf.sync(resolve(fixturesCLI, tmp))
t.teardown(() => rimraf(resolve(fixturesCLI, tmp)))

t.test('build some processinfo', t => {
  var args = [
    bin, '-t', tmp,
    node, 'selfspawn-fibonacci.js', '5'
  ]
  var proc = spawn(process.execPath, args, {
    cwd: fixturesCLI,
    env: {
      PATH: process.env.PATH,
      NYC_PROCESSINFO_EXTERNAL_ID: 'blorp'
    }
  })
  // don't actually care about the output for this test, just the data
  proc.stderr.resume()
  proc.stdout.resume()
  proc.on('close', (code, signal) => {
    t.equal(code, 0)
    t.equal(signal, null)
    t.end()
  })
})

t.test('validate the created processinfo data', async t => {
  const covs = (await fs.readdir(resolve(fixturesCLI, tmp)))
    .filter(f => f !== 'processinfo')

  await Promise.all(covs.map(async f => {
    const covdata = JSON.parse(await fs.readFile(resolve(fixturesCLI, tmp, f), 'utf8'))
    t.same(Object.keys(covdata), [resolvedJS])

    // should have matching processinfo for each cov json
    const procInfoFile = resolve(fixturesCLI, tmp, 'processinfo', f)
    const procInfoData = JSON.parse(await fs.readFile(procInfoFile, 'utf8'))
    t.match(procInfoData, {
      pid: Number,
      ppid: Number,
      uuid: f.replace(/\.json$/, ''),
      argv: [
        node,
        resolvedJS,
        /[1-5]/
      ],
      execArgv: [],
      cwd: fixturesCLI,
      time: Number,
      coverageFilename: resolve(fixturesCLI, tmp, f),
      files: [resolvedJS]
    })
  }))
})

t.test('check out the index', async t => {
  const indexFile = resolve(fixturesCLI, tmp, 'processinfo', 'index.json')
  const indexJson = await fs.readFile(indexFile, 'utf-8')
  const index = JSON.parse(indexJson)
  const u = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/
  t.match(index, {
    processes: {},
    files: {
      [resolvedJS]: [u, u, u, u, u, u, u, u, u]
    },
    externalIds: {
      blorp: {
        children: [u, u, u, u, u, u, u, u]
      }
    }
  })
})
