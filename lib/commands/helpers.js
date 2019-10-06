'use strict'

const decamelize = require('decamelize')
const schema = require('@istanbuljs/schema')

/* These options still need to be connected to the instrumenter
 * Disabling them for now also avoids the issue with OSX cutting
 * off the error help screen at 8192 characters.
 */
const blockOptions = [
  'coverageVariable',
  'coverageGlobalScope',
  'coverageGlobalScopeFunc'
]

module.exports = {
  setupOptions (yargs, command, cwd) {
    Object.entries(schema.nyc.properties).forEach(([name, setup]) => {
      if (blockOptions.includes(name)) {
        return
      }

      const option = {
        description: setup.description,
        default: setup.default,
        type: setup.type
      }

      if (name === 'cwd') {
        if (command !== null) {
          return
        }

        option.default = cwd
        option.global = true
      }

      if (option.type === 'array') {
        option.type = 'string'
      }

      if ('nycAlias' in setup) {
        option.alias = setup.nycAlias
      }

      const optionName = decamelize(name, '-')
      yargs.option(optionName, option)
      if (!setup.nycCommands.includes(command)) {
        yargs.hide(optionName)
      }
    })
  },
  cliWrapper (execute) {
    return argv => {
      execute(argv).catch(error => {
        console.error(error.message)
        process.exit(1)
      })
    }
  }
}
