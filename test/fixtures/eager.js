#!/usr/bin/env node
'use strict'

const lib = require.resolve('local-istanbul-lib-instrument')
console.log(Object.keys(require.cache).filter(s => s === lib).length)
