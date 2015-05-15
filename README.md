# nyc

[![Build Status](https://travis-ci.org/bcoe/nyc.png)](https://travis-ci.org/bcoe/nyc)
[![Coverage Status](https://coveralls.io/repos/bcoe/nyc/badge.svg?branch=)](https://coveralls.io/r/bcoe/nyc?branch=)
[![NPM version](https://img.shields.io/npm/v/nyc.svg)](https://www.npmjs.com/package/nyc)

a code coverage tool built on [istanbul](https://www.npmjs.com/package/istanbul)
that works well for applications that spawn child processes.

## Usage

Run your tests with the test coverage collector:

```json
{
  "script": {
    "test": "nyc tap ./test/*.js",
  }
}
```

Now run the reporter afterwords to view your coverage statistics:

```bash
nyc-report

--------------------|-----------|-----------|-----------|-----------|
File                |   % Stmts |% Branches |   % Funcs |   % Lines |
--------------------|-----------|-----------|-----------|-----------|
   ./               |     85.96 |        50 |        75 |     92.31 |
      index.js      |     85.96 |        50 |        75 |     92.31 |
   ./test/          |     98.08 |        50 |        95 |     98.04 |
      nyc-test.js   |     98.08 |        50 |        95 |     98.04 |
   ./test/fixtures/ |       100 |       100 |       100 |       100 |
      sigint.js     |       100 |       100 |       100 |       100 |
      sigterm.js    |       100 |       100 |       100 |       100 |
--------------------|-----------|-----------|-----------|-----------|
All files           |     91.89 |        50 |     86.11 |     95.24 |
--------------------|-----------|-----------|-----------|-----------|
```

or use any reporter supported by istanbul:

```bash
nyc-report --reporter=lcov
```

or, toss a script in your package.json:

```bash
{
  "script": {
    "test": "nyc-report --reporter=text-lcov | coveralls",
  }
}
```
