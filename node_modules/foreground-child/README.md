# foreground-child

[![Build Status](https://travis-ci.org/isaacs/foreground-child.png)](https://travis-ci.org/isaacs/foreground-child)

Run a child as if it's the foreground process.  Give it stdio.  Exit
when it exits.

Mostly this module is here to support some use cases around wrapping
child processes for test coverage and such.

## USAGE

```js
var foreground = require('foreground-child')

// cats out this file
var child = foreground('cat', [__filename])

// At this point, it's best to just do nothing else.
// return or whatever.
// If the child gets a signal, or just exits, then this
// parent process will exit in the same way.
```

A callback can optionally be provided, if you want to perform an action
before your foreground-child exits:

```js
var child = foreground('cat', [__filename], function (done) {
  // perform an action.
  return done()
})
```
