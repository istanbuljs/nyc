const {resolve} = require('path')
const bin = resolve(__dirname, '../self-coverage/bin/nyc')
const {spawn} = require('child_process')
const t = require('tap')
const rimraf = require('rimraf')
const node = process.execPath
const fixturesCLI = resolve(__dirname, './fixtures/cli')
const tmp = 'processinfo-test'
const fs = require('fs')
const resolvedJS = resolve(fixturesCLI, 'selfspawn-fibonacci.js')

rimraf.sync(resolve(fixturesCLI, tmp))
t.teardown(() => rimraf.sync(resolve(fixturesCLI, tmp)))

t.test('build some processinfo', t => {
  var args = [
    bin, '-t', tmp, '--build-process-tree',
    node, 'selfspawn-fibonacci.js', '5',
  ]
  var proc = spawn(process.execPath, args, {
    cwd: fixturesCLI,
    env: {
      PATH: process.env.PATH,
      NYC_PROCESSINFO_EXTERNAL_ID: 'blorp',
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

t.test('validate the created processinfo data', t => {
  const covs = fs.readdirSync(resolve(fixturesCLI, tmp))
    .filter(f => f !== 'processinfo')
  t.plan(covs.length * 2)

  covs.forEach(f => {
    fs.readFile(resolve(fixturesCLI, tmp, f), 'utf8', (er, covjson) => {
      if (er)
        throw er
      const covdata = JSON.parse(covjson)
      t.same(Object.keys(covdata), [resolvedJS])
      // should have matching processinfo for each cov json
      const procInfoFile = resolve(fixturesCLI, tmp, 'processinfo', f)
      fs.readFile(procInfoFile, 'utf8', (er, procInfoJson) => {
        if (er)
          throw er
        const procInfoData = JSON.parse(procInfoJson)
        t.match(procInfoData, {
          pid: /^[0-9]+$/,
          ppid: /^[0-9]+$/,
          uuid: f.replace(/\.json$/, ''),
          argv: [
            node,
            resolvedJS,
            /[1-5]/,
          ],
          execArgv: [],
          cwd: fixturesCLI,
          time: Number,
          root: /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/,
          coverageFilename: resolve(fixturesCLI, tmp, f),
          nodes: [],
          _coverageMap: null,
          files: [ resolvedJS ],
          children: Array,
        })
      })
    })
  })
})

t.test('check out the index', t => {
  const indexFile = resolve(fixturesCLI, tmp, 'processinfo', 'index.json')
  const indexJson = fs.readFileSync(indexFile, 'utf-8')
  const index = JSON.parse(indexJson)
  const u = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/
  t.match(index, {
    processes: {},
    files: {
      [resolvedJS]: [u, u, u, u, u, u, u, u, u ],
    },
    externalIds: {
      blorp: {
        root: u,
        children: [u, u, u, u, u, u, u, u ],
      },
    },
  })
  t.end()
})
