'use strict'

const t = require('tap')
const {
  sanitizePathSegments,
  sanitizeCoveragePaths
} = require('../lib/sanitize-coverage-paths')

t.test('replaces Windows-invalid characters in a path segment', t => {
  t.equal(sanitizePathSegments('angular:script'), 'angular_script')
  t.equal(sanitizePathSegments('foo?bar'), 'foo_bar')
  t.equal(sanitizePathSegments('a<b>c'), 'a_b_c')
  t.equal(sanitizePathSegments('x|y*z'), 'x_y_z')
  t.equal(sanitizePathSegments('quote"name'), 'quote_name')
  t.end()
})

t.test('preserves POSIX and Windows roots', t => {
  t.equal(sanitizePathSegments('/src/app.js'), '/src/app.js')
  t.equal(sanitizePathSegments('C:\\src\\app.js'), 'C:\\src\\app.js')
  t.equal(
    sanitizePathSegments('C:\\src\\angular:script'),
    'C:\\src\\angular_script'
  )
  t.equal(
    sanitizePathSegments('/generated/angular:script'),
    '/generated/angular_script'
  )
  t.end()
})

t.test('rewrites coverage map keys and path fields', t => {
  const sanitized = sanitizeCoveragePaths({
    'angular:script': {
      path: 'angular:script',
      s: { 0: 1 }
    },
    '/src/ok.js': {
      path: '/src/ok.js',
      s: { 0: 2 }
    }
  })

  t.same(Object.keys(sanitized).sort(), ['/src/ok.js', 'angular_script'])
  t.equal(sanitized['angular_script'].path, 'angular_script')
  t.equal(sanitized['/src/ok.js'].path, '/src/ok.js')
  t.end()
})
