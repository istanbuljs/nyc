/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/nyc-integration.js TAP --all includes files with both .map files and inline source-maps > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |    44.44 |      100 |    33.33 |    44.44 |                   |
 s1.js    |       80 |      100 |       50 |       80 |                 7 |
 s2.js    |        0 |      100 |        0 |        0 |           1,2,4,6 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --all uses source-maps to exclude original sources from reports > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |      100 |        0 |        0 |                   |
 s2.js    |        0 |      100 |        0 |        0 |           1,2,4,6 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --check-coverage fails in any case when the underlying test failed > stderr 1`] = `
ERROR: Coverage for lines (33.33%) does not meet global threshold (49%)

`

exports[`test/nyc-integration.js TAP --check-coverage fails in any case when the underlying test failed > stdout 1`] = `
-------------------------|----------|----------|----------|----------|-------------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------|----------|----------|----------|----------|-------------------|
All files                |    33.33 |        0 |      100 |    33.33 |                   |
 half-covered-failing.js |    33.33 |        0 |      100 |    33.33 |           5,6,7,8 |
-------------------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected coverage is below a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected file coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet threshold (51%) for ./half-covered.js

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected file coverage is below a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --check-coverage succeeds when the expected coverage is above a threshold > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --exclude should allow default exclude rules to be overridden > stdout 1`] = `
---------------------------------|----------|----------|----------|----------|-------------------|
File                             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------------------------|----------|----------|----------|----------|-------------------|
All files                        |        0 |        0 |        0 |        0 |                   |
 cli                             |        0 |        0 |        0 |        0 |                   |
  args.js                        |        0 |      100 |      100 |        0 |                 1 |
  by-arg2.js                     |        0 |        0 |      100 |        0 |       1,2,3,4,5,7 |
  classes.js                     |        0 |      100 |        0 |        0 |         5,6,11,15 |
  conf-override-module.js        |        0 |      100 |      100 |        0 |               1,2 |
  conf-override-root.js          |        0 |        0 |      100 |        0 |   1,2,4,5,6,22,23 |
  empty.js                       |        0 |        0 |        0 |        0 |                   |
  env.js                         |        0 |      100 |      100 |        0 |                 1 |
  es6.js                         |        0 |      100 |        0 |        0 |... 11,16,17,22,23 |
  external-instrumenter.js       |        0 |        0 |        0 |        0 |                 1 |
  gc.js                          |        0 |      100 |      100 |        0 |               2,3 |
  half-covered-failing.js        |        0 |        0 |      100 |        0 |       1,3,5,6,7,8 |
  selfspawn-fibonacci.js         |        0 |        0 |        0 |        0 |... 24,25,26,27,28 |
  skip-full.js                   |        0 |      100 |      100 |        0 |               1,2 |
  test.js                        |        0 |        0 |        0 |        0 |                   |
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

