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

function runNYC ({ args, tempDir, cwd = fixturesCLI }) {
  const runArgs = [nycBin].concat(tempDir ? ['--temp-dir', tempDir] : [], args)
  return promisifySpawn(process.execPath, runArgs, {
    cwd: cwd,
    env,
    encoding: 'utf8'
  }).then(({ status, stderr, stdout }) => ({
    status,
    stderr: stderr.split(cwd).join('.').split(process.execPath).join('node'),
    stdout: stdout.split(cwd).join('.').split(process.execPath).join('node')
  }))
}

module.exports = {
  runNYC,
  fixturesCLI
}
