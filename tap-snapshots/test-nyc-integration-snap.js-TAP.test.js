/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/nyc-integration-snap.js TAP --include can be used to limit bin to instrumenting specific files > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --exclude should allow default exclude rules to be overridden > stdout 1`] = `
---------------------------------|----------|----------|----------|----------|-------------------|
File                             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------------------------|----------|----------|----------|----------|-------------------|
All files                        |        0 |        0 |        0 |        0 |                   |
 cli                             |        0 |        0 |        0 |        0 |                   |
  args.js                        |        0 |      100 |      100 |        0 |                 1 |
  by-arg2.js                     |        0 |        0 |      100 |        0 |       1,2,3,4,5,7 |
  classes.js                     |        0 |      100 |        0 |        0 |         5,6,11,15 |
  empty.js                       |        0 |        0 |        0 |        0 |                   |
  env.js                         |        0 |      100 |      100 |        0 |                 1 |
  es6.js                         |        0 |      100 |        0 |        0 |... 11,16,17,22,23 |
  external-instrumenter.js       |        0 |        0 |        0 |        0 |                 1 |
  gc.js                          |        0 |      100 |      100 |        0 |               2,3 |
  half-covered-failing.js        |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
  selfspawn-fibonacci.js         |        0 |        0 |        0 |        0 |... 24,25,26,27,28 |
  skip-full.js                   |        0 |      100 |      100 |        0 |               1,2 |
  test.js                        |        0 |        0 |        0 |        0 |                   |
 cli/coverage/lcov-report        |        0 |        0 |        0 |        0 |                   |
  block-navigation.js            |        0 |        0 |        0 |        0 |... 69,70,74,75,79 |
  prettify.js                    |        0 |        0 |        0 |        0 |                 2 |
  sorter.js                      |        0 |        0 |        0 |        0 |... 64,165,166,170 |
 cli/fakebin                     |        0 |      100 |      100 |        0 |                   |
  npm-template.js                |        0 |      100 |      100 |        0 |         2,3,4,7,9 |
 cli/nyc-config-js               |        0 |        0 |      100 |        0 |                   |
  ignore.js                      |        0 |      100 |      100 |        0 |                 1 |
  index.js                       |        0 |        0 |      100 |        0 |    1,3,5,7,8,9,10 |
  nyc.config.js                  |        0 |      100 |      100 |        0 |                 1 |
  nycrc-config.js                |        0 |      100 |      100 |        0 |                 1 |
 cli/nycrc                       |        0 |        0 |      100 |        0 |                   |
  ignore.js                      |        0 |      100 |      100 |        0 |                 1 |
  index.js                       |        0 |        0 |      100 |        0 |    1,3,5,7,8,9,10 |
 cli/subdir/input-dir            |        0 |      100 |      100 |        0 |                   |
  index.js                       |        0 |      100 |      100 |        0 |                 2 |
 cli/subdir/input-dir/exclude-me |        0 |      100 |      100 |        0 |                   |
  index.js                       |        0 |      100 |      100 |        0 |                 2 |
 cli/subdir/input-dir/include-me |        0 |      100 |      100 |        0 |                   |
  exclude-me.js                  |        0 |      100 |      100 |        0 |                 2 |
  include-me.js                  |        0 |      100 |      100 |        0 |                 2 |
---------------------------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP report and check should show coverage check along with report > stdout 1`] = `

`

exports[`test/nyc-integration-snap.js TAP report and check should show coverage check along with report > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (100%)