exports[`test/nyc-integration.js TAP --ignore-class-method skips methods that match ignored name but still catches those that are not > stdout 1`] = `
---------------------------------|----------|----------|----------|----------|-------------------|
File                             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------------------------|----------|----------|----------|----------|-------------------|
All files                        |      1.5 |        0 |     5.56 |     1.96 |                   |
 cli                             |     2.11 |        0 |     5.56 |     3.13 |                   |
  args.js                        |        0 |      100 |      100 |        0 |                 1 |
  by-arg2.js                     |        0 |        0 |      100 |        0 |       1,2,3,4,5,7 |
  classes.js                     |    66.67 |      100 |       50 |    66.67 |                 6 |
  conf-override-module.js        |        0 |      100 |      100 |        0 |               1,2 |
  conf-override-root.js          |        0 |        0 |      100 |        0 |   1,2,4,5,6,22,23 |
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

exports[`test/nyc-integration.js TAP --include can be used to limit bin to instrumenting specific files > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP --show-process-tree displays a tree of spawned processes > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP allows .nycrc configuration to be overridden with command line args > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP allows alternative high and low watermarks to be configured > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
[32;1mAll files       [0m |[32;1m       50[0m |[33;1m       50[0m |[32;1m      100[0m |[31;1m       50[0m |[31;1m                  [0m |
[32;1m half-covered.js[0m |[32;1m       50[0m |[33;1m       50[0m |[32;1m      100[0m |[31;1m       50[0m |[31;1m             6,7,8[0m |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP allows an alternative cache folder to be specified > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP allows nyc.config.js configuration to be overridden with command line args > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP allows package.json configuration to be overridden with command line args > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP allows reserved word when es-modules is disabled > stdout 1`] = `
---------------|----------|----------|----------|----------|-------------------|
File           |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------|----------|----------|----------|----------|-------------------|
All files      |      100 |      100 |      100 |      100 |                   |
 not-strict.js |      100 |      100 |      100 |      100 |                   |
---------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP appropriately instruments file with corresponding .map file > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |       80 |      100 |       50 |       80 |                   |
 s1.js    |       80 |      100 |       50 |       80 |                 7 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP appropriately instruments file with inline source-map > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 s2.js    |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP can run "npm test" which directly invokes a test file > stdout 1`] = `

> @ test .
> node ./half-covered.js

-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP can run "npm test" which indirectly invokes a test file > stdout 1`] = `

> @ test .
> npm run test:deeper


> @ test:deeper .
> npm run test:even-deeper


> @ test:even-deeper .
> node ./half-covered.js

-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stdout 2`] = `

`

exports[`test/nyc-integration.js TAP does not create .cache folder if cache is "false" > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP does not interpret args intended for instrumented bin > undefined 1`] = `
[ '--help', '--version' ]
`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stderr 1`] = `
ERROR: Coverage for lines (0%) does not meet threshold (90%) for ./node_modules/@istanbuljs/fake-module-1/index.js

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stderr 2`] = `
ERROR: Coverage for lines (0%) does not meet threshold (90%) for ./node_modules/@istanbuljs/fake-module-1/index.js

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stderr 3`] = `
ERROR: Coverage for lines (0%) does not meet threshold (90%) for ./node_modules/@istanbuljs/fake-module-1/index.js

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |      100 |      100 |        0 |                   |
 index.js |        0 |      100 |      100 |        0 |                 1 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 2`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |      100 |      100 |        0 |                   |
 index.js |        0 |      100 |      100 |        0 |                 1 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 3`] = `

`

exports[`test/nyc-integration.js TAP extracts coverage headers from unexecuted files > undefined 1`] = `
[
  [
    "all",
    true
  ],
  [
    "instrument",
    false
  ],
  [
    "instrumenter",
    "./lib/instrumenters/noop"
  ],
  [
    "silent",
    true
  ],
  [
    "sourceMap",
    false
  ]
]
`

exports[`test/nyc-integration.js TAP forbids reserved word when es-modules is not disabled > stderr 1`] = `
Failed to instrument ./not-strict.js

`

exports[`test/nyc-integration.js TAP forbids reserved word when es-modules is not disabled > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |        0 |        0 |        0 |                   |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP handles --clean / --no-clean properly > stdout 1`] = `
1
------------|----------|----------|----------|----------|-------------------|
File        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
------------|----------|----------|----------|----------|-------------------|
All files   |       50 |       25 |      100 |       50 |                   |
 by-arg2.js |       50 |       25 |      100 |       50 |             4,5,7 |
------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP handles --clean / --no-clean properly > stdout 2`] = `
2
------------|----------|----------|----------|----------|-------------------|
File        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
------------|----------|----------|----------|----------|-------------------|
All files   |    83.33 |       75 |      100 |    83.33 |                   |
 by-arg2.js |    83.33 |       75 |      100 |    83.33 |                 7 |
------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP hooks provide coverage for requireJS and AMD modules > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 ipsum.js |      100 |      100 |      100 |      100 |                   |
 lorem.js |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP instrument with exclude-node-modules=false > stdout 1`] = `
var cov_2n0o5mis6y=function(){var path="./node_modules/@istanbuljs/fake-module-1/index.js";var hash="438e459a1ff94bd44776e0b7a9892265cb48564e";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"./node_modules/@istanbuljs/fake-module-1/index.js",statementMap:{"0":{start:{line:1,column:0},end:{line:1,column:27}}},fnMap:{},branchMap:{},s:{"0":0},f:{},b:{},_coverageSchema:"43e27e138ebf9cfc5966b082cf9a028302ed4184",hash:"438e459a1ff94bd44776e0b7a9892265cb48564e"};var coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}return coverage[path]=coverageData;}();cov_2n0o5mis6y.s[0]++;console.log('hello world');

`

exports[`test/nyc-integration.js TAP interprets first args after -- as Node.js execArgv > stdout 1`] = `
I’m still running
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 gc.js    |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP loads configuration from .nycrc.yaml > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP loads configuration from .nycrc.yml > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP loads configuration from different file rather than .nycrc > stderr 1`] = `
ERROR: Coverage for lines (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for branches (50%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for statements (57.14%) does not meet threshold (100%) for ./index.js

`

exports[`test/nyc-integration.js TAP loads configuration from different file rather than .nycrc > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP loads configuration from different module rather than nyc.config.js > stderr 1`] = `
ERROR: Coverage for lines (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for branches (50%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for statements (57.14%) does not meet threshold (100%) for ./index.js
ERROR: Coverage for lines (0%) does not meet threshold (100%) for ./nyc.config.js
ERROR: Coverage for statements (0%) does not meet threshold (100%) for ./nyc.config.js
ERROR: Coverage for lines (0%) does not meet threshold (100%) for ./nycrc-config.js
ERROR: Coverage for statements (0%) does not meet threshold (100%) for ./nycrc-config.js

`

exports[`test/nyc-integration.js TAP loads configuration from different module rather than nyc.config.js > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP loads configuration from package.json and .nycrc > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP loads configuration from package.json and nyc.config.js > stdout 1`] = `
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

exports[`test/nyc-integration.js TAP nyc --help > stdout 1`] = `
nyc.js [command] [options]
nyc.js [options] [bin-to-instrument]

Commands:
  nyc.js check-coverage                     check whether coverage is within
                                            thresholds provided
  nyc.js instrument <input> [output]        instruments a file or a directory
                                            tree and writes the instrumented
                                            code to the desired output location
  nyc.js report                             run coverage report for .nyc_output
  nyc.js merge <input-directory>            merge istanbul format coverage
  [output-file]                             output in a given folder

Options:
  --reporter, -r              coverage reporter(s) to use      [default: "text"]
  --report-dir                directory to output coverage reports in
                                                           [default: "coverage"]
  --silent, -s                don't output a report after tests finish running
                                                      [boolean] [default: false]
  --all, -a                   whether or not to instrument all files of the
                              project (not just the ones touched by your test
                              suite)                  [boolean] [default: false]
  --exclude, -x               a list of specific files and directories that
                              should be excluded from coverage, glob patterns
                              are supported, node_modules is always excluded
                                                                       [default:
  ["coverage/**","packages/*/test/**","test/**","test{,-*}.js","**/*{.,-}test.js
        ","**/__tests__/**","**/{ava,babel,jest,nyc,rollup,webpack}.config.js"]]
  --exclude-after-remap       should exclude logic be performed after the
                              source-map remaps filenames?
                                                       [boolean] [default: true]
  --exclude-node-modules      whether or not to exclude all node_module folders
                              (i.e. **/node_modules/**) by default
                                                       [boolean] [default: true]
  --include, -n               a list of specific files that should be covered,
                              glob patterns are supported          [default: []]
  --cwd                       working directory used when resolving paths
                                 [default: "."]
  --require, -i               a list of additional modules that nyc should
                              attempt to require in its subprocess, e.g.,
                              @babel/register, @babel/polyfill     [default: []]
  --eager                     instantiate the instrumenter at startup (see
                              https://git.io/vMKZ9)   [boolean] [default: false]
  --cache, -c                 cache instrumentation results for improved
                              performance              [boolean] [default: true]
  --cache-dir                 explicitly set location for instrumentation cache
  --babel-cache               cache babel transpilation results for improved
                              performance             [boolean] [default: false]
  --es-modules                tell the instrumenter to treat files as ES Modules
                                                       [boolean] [default: true]
  --extension, -e             a list of extensions that nyc should handle in
                              addition to .js
                                  [default: [".cjs",".mjs",".ts",".tsx",".jsx"]]
  --check-coverage            check whether coverage is within thresholds
                              provided                [boolean] [default: false]
  --branches                  what % of branches must be covered?   [default: 0]
  --functions                 what % of functions must be covered?  [default: 0]
  --lines                     what % of lines must be covered?     [default: 90]
  --statements                what % of statements must be covered? [default: 0]
  --source-map                should nyc detect and handle source maps?
                                                       [boolean] [default: true]
  --per-file                  check thresholds per file
                                                      [boolean] [default: false]
  --produce-source-map        should nyc's instrumenter produce source maps?
                                                      [boolean] [default: false]
  --compact                   should the output be compacted?
                                                       [boolean] [default: true]
  --preserve-comments         should comments be preserved in the output?
                                                       [boolean] [default: true]
  --instrument                should nyc handle instrumentation?
                                                       [boolean] [default: true]
  --hook-require              should nyc wrap require? [boolean] [default: true]
  --hook-run-in-context       should nyc wrap vm.runInContext?
                                                      [boolean] [default: false]
  --hook-run-in-this-context  should nyc wrap vm.runInThisContext?
                                                      [boolean] [default: false]
  --show-process-tree         display the tree of spawned processes
                                                      [boolean] [default: false]
  --clean                     should the .nyc_output folder be cleaned before
                              executing tests          [boolean] [default: true]
  --nycrc-path                specify a different .nycrc path[default: ".nycrc"]
  --temp-dir, -t              directory to output raw coverage information to
                                                      [default: "./.nyc_output"]
  --skip-empty                don't show empty files (no lines of code) in
                              report                  [boolean] [default: false]
  --skip-full                 don't show files with 100% statement, branch, and
                              function coverage       [boolean] [default: false]
  -h, --help                  Show help                                [boolean]
  --version                   Show version number                      [boolean]

Examples:
  nyc.js npm test                           instrument your tests with coverage
  nyc.js --require @babel/register npm      instrument your tests with coverage
  test                                      and transpile with Babel
  nyc.js report --reporter=text-lcov        output lcov report after running
                                            your tests

visit https://git.io/vHysA for list of available reporters

`

exports[`test/nyc-integration.js TAP nyc displays help to stderr when it doesn't know what to do > stderr 1`] = `
nyc.js [command] [options]
nyc.js [options] [bin-to-instrument]

Commands:
  nyc.js check-coverage                     check whether coverage is within
                                            thresholds provided
  nyc.js instrument <input> [output]        instruments a file or a directory
                                            tree and writes the instrumented
                                            code to the desired output location
  nyc.js report                             run coverage report for .nyc_output
  nyc.js merge <input-directory>            merge istanbul format coverage
  [output-file]                             output in a given folder

Options:
  --reporter, -r              coverage reporter(s) to use      [default: "text"]
  --report-dir                directory to output coverage reports in
                                                           [default: "coverage"]
  --silent, -s                don't output a report after tests finish running
                                                      [boolean] [default: false]
  --all, -a                   whether or not to instrument all files of the
                              project (not just the ones touched by your test
                              suite)                  [boolean] [default: false]
  --exclude, -x               a list of specific files and directories that
                              should be excluded from coverage, glob patterns
                              are supported, node_modules is always excluded
                                                                       [default:
  ["coverage/**","packages/*/test/**","test/**","test{,-*}.js","**/*{.,-}test.js
        ","**/__tests__/**","**/{ava,babel,jest,nyc,rollup,webpack}.config.js"]]
  --exclude-after-remap       should exclude logic be performed after the
                              source-map remaps filenames?
                                                       [boolean] [default: true]
  --exclude-node-modules      whether or not to exclude all node_module folders
                              (i.e. **/node_modules/**) by default
                                                       [boolean] [default: true]
  --include, -n               a list of specific files that should be covered,
                              glob patterns are supported          [default: []]
  --cwd                       working directory used when resolving paths
                                 [default: "."]
  --require, -i               a list of additional modules that nyc should
                              attempt to require in its subprocess, e.g.,
                              @babel/register, @babel/polyfill     [default: []]
  --eager                     instantiate the instrumenter at startup (see
                              https://git.io/vMKZ9)   [boolean] [default: false]
  --cache, -c                 cache instrumentation results for improved
                              performance              [boolean] [default: true]
  --cache-dir                 explicitly set location for instrumentation cache
  --babel-cache               cache babel transpilation results for improved
                              performance             [boolean] [default: false]
  --es-modules                tell the instrumenter to treat files as ES Modules
                                                       [boolean] [default: true]
  --extension, -e             a list of extensions that nyc should handle in
                              addition to .js
                                  [default: [".cjs",".mjs",".ts",".tsx",".jsx"]]
  --check-coverage            check whether coverage is within thresholds
                              provided                [boolean] [default: false]
  --branches                  what % of branches must be covered?   [default: 0]
  --functions                 what % of functions must be covered?  [default: 0]
  --lines                     what % of lines must be covered?     [default: 90]
  --statements                what % of statements must be covered? [default: 0]
  --source-map                should nyc detect and handle source maps?
                                                       [boolean] [default: true]
  --per-file                  check thresholds per file
                                                      [boolean] [default: false]
  --produce-source-map        should nyc's instrumenter produce source maps?
                                                      [boolean] [default: false]
  --compact                   should the output be compacted?
                                                       [boolean] [default: true]
  --preserve-comments         should comments be preserved in the output?
                                                       [boolean] [default: true]
  --instrument                should nyc handle instrumentation?
                                                       [boolean] [default: true]
  --hook-require              should nyc wrap require? [boolean] [default: true]
  --hook-run-in-context       should nyc wrap vm.runInContext?
                                                      [boolean] [default: false]
  --hook-run-in-this-context  should nyc wrap vm.runInThisContext?
                                                      [boolean] [default: false]
  --show-process-tree         display the tree of spawned processes
                                                      [boolean] [default: false]
  --clean                     should the .nyc_output folder be cleaned before
                              executing tests          [boolean] [default: true]
  --nycrc-path                specify a different .nycrc path[default: ".nycrc"]
  --temp-dir, -t              directory to output raw coverage information to
                                                      [default: "./.nyc_output"]
  --skip-empty                don't show empty files (no lines of code) in
                              report                  [boolean] [default: false]
  --skip-full                 don't show files with 100% statement, branch, and
                              function coverage       [boolean] [default: false]
  -h, --help                  Show help                                [boolean]
  --version                   Show version number                      [boolean]

Examples:
  nyc.js npm test                           instrument your tests with coverage
  nyc.js --require @babel/register npm      instrument your tests with coverage
  test                                      and transpile with Babel
  nyc.js report --reporter=text-lcov        output lcov report after running
                                            your tests

visit https://git.io/vHysA for list of available reporters

`

exports[`test/nyc-integration.js TAP nyc displays help to stderr when it doesn't know what to do > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP nyc instrument a directory of files > stdout 1`] = `
var cov_226g64md1a=function(){var path="./index.js";var hash="208202ca9f633dc22f0f76b00cfee03bde297234";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"./index.js",statementMap:{"0":{start:{line:1,column:0},end:{line:1,column:19}},"1":{start:{line:3,column:8},end:{line:3,column:9}},"2":{start:{line:5,column:0},end:{line:5,column:3}},"3":{start:{line:7,column:0},end:{line:11,column:1}},"4":{start:{line:8,column:2},end:{line:8,column:6}},"5":{start:{line:9,column:2},end:{line:9,column:6}},"6":{start:{line:10,column:2},end:{line:10,column:6}}},fnMap:{},branchMap:{"0":{loc:{start:{line:7,column:0},end:{line:11,column:1}},type:"if",locations:[{start:{line:7,column:0},end:{line:11,column:1}},{start:{line:7,column:0},end:{line:11,column:1}}],line:7}},s:{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0},f:{},b:{"0":[0,0]},_coverageSchema:"43e27e138ebf9cfc5966b082cf9a028302ed4184",hash:"208202ca9f633dc22f0f76b00cfee03bde297234"};var coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}return coverage[path]=coverageData;}();cov_226g64md1a.s[0]++;require('./ignore');var a=(cov_226g64md1a.s[1]++,0);cov_226g64md1a.s[2]++;a++;cov_226g64md1a.s[3]++;if(a===0){cov_226g64md1a.b[0][0]++;cov_226g64md1a.s[4]++;a++;cov_226g64md1a.s[5]++;a--;cov_226g64md1a.s[6]++;a++;}else{cov_226g64md1a.b[0][1]++;}

`

exports[`test/nyc-integration.js TAP nyc instrument fails on file with \`package\` keyword when es-modules is enabled > stderr 1`] = `
Failed to instrument ./not-strict.js

`

exports[`test/nyc-integration.js TAP nyc instrument fails on file with \`package\` keyword when es-modules is enabled > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP nyc instrument on file with \`package\` keyword when es-modules is disabled > stdout 1`] = `
var cov_1ys3qh1gyl=function(){var path="./not-strict.js";var hash="90f195badac1a0b8242dadc78cf641b48b3e172c";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"./not-strict.js",statementMap:{"0":{start:{line:2,column:1},end:{line:2,column:10}},"1":{start:{line:5,column:0},end:{line:5,column:10}}},fnMap:{"0":{name:"package",decl:{start:{line:1,column:9},end:{line:1,column:16}},loc:{start:{line:1,column:19},end:{line:3,column:1}},line:1}},branchMap:{},s:{"0":0,"1":0},f:{"0":0},b:{},_coverageSchema:"43e27e138ebf9cfc5966b082cf9a028302ed4184",hash:"90f195badac1a0b8242dadc78cf641b48b3e172c"};var coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}return coverage[path]=coverageData;}();function package(){cov_1ys3qh1gyl.f[0]++;cov_1ys3qh1gyl.s[0]++;return 1;}cov_1ys3qh1gyl.s[1]++;package();

`

exports[`test/nyc-integration.js TAP nyc instrument returns unmodified source if there is no transform > stdout 1`] = `
var a = 0

a++

if (a === 0) {
  a++;
  a--;
  a++;
}


`

exports[`test/nyc-integration.js TAP nyc instrument single file to console > stdout 1`] = `
var cov_6fpw9b013=function(){var path="./half-covered.js";var hash="28db5afcb38f40f37a8eedd33c935a767fc38f49";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"./half-covered.js",statementMap:{"0":{start:{line:1,column:8},end:{line:1,column:9}},"1":{start:{line:3,column:0},end:{line:3,column:3}},"2":{start:{line:5,column:0},end:{line:9,column:1}},"3":{start:{line:6,column:2},end:{line:6,column:6}},"4":{start:{line:7,column:2},end:{line:7,column:6}},"5":{start:{line:8,column:2},end:{line:8,column:6}}},fnMap:{},branchMap:{"0":{loc:{start:{line:5,column:0},end:{line:9,column:1}},type:"if",locations:[{start:{line:5,column:0},end:{line:9,column:1}},{start:{line:5,column:0},end:{line:9,column:1}}],line:5}},s:{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0},f:{},b:{"0":[0,0]},_coverageSchema:"43e27e138ebf9cfc5966b082cf9a028302ed4184",hash:"28db5afcb38f40f37a8eedd33c935a767fc38f49"};var coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}return coverage[path]=coverageData;}();var a=(cov_6fpw9b013.s[0]++,0);cov_6fpw9b013.s[1]++;a++;cov_6fpw9b013.s[2]++;if(a===0){cov_6fpw9b013.b[0][0]++;cov_6fpw9b013.s[3]++;a++;cov_6fpw9b013.s[4]++;a--;cov_6fpw9b013.s[5]++;a++;}else{cov_6fpw9b013.b[0][1]++;}

`

exports[`test/nyc-integration.js TAP passes configuration via environment variables > undefined 1`] = `
[
  [
    "cache",
    false
  ],
  [
    "cacheDir",
    "/tmp"
  ],
  [
    "exclude",
    "batman.js"
  ],
  [
    "extension",
    ".js"
  ],
  [
    "include",
    "env.js"
  ],
  [
    "instrumenter",
    "./lib/instrumenters/istanbul"
  ],
  [
    "require",
    "make-dir"
  ],
  [
    "silent",
    true
  ],
  [
    "sourceMap",
    true
  ]
]
`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (100%)

`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stdout 2`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |       50 |       50 |      100 |       50 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP reports appropriate coverage information for es6 source files > stdout 1`] = `
sup
do not hit
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |     62.5 |      100 |       40 |     62.5 |                   |
 es6.js   |     62.5 |      100 |       40 |     62.5 |          11,16,17 |
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP setting instrument to "false" configures noop instrumenter > undefined 1`] = `
[
  [
    "instrument",
    false
  ],
  [
    "instrumenter",
    "./lib/instrumenters/noop"
  ],
  [
    "silent",
    true
  ],
  [
    "sourceMap",
    false
  ]
]
`

exports[`test/nyc-integration.js TAP skip-empty does not display 0-line files > stdout 1`] = `
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
----------|----------|----------|----------|----------|-------------------|

`

exports[`test/nyc-integration.js TAP skip-full does not display files with 100% statement, branch, and function coverage > stdout 1`] = `
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |     62.5 |       50 |      100 |     62.5 |                   |
 half-covered.js |       50 |       50 |      100 |       50 |             6,7,8 |
-----------------|----------|----------|----------|----------|-------------------|

`
