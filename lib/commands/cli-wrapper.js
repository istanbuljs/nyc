'use strict'

module.exports = execute => {
  return argv => {
    execute(argv).catch(error => {
      console.error(error.message)
      process.exit(1)
    })
  }
}
