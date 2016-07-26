var fs = require('fs')

require.extensions['.js'] = function (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(content.replace('--> pork chop sandwiches <--', ''), filename);
}

require.extensions['.whatever'] = function (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(content.replace('--> pork chop sandwiches <--', ''), filename);
}
