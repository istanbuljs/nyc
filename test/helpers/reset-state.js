'use strict'

const { promisify } = require('util')

// reset global state modified by nyc in non-integration tests.
const extensions = Object.assign({}, require.extensions) // eslint-disable-line

const glob = promisify(require('glob'))
const rimraf = promisify(require('rimraf'))

module.exports = async function () {
  // nuke any temporary files created during test runs.
  const files = await glob('test/**/*/{.nyc_output,.cache}')
  await Promise.all(files.map(f => rimraf(f)))

  // reset Node's require cache.
  Object.keys(require.cache).forEach((key) => {
    if (key.indexOf('node_modules') === -1) delete require.cache[key]
  })

  // reset any custom loaders for extensions, disabling the stack maintained
  // by append-transform.
  Object.keys(require.extensions).forEach((key) => { // eslint-disable-line
    delete require.extensions[key] // eslint-disable-line
    if (extensions[key]) {
      require.extensions[key] = extensions[key] // eslint-disable-line
    }
  })

  // reset any NYC-specific environment variables that might have been set.
  delete process.env.NYC_CWD
}