`

exports[`test/nyc-integration-snap.js TAP report and check should show coverage check along with report > stdout 2`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --ignore-class-method skips methods that match ignored name but still catches those that are not > stdout 1`] = `
---------------------------------|----------|----------|----------|----------|-------------------|
File                             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------------------------|----------|----------|----------|----------|-------------------|
All files                        |     1.61 |        0 |     5.56 |     2.15 |                   |
 cli                             |     2.33 |        0 |     5.56 |     3.64 |                   |
  args.js                        |        0 |      100 |      100 |        0 |                 1 |
  by-arg2.js                     |        0 |        0 |      100 |        0 |       1,2,3,4,5,7 |
  classes.js                     |    66.67 |      100 |       50 |    66.67 |                 6 |
  empty.js                       |        0 |        0 |        0 |        0 |                   |
  env.js                         |        0 |      100 |      100 |        0 |                 1 |
  es6.js                         |        0 |      100 |        0 |        0 |... 11,16,17,22,23 |
  external-instrumenter.js       |        0 |        0 |        0 |        0 |                 1 |
  gc.js                          |        0 |      100 |      100 |        0 |               2,3 |
  half-covered-failing.js        |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
  half-covered.js                |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
  selfspawn-fibonacci.js         |        0 |        0 |        0 |        0 |... 24,25,26,27,28 |
  skip-full.js                   |        0 |      100 |      100 |        0 |               1,2 |
 cli/fakebin                     |        0 |      100 |      100 |        0 |                   |
  npm-template.js                |        0 |      100 |      100 |        0 |         2,3,4,7,9 |
 cli/nyc-config-js               |        0 |        0 |      100 |        0 |                   |
  ignore.js                      |        0 |      100 |      100 |        0 |                 1 |
  index.js                       |        0 |        0 |      100 |        0 |    1,3,5,7,8,9,10 |
  nycrc-config.js                |        0 |      100 |      100 |        0 |                 1 |
 cli/nycrc                       |        0 |        0 |      100 |        0 |                   |
  ignore.js                      |        0 |      100 |      100 |        0 |                 1 |
  index.js                       |        0 |        0 |      100 |        0 |    1,3,5,7,8,9,10 |
 cli/run-npm-test                |        0 |        0 |      100 |        0 |                   |
  half-covered.js                |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
 cli/run-npm-test-recursive      |        0 |        0 |      100 |        0 |                   |
  half-covered.js                |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
 cli/subdir/input-dir            |        0 |      100 |      100 |        0 |                   |
  index.js                       |        0 |      100 |      100 |        0 |                 2 |
 cli/subdir/input-dir/exclude-me |        0 |      100 |      100 |        0 |                   |
  index.js                       |        0 |      100 |      100 |        0 |                 2 |
 cli/subdir/input-dir/include-me |        0 |      100 |      100 |        0 |                   |
  exclude-me.js                  |        0 |      100 |      100 |        0 |                 2 |
  include-me.js                  |        0 |      100 |      100 |        0 |                 2 |
---------------------------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when the expected coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when the expected coverage is below a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when check-coverage command is used rather than flag > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when check-coverage command is used rather than flag > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when check-coverage command is used rather than flag > stdout 2`] = `

`

exports[`test/nyc-integration-snap.js TAP --check-coverage succeeds when the expected coverage is above a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails in any case when the underlying test failed > stderr 1`] = `
ERROR: Coverage for lines (33.33%) does not meet global threshold (49%)

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails in any case when the underlying test failed > stdout 1`] = `
-------------------------|----------|----------|----------|----------|-------------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------|----------|----------|----------|----------|-------------------|
All files                |    33.33 |        0 |      100 |    33.33 |                   |
 half-covered-failing.js |    33.33 |        0 |      100 |    33.33 |           5,6,7,8 |
-------------------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when the expected file coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet threshold (51%) for ./half-covered.js

`

exports[`test/nyc-integration-snap.js TAP --check-coverage fails when the expected file coverage is below a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP passes configuration via environment variables > undefined 1`] = `
{ silent: true,
  cache: false,
  sourceMap: true,
  require: 'make-dir',
  include: 'env.js',
  exclude: 'batman.js',
  extension: '.js',
  cacheDir: '/tmp',
  instrumenter: './lib/instrumenters/istanbul' }
`

exports[`test/nyc-integration-snap.js TAP allows package.json configuration to be overridden with command line args > stdout 1`] = `
TN:
SF:./half-covered.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:6,0
DA:7,0
DA:8,0
LF:6
LH:3
BRDA:5,0,0,0
BRDA:5,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from package.json and nyc.config.js > stdout 1`] = `
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from different module rather than nyc.config.js > stderr 1`] = `
ERROR: Coverage for lines (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for branches (50%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for statements (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for lines (0%) does not meet threshold (100%) for ./nyc.config.js
ERROR: Coverage for statements (0%) does not meet threshold (100%) for ./nyc.config.js
ERROR: Coverage for lines (0%) does not meet threshold (100%) for ./nycrc-config.js
ERROR: Coverage for statements (0%) does not meet threshold (100%) for ./nycrc-config.js

`

