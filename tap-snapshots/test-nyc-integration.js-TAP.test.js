/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/nyc-integration.js TAP --all does not fail on ERR_REQUIRE_ESM > stdout 1`] = `
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |   33.33 |      100 |       0 |   33.33 |                   
 extra.mjs  |       0 |      100 |       0 |       0 | 2                 
 index.js   |       0 |      100 |       0 |       0 | 2                 
 script.cjs |     100 |      100 |     100 |     100 |                   
------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --all includes files with both .map files and inline source-maps > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   44.44 |      100 |   33.33 |   44.44 |                   
 s1.js    |      80 |      100 |      50 |      80 | 7                 
 s2.js    |       0 |      100 |       0 |       0 | 1-6               
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --all instruments unknown extensions as js > stdout 1`] = `
run
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |   11.11 |      100 |       0 |   11.11 |                   
 check-instrumented.es6 |       0 |      100 |       0 |       0 | 5-6               
 check-instrumented.js  |       0 |      100 |       0 |       0 | 5-6               
 not-loaded.es6         |       0 |      100 |     100 |       0 | 1-2               
 not-loaded.js          |       0 |      100 |     100 |       0 | 1-2               
 run.js                 |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --all uses source-maps to exclude original sources from reports > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |      100 |       0 |       0 |                   
 s2.js    |       0 |      100 |       0 |       0 | 1-6               
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --check-coverage fails in any case when the underlying test failed > stderr 1`] = `
ERROR: Coverage for lines (33.33%) does not meet global threshold (49%)

`

exports[`test/nyc-integration.js TAP --check-coverage fails in any case when the underlying test failed > stdout 1`] = `
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |   33.33 |        0 |     100 |   33.33 |                   
 half-covered-failing.js |   33.33 |        0 |     100 |   33.33 | 5-8               
-------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected coverage is below a threshold > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected file coverage is below a threshold > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet threshold (51%) for ./half-covered.js

`

exports[`test/nyc-integration.js TAP --check-coverage fails when the expected file coverage is below a threshold > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --check-coverage succeeds when the expected coverage is above a threshold > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --exclude should allow default exclude rules to be overridden > stdout 1`] = `
---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |       0 |        0 |       0 |       0 |                   
 cli                             |       0 |        0 |       0 |       0 |                   
  args.js                        |       0 |      100 |     100 |       0 | 1                 
  by-arg2.js                     |       0 |        0 |     100 |       0 | 1-7               
  classes.js                     |       0 |      100 |       0 |       0 | 5-15              
  conf-override-module.js        |       0 |      100 |     100 |       0 | 1-2               
  conf-override-root.js          |       0 |        0 |     100 |       0 | 1-23              
  empty.js                       |       0 |        0 |       0 |       0 |                   
  env.js                         |       0 |      100 |     100 |       0 | 1                 
  es6.js                         |       0 |      100 |       0 |       0 | 5-23              
  external-instrumenter.js       |       0 |        0 |       0 |       0 | 1                 
  gc.js                          |       0 |      100 |     100 |       0 | 2-3               
  half-covered-failing.js        |       0 |        0 |     100 |       0 | 1-8               
  selfspawn-fibonacci.js         |       0 |        0 |       0 |       0 | 2-30              
  skip-full.js                   |       0 |      100 |     100 |       0 | 1-2               
  test.js                        |       0 |        0 |       0 |       0 |                   
 cli/fakebin                     |       0 |      100 |     100 |       0 |                   
  npm-template.js                |       0 |      100 |     100 |       0 | 2-9               
 cli/instrument-inplace          |       0 |      100 |       0 |       0 |                   
  file1.js                       |       0 |      100 |       0 |       0 | 2-5               
  file2.js                       |       0 |      100 |       0 |       0 | 2-5               
 cli/nyc-config-js               |       0 |        0 |     100 |       0 |                   
  ignore.js                      |       0 |      100 |     100 |       0 | 1                 
  index.js                       |       0 |        0 |     100 |       0 | 1-10              
  nyc.config.js                  |       0 |      100 |     100 |       0 | 1                 
  nycrc-config.js                |       0 |      100 |     100 |       0 | 1                 
 cli/nycrc                       |       0 |        0 |     100 |       0 |                   
  ignore.js                      |       0 |      100 |     100 |       0 | 1                 
  index.js                       |       0 |        0 |     100 |       0 | 1-10              
 cli/subdir/input-dir            |       0 |      100 |     100 |       0 |                   
  index.js                       |       0 |      100 |     100 |       0 | 2                 
 cli/subdir/input-dir/exclude-me |       0 |      100 |     100 |       0 |                   
  index.js                       |       0 |      100 |     100 |       0 | 2                 
 cli/subdir/input-dir/include-me |       0 |      100 |     100 |       0 |                   
  exclude-me.js                  |       0 |      100 |     100 |       0 | 2                 
  include-me.js                  |       0 |      100 |     100 |       0 | 2                 
