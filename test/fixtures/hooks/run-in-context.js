'use strict'
const path = require('path')
const vm = require('vm')

vm.runInContext(
  '(() => 10)();',
  vm.createContext({}),
  path.resolve(__dirname, 'in-context.js')
)