exports[`test/nyc-integration-snap.js TAP loads configuration from different module rather than nyc.config.js > stdout 1`] = `
TN:
SF:./ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record
TN:
SF:./nyc.config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record
TN:
SF:./nycrc-config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record

`

exports[`test/nyc-integration-snap.js TAP allows nyc.config.js configuration to be overridden with command line args > stdout 1`] = `
TN:
SF:./ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record
TN:
SF:./nyc.config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record
TN:
SF:./nycrc-config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from package.json and .nycrc > stdout 1`] = `
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from different file rather than .nycrc > stderr 1`] = `
ERROR: Coverage for lines (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for branches (50%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for statements (57.14%) does not meet threshold (100%) for ./index.js

`

exports[`test/nyc-integration-snap.js TAP loads configuration from different file rather than .nycrc > stdout 1`] = `
TN:
SF:./ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from .nycrc.yml > stdout 1`] = `
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP loads configuration from .nycrc.yaml > stdout 1`] = `
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP allows .nycrc configuration to be overridden with command line args > stdout 1`] = `
TN:
SF:./ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:./index.js
FNF:0
FNH:0
DA:1,1
DA:3,1
DA:5,1
DA:7,1
DA:8,0
DA:9,0
DA:10,0
LF:7
LH:4
BRDA:7,0,0,0
BRDA:7,0,1,1
BRF:2
BRH:1
end_of_record

`

exports[`test/nyc-integration-snap.js TAP reports appropriate coverage information for es6 source files > stdout 1`] = `
sup
do not hit
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |     62.5 |      100 |       40 |     62.5 |                   |
 es6.js   |     62.5 |      100 |       40 |     62.5 |          11,16,17 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP hooks provide coverage for requireJS and AMD modules > stdout 1`] = `
-----------|----------|----------|----------|----------|-------------------|
File       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------|----------|----------|----------|----------|-------------------|
All files  |      100 |      100 |      100 |      100 |                   |
 hooks     |      100 |      100 |      100 |      100 |                   |
  index.js |      100 |      100 |      100 |      100 |                   |
 hooks/lib |      100 |      100 |      100 |      100 |                   |
  ipsum.js |      100 |      100 |      100 |      100 |                   |
  lorem.js |      100 |      100 |      100 |      100 |                   |
-----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP does not interpret args intended for instrumented bin > stdout 1`] = `
["node","./args.js","--help","--version"]

`

exports[`test/nyc-integration-snap.js TAP interprets first args after -- as Node.js execArgv > stdout 1`] = `
I’m still running
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 gc.js    |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration-snap.js TAP --show-process-tree displays a tree of spawned processes > stdout 1`] = `
3
------------------------|----------|----------|----------|----------|-------------------|
File                    |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
------------------------|----------|----------|----------|----------|-------------------|
All files               |    90.91 |       70 |      100 |      100 |                   |
 selfspawn-fibonacci.js |    90.91 |       70 |      100 |      100 |           4,25,27 |
------------------------|----------|----------|----------|----------|-------------------|
nyc
└─┬ node ./selfspawn-fibonacci.js 5
  │   100 % Lines
  ├─┬ node ./selfspawn-fibonacci.js 4
  │ │   100 % Lines
  │ ├─┬ node ./selfspawn-fibonacci.js 3
  │ │ │   100 % Lines
  │ │ ├── node ./selfspawn-fibonacci.js 2
  │ │ │     31.58 % Lines
  │ │ └── node ./selfspawn-fibonacci.js 1
  │ │       26.32 % Lines
  │ └── node ./selfspawn-fibonacci.js 2
  │       31.58 % Lines
  └─┬ node ./selfspawn-fibonacci.js 3
    │   100 % Lines
    ├── node ./selfspawn-fibonacci.js 2
    │     31.58 % Lines
    └── node ./selfspawn-fibonacci.js 1
          26.32 % Lines


`
