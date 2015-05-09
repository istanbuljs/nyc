#!/usr/bin/env node

process.env.NYC_CWD = process.cwd()

var NYC = require('../'),
  nyc = new NYC()

nyc.report()
