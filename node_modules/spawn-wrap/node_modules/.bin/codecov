#!/usr/bin/env node
var sendToCodeCov = require('../lib/sendToCodeCov.io');

process.stdin.resume();
process.stdin.setEncoding('utf8');

var input = '';

process.stdin.on('data', function(chunk) {
    input += chunk;
});

process.stdin.on('end', function() {
    sendToCodeCov(input, function(err) {
      if (err) {
        console.log("error sending to codecov.io: ", err, err.stack);
        if (/non-success response/.test(err.message)){
          console.log("detail: ", err.detail);
        }
        throw err;
      }
    });
});
