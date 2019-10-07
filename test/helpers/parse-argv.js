'use strict'

const configUtil = require('../../self-coverage/lib/config-util')

async function parseArgv (cwd, argv) {
  const { yargs } = await configUtil(cwd)

  return yargs.parse(argv)
}

module.exports = parseArgv
