'use strict';

/* eslint "node/no-deprecated-api": 0 */

const {promisify} = require('util');

// Reset global state modified by nyc in non-integration tests.
const extensions = {...require.extensions};

const glob = promisify(require('glob'));
const rimraf = promisify(require('rimraf'));

module.exports = async function () {
  // Nuke any temporary files created during test runs.
  const files = await glob('test/**/*/{.nyc_output,.cache}');
  await Promise.all(files.map(f => rimraf(f)));

  // Reset Node's require cache.
  Object.keys(require.cache).forEach(key => {
    if (!key.includes('node_modules')) {
      delete require.cache[key];
    }
  });

  // Reset any custom loaders for extensions, disabling the stack maintained
  // by append-transform.
  Object.keys(require.extensions).forEach(key => {
    delete require.extensions[key];
    if (extensions[key]) {
      require.extensions[key] = extensions[key];
    }
  });

  // Reset any NYC-specific environment variables that might have been set.
  delete process.env.NYC_CWD;
};
