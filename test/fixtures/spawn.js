#!/usr/bin/env node

var spawn = require('child_process').spawn
spawn(process.execPath, ['child-1.js'], { cwd: __dirname })
spawn(process.execPath, ['child-2.js'], { cwd: __dirname })