---------------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --ignore-class-method skips methods that match ignored name but still catches those that are not > stdout 1`] = `
---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |    1.44 |        0 |       5 |    1.87 |                   
 cli                             |    2.06 |        0 |    5.56 |    3.08 |                   
  args.js                        |       0 |      100 |     100 |       0 | 1                 
  by-arg2.js                     |       0 |        0 |     100 |       0 | 1-7               
  classes.js                     |   66.67 |      100 |      50 |   66.67 | 6                 
  conf-override-module.js        |       0 |      100 |     100 |       0 | 1-2               
  conf-override-root.js          |       0 |        0 |     100 |       0 | 1-23              
  empty.js                       |       0 |        0 |       0 |       0 |                   
  env.js                         |       0 |      100 |     100 |       0 | 1                 
  es6.js                         |       0 |      100 |       0 |       0 | 5-23              
  external-instrumenter.js       |       0 |        0 |       0 |       0 | 1                 
  gc.js                          |       0 |      100 |     100 |       0 | 2-3               
  half-covered-failing.js        |       0 |        0 |     100 |       0 | 1-8               
  half-covered.js                |       0 |        0 |     100 |       0 | 1-8               
  selfspawn-fibonacci.js         |       0 |        0 |       0 |       0 | 2-30              
  skip-full.js                   |       0 |      100 |     100 |       0 | 1-2               
 cli/fakebin                     |       0 |      100 |     100 |       0 |                   
  npm-template.js                |       0 |      100 |     100 |       0 | 2-9               
 cli/instrument-inplace          |       0 |      100 |       0 |       0 |                   
  file1.js                       |       0 |      100 |       0 |       0 | 2-5               
  file2.js                       |       0 |      100 |       0 |       0 | 2-5               
 cli/nyc-config-js               |       0 |        0 |     100 |       0 |                   
  ignore.js                      |       0 |      100 |     100 |       0 | 1                 
  index.js                       |       0 |        0 |     100 |       0 | 1-10              
  nycrc-config.js                |       0 |      100 |     100 |       0 | 1                 
 cli/nycrc                       |       0 |        0 |     100 |       0 |                   
  ignore.js                      |       0 |      100 |     100 |       0 | 1                 
  index.js                       |       0 |        0 |     100 |       0 | 1-10              
 cli/run-npm-test                |       0 |        0 |     100 |       0 |                   
  half-covered.js                |       0 |        0 |     100 |       0 | 1-8               
 cli/run-npm-test-recursive      |       0 |        0 |     100 |       0 |                   
  half-covered.js                |       0 |        0 |     100 |       0 | 1-8               
 cli/subdir/input-dir            |       0 |      100 |     100 |       0 |                   
  index.js                       |       0 |      100 |     100 |       0 | 2                 
 cli/subdir/input-dir/exclude-me |       0 |      100 |     100 |       0 |                   
  index.js                       |       0 |      100 |     100 |       0 | 2                 
 cli/subdir/input-dir/include-me |       0 |      100 |     100 |       0 |                   
  exclude-me.js                  |       0 |      100 |     100 |       0 | 2                 
  include-me.js                  |       0 |      100 |     100 |       0 | 2                 
