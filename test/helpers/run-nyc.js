'use strict'

const { nycBin, fixturesCLI } = require('./paths')
const spawn = require('./spawn')

const envPath = {
  PATH: process.env.PATH
}

// Work around a Windows issue with `APPDATA`,
// https://github.com/istanbuljs/nyc/issues/1248
if ('APPDATA' in process.env) {
  envPath.APPDATA = process.env.APPDATA
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

async function runNYC ({ args, tempDir, leavePathSep, cwd = fixturesCLI, env = {} }) {
  const runArgs = [nycBin].concat(tempDir ? ['--temp-dir', tempDir] : [], args)
  const { status, stderr, stdout } = await spawn(process.execPath, runArgs, {
    cwd: cwd,
    env: {
      ...envPath,
      ...env
    }
  })

  return {
    status,
    originalText: {
      stderr,
      stdout
    },
    stderr: sanitizeString(stderr, cwd, leavePathSep),
    stdout: sanitizeString(stdout, cwd, leavePathSep)
  }
}

module.exports = runNYC
