# spawn-wrap

Wrap all spawned Node.js child processes by adding environs and
arguments ahead of the main JavaScript file argument.

Any child processes launched by that child process will also be
wrapped in a similar fashion.

This is a bit of a brutal hack, designed primarily to support code
coverage reporting in cases where tests or the system under test are
loaded via child processes rather than via `require()`.

It can also be handy if you want to run your own mock executable
instead of some other thing when child procs call into it.

## USAGE

```javascript
var wrap = require('spawn-wrap')

// wrap(wrapperArgs, environs)
var unwrap = wrap(['/path/to/my/main.js', 'foo=bar'], { FOO: 1 })

// later to undo the wrapping, you can call the returned function
unwrap()
```

In this example, the `/path/to/my/main.js` file will be used as the
"main" module, whenever any Node or io.js child process is started,
whether via a call to `spawn` or `exec`, whether node is invoked
directly as the command or as the result of a shebang `#!` lookup.

## CAVEATS

Lookups of shebangs require synchronous I/O.  Probably you should not
be using this script in any production environments anyway.

Also, this will slow down child process execution by a lot, since
we're adding at least one layer of indirection.

You can't at this time use the wrapperArgs to pass node args like
`--use_strict` that come before the main file.