---------------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --include can be used to limit bin to instrumenting specific files > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --show-process-tree displays a tree of spawned processes > stdout 1`] = `
3
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |    91.3 |       70 |     100 |     100 |                   
 selfspawn-fibonacci.js |    91.3 |       70 |     100 |     100 | 6,27-29           
------------------------|---------|----------|---------|---------|-------------------
nyc
│   100 % Lines
└─┬ node ./selfspawn-fibonacci.js 5
  │   100 % Lines
  ├─┬ node ./selfspawn-fibonacci.js 4
  │ │   100 % Lines
  │ ├─┬ node ./selfspawn-fibonacci.js 3
  │ │ │   100 % Lines
  │ │ ├── node ./selfspawn-fibonacci.js 2
  │ │ │     35 % Lines
  │ │ └── node ./selfspawn-fibonacci.js 1
  │ │       30 % Lines
  │ └── node ./selfspawn-fibonacci.js 2
  │       35 % Lines
  └─┬ node ./selfspawn-fibonacci.js 3
    │   100 % Lines
    ├── node ./selfspawn-fibonacci.js 2
    │     35 % Lines
    └── node ./selfspawn-fibonacci.js 1
          30 % Lines


`

exports[`test/nyc-integration.js TAP --use-spawn-wrap=false is functional > stdout 1`] = `
3
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |    91.3 |       70 |     100 |     100 |                   
 selfspawn-fibonacci.js |    91.3 |       70 |     100 |     100 | 6,27-29           
------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP --use-spawn-wrap=true is functional > stdout 1`] = `
3
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |    91.3 |       70 |     100 |     100 |                   
 selfspawn-fibonacci.js |    91.3 |       70 |     100 |     100 | 6,27-29           
