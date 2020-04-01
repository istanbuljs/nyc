/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/config-override.js TAP spawn that does config overriding > stdout 1`] = `
in parent { include: 'conf-override-root.js' }
in child { include: 'conf-override-module.js' }
in module { include: 'conf-override-module.js' }
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |   77.78 |       50 |     100 |   77.78 |                   
 conf-override-module.js |     100 |      100 |     100 |     100 |                   
 conf-override-root.js   |   71.43 |       50 |     100 |   71.43 | 22-23             
-------------------------|---------|----------|---------|---------|-------------------

`
