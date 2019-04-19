const path = require('path')
const { spawn } = require('child_process')

const nycBin = require.resolve('../../self-coverage/bin/nyc')
const fixturesCLI = path.resolve(__dirname, '../fixtures/cli')

const env = {
  PATH: process.env.PATH
}

function promisifySpawn (exe, args, opts) {
  return new Promise(resolve => {
    const proc = spawn(exe, args, opts)
    const result = {
      stdout: '',
      stderr: ''
    }

    proc.stdout.on('data', chunk => {
      result.stdout += chunk
    })

    proc.stderr.on('data', chunk => {
      result.stderr += chunk
    })

    proc.on('close', code => {
      result.status = code
      resolve(result)
    })
  })
}

function sanitizeString (str, cwd, leavePathSep) {
  /*
   * File paths are different on different systems:
   *   - make everything relative to cwd
   *   - replace full node path with 'node'
   *   - replace all Windows path separators ('\\') with POSIX path separators
   */
  str = str
    .split(cwd).join('.')
    .split(process.execPath).join('node')

  if (!leavePathSep) {
    str = str.replace(/\\/g, '/')
  }

  return str
}

function runNYC ({ args, tempDir, leavePathSep, cwd = fixturesCLI }) {
  const runArgs = [nycBin].concat(tempDir ? ['--temp-dir', tempDir] : [], args)
  return promisifySpawn(process.execPath, runArgs, {
    cwd: cwd,
    env,
    encoding: 'utf8'
  }).then(({ status, stderr, stdout }) => ({
    status,
    stderr: sanitizeString(stderr, cwd, leavePathSep),
    stdout: sanitizeString(stdout, cwd, leavePathSep)
  }))
}

function testSuccess (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 0)
    t.equal(stderr, '')
    t.matchSnapshot(stdout, 'stdout')
  })
}

function testFailure (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 1)
    t.matchSnapshot(stderr, 'stderr')
    t.matchSnapshot(stdout, 'stdout')
  })
}

module.exports = {
  fixturesCLI,
  runNYC,
  testSuccess,
  testFailure
}
