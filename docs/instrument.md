# Producing instrumented source

The `nyc instrument` command can produce instrumented source files.
These files are suitable for client side deployment during end to end testing.
You can either pre-instrument your source, or write instrumented source to a stream.

Run `nyc instrument --help` to display a full list of available command options.

## Pre-instrumented source

You can create pre-instrumented source code by running:

```bash
nyc instrument <input> [output]
```

`<input>` can be any file or directory within the project root directory.
The `[output]` directory is optional and can be located anywhere, if not set the instrumented code will be sent to `stdout`.
For example, `nyc instrument . ./output` will produce instrumented versions of any source files it finds in `.` and store them in `./output`.

The `--delete` option will remove the existing output directory before instrumenting.

The `--in-place` option will allow you to run the instrument command.

The `--complete-copy` option will copy all remaining files from the `input` directory to the `output` directory.
When using `--complete-copy` nyc will not copy the contents of a `.git` folder to the output directory.

**Note:** `--complete-copy` will dereference any symlinks during the copy process, this may stop scripts running properly from the output directory.

## Streaming instrumentation

`nyc instrument <input>` will stream instrumented source directly to `stdout` and that output can then be piped to another process.
You can use this behaviour to create a server that dynamically instruments files on request.
The following example shows streaming instrumentation middleware capable of instrumenting files on request.

```javascript
app.use((req, res, next) => {
  const myOptions = ""
  const filename = myHelper.getFilename(req)
  const nyc = cp.spawn(`nyc instrument ${myOptions} ${filename}`)
  nyc.stdout.pipe(res)
})
```
