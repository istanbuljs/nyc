'use strict'

const fs = require('fs')
const path = require('path')

const t = require('tap')
const isWindows = require('is-windows')()
const { rimraf } = require('rimraf')

const NYC = require('../self-coverage')

const { parseArgv, runNYC, resetState } = require('./helpers')

const fixtures = path.resolve(__dirname, 'fixtures')

t.beforeEach(resetState)

async function testSignal (t, signal) {
  if (isWindows) {
    t.end()

    return
  }

  const nyc = new NYC(await parseArgv(fixtures))
  await runNYC({
    args: [`./${signal}.js`],
    cwd: fixtures
  })

  const checkFile = path.join(fixtures, `${signal}.js`)
  const reports = (await nyc.coverageData()).filter(report => report[checkFile])

  t.equal(reports.length, 1)
}

t.test('writes coverage report when process is killed with SIGTERM', t => testSignal(t, 'sigterm'))

t.test('writes coverage report when process is killed with SIGINT', t => testSignal(t, 'sigint'))

t.test('allows coverage report to be output in an alternative directory', async t => {
  const nyc = new NYC(await parseArgv(undefined, [
    '--report-dir=./alternative-report',
    '--reporter=lcov'
  ]))
  await nyc.reset()

  await nyc.report()
  t.equal(fs.existsSync('./alternative-report/lcov.info'), true)
  await rimraf('./alternative-report')
})

function listFiles (dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir).reduce((files, name) => {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      return files.concat(listFiles(full))
    }
    files.push(full)
    return files
  }, [])
}

t.test('html reporter sanitizes sourcemap sources with invalid Windows filename characters', async t => {
  const tempDir = path.resolve('./.nyc_output_html_invalid_chars')
  const reportDir = path.resolve('./coverage-html-invalid-chars')
  await rimraf(tempDir)
  await rimraf(reportDir)
  fs.mkdirSync(tempDir, { recursive: true })

  // Remapped coverage whose original sourcemap `sources` included angular:script
  // (and other Windows-illegal filename characters).
  const coverage = {
    'angular:script': {
      path: 'angular:script',
      statementMap: {
        0: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } }
      },
      fnMap: {},
      branchMap: {},
      s: { 0: 1 },
      f: {},
      b: {},
      inputSourceMap: {
        version: 3,
        file: 'generated.js',
        sources: ['angular:script'],
        names: [],
        mappings: 'AAAA',
        sourcesContent: ['console.log(1)\n']
      }
    }
  }
  fs.writeFileSync(path.join(tempDir, 'coverage.json'), JSON.stringify(coverage))

  const nyc = new NYC(await parseArgv(undefined, [
    `--temp-dir=${tempDir}`,
    `--report-dir=${reportDir}`,
    '--reporter=html',
    '--exclude-after-remap=false'
  ]))
  await nyc.report()

  const files = listFiles(reportDir)
  t.ok(files.length > 0, 'html report wrote files')
  t.ok(
    files.every(file => !/[<>:"|?*]/.test(path.relative(reportDir, file))),
    'report paths do not contain Windows-illegal filename characters'
  )
  t.ok(
    files.some(file => path.relative(reportDir, file).includes('angular_script')),
    'sanitized angular:script source is present in the html report'
  )

  await rimraf(tempDir)
  await rimraf(reportDir)
})
