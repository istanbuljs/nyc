'use strict'

const cp = require('child_process')

function spawn (exe, args, opts) {
  return new Promise((resolve, reject) => {
    const proc = cp.spawn(exe, args, opts)
    const stdout = []
    const stderr = []

    proc.stdout.on('data', buf => stdout.push(buf))
    proc.stderr.on('data', buf => stderr.push(buf))

    proc.on('error', reject)
    proc.on('close', status => {
      resolve({
        status,
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString()
      })
    })
  })
}

module.exports = spawn