------------------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP allows .nycrc configuration to be overridden with command line args > stdout 1`] = `
TN:
SF:ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:index.js
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
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
[32;1mAll files       [0m | [32;1m     50[0m | [33;1m      50[0m | [32;1m    100[0m | [31;1m     50[0m | [31;1m                 [0m 
[32;1m half-covered.js[0m | [32;1m     50[0m | [33;1m      50[0m | [32;1m    100[0m | [31;1m     50[0m | [31;1m6-8              [0m 
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP allows an alternative cache folder to be specified > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP allows nyc.config.js configuration to be overridden with command line args > stdout 1`] = `
TN:
SF:ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:index.js
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
SF:nyc.config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record
TN:
SF:nycrc-config.js
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
SF:half-covered.js
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
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |      100 |     100 |     100 |                   
 not-strict.js |     100 |      100 |     100 |     100 |                   
---------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP appropriately instruments file with corresponding .map file > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |      80 |      100 |      50 |      80 |                   
 s1.js    |      80 |      100 |      50 |      80 | 7                 
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP appropriately instruments file with inline source-map > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 s2.js    |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP caches inline source-maps > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 s2.js    |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP caches source-maps from .map files > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |      80 |      100 |      50 |      80 |                   
 s1.js    |      80 |      100 |      50 |      80 | 7                 
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP can run "npm test" which directly invokes a test file > stdout 1`] = `

> @ test .
> node ./half-covered.js

-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP can run "npm test" which indirectly invokes a test file > stdout 1`] = `

> @ test .
> npm run test:deeper


> @ test:deeper .
> npm run test:even-deeper


> @ test:even-deeper .
> node ./half-covered.js

-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (51%)

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP check-coverage command is equivalent to the flag > stdout 2`] = `

`

exports[`test/nyc-integration.js TAP combines multiple coverage reports > stdout 1`] = `
coverage files in ./merge-input merged into coverage.json

`

exports[`test/nyc-integration.js TAP does not create .cache folder if cache is "false" > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP does not interpret args intended for instrumented bin > must match snapshot 1`] = `
Array [
  "--help",
  "--version",
]
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
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |      100 |     100 |       0 |                   
 index.js |       0 |      100 |     100 |       0 | 1                 
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 2`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |      100 |     100 |       0 |                   
 index.js |       0 |      100 |     100 |       0 | 1                 
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 3`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |      100 |     100 |       0 |                   
 index.js |       0 |      100 |     100 |       0 | 1                 
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP execute with exclude-node-modules=false > stdout 4`] = `

`

exports[`test/nyc-integration.js TAP extracts coverage headers from unexecuted files > must match snapshot 1`] = `
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
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |        0 |       0 |       0 |                   
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP handles --clean / --no-clean properly > stdout 1`] = `
1
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |      50 |       25 |     100 |      50 |                   
 by-arg2.js |      50 |       25 |     100 |      50 | 4-7               
------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP handles --clean / --no-clean properly > stdout 2`] = `
2
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |   83.33 |       75 |     100 |   83.33 |                   
 by-arg2.js |   83.33 |       75 |     100 |   83.33 | 7                 
------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP hooks provide coverage for requireJS and AMD modules > stdout 1`] = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 ipsum.js |     100 |      100 |     100 |     100 |                   
 lorem.js |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP interprets first args after -- as Node.js execArgv > stdout 1`] = `
I’m still running
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 gc.js    |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP loads configuration from .nycrc.yaml > stdout 1`] = `
TN:
SF:index.js
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
SF:index.js
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
SF:ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:index.js
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
SF:ignore.js
FNF:0
FNH:0
DA:1,1
LF:1
LH:1
BRF:0
BRH:0
end_of_record
TN:
SF:index.js
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
SF:nyc.config.js
FNF:0
FNH:0
DA:1,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record
TN:
SF:nycrc-config.js
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
SF:index.js
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
SF:index.js
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

exports[`test/nyc-integration.js TAP nyc instrument fails on file with \`package\` keyword when es-modules is enabled > stderr 1`] = `
Failed to instrument ./not-strict.js

`

exports[`test/nyc-integration.js TAP nyc instrument fails on file with \`package\` keyword when es-modules is enabled > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP passes configuration via environment variables > must match snapshot 1`] = `
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

exports[`test/nyc-integration.js TAP recursive run does not throw > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stderr 1`] = `
ERROR: Coverage for lines (50%) does not meet global threshold (100%)

`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP report and check should show coverage check along with report > stdout 2`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |      50 |       50 |     100 |      50 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP reports appropriate coverage information for es6 source files > stdout 1`] = `
sup
do not hit
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |    62.5 |      100 |      40 |    62.5 |                   
 es6.js   |    62.5 |      100 |      40 |    62.5 | 11-17             
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP reports error if input directory is missing > stderr 1`] = `
failed access input directory ./DIRECTORY_THAT_IS_MISSING with error:

ENOENT: no such file or directory, stat './DIRECTORY_THAT_IS_MISSING'

`

exports[`test/nyc-integration.js TAP reports error if input directory is missing > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP reports error if input is not a directory > stderr 1`] = `
./package.json was not a directory

`

exports[`test/nyc-integration.js TAP reports error if input is not a directory > stdout 1`] = `

`

exports[`test/nyc-integration.js TAP run-in-context provide coverage for vm.runInContext > stdout 1`] = `
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |      100 |     100 |     100 |                   
 in-context.js |     100 |      100 |     100 |     100 |                   
---------------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP setting instrument to "false" configures noop instrumenter > must match snapshot 1`] = `
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
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
----------|---------|----------|---------|---------|-------------------

`

exports[`test/nyc-integration.js TAP skip-full does not display files with 100% statement, branch, and function coverage > stdout 1`] = `
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |    62.5 |       50 |     100 |    62.5 |                   
 half-covered.js |      50 |       50 |     100 |      50 | 6-8               
-----------------|---------|----------|---------|---------|-------------------

`
