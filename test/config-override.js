'use strict'

const t = require('tap')

const { tempDirSetup, testSuccess } = require('./helpers')

tempDirSetup(t, __filename)

t.test('spawn that does config overriding', t => testSuccess(t, {
  args: [
    '--exclude-after-remap=false',
    '--include=conf-override-root.js',
    process.execPath, 'conf-override-root.js'
  ]
}))
