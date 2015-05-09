#!/usr/bin/env node

var NYC = require('../'),
  nyc = new NYC({
    cwd: process.cwd()
  })

nyc.report()
