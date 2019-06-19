'use strict'

const { nycBin, fixturesCLI } = require('./paths')
const spawn = require('./spawn')

const envPath = {
  PATH: process.env.PATH
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

function runNYC ({ args, tempDir, leavePathSep, cwd = fixturesCLI, env = {} }) {
  const runArgs = [nycBin].concat(tempDir ? ['--temp-dir', tempDir] : [], args)
  return spawn(process.execPath, runArgs, {
    cwd: cwd,
    env: Object.assign({}, envPath, env)
  }).then(({ status, stderr, stdout }) => ({
    status,
    stderr: sanitizeString(stderr, cwd, leavePathSep),
    stdout: sanitizeString(stdout, cwd, leavePathSep)
  }))
}

module.exports = runNYC
