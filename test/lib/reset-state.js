// reset global state maintained by nyc for non-integration tests.
const extensions = Object.assign({}, require.extensions)
const glob = require('glob')
const rimraf = require('rimraf')

module.exports = function () {
  // nuke any temporary files created during test runs.
  glob.sync('test/**/*/{.nyc_output,.cache}').forEach(function (path) {
    rimraf.sync(path)
  })

  // reset the Node's require cache.
  Object.keys(require.cache).forEach((key) => {
    if (key.indexOf('node_modules') === -1) delete require.cache[key]
  })
  // reset any custom loaders for extensions, disabling the stack maintained
  // by append-transform.
  Object.keys(require.extensions).forEach((key) => {
    delete require.extensions[key]
    if (extensions[key]) require.extensions[key] = extensions[key]
  })
  // reset any environment variables that might have been set.
  delete process.env.NYC_CWD
}