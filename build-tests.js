'use strict';

var fs = require('fs');
var Path = require('path');
var del = require('del');
var recast = require('recast');
var makeSourcemapComment = require('inline-source-map-comment');
var types = recast.types;
var n = types.namedTypes;

// Delete previous files.
process.chdir(__dirname);
del.sync(['test/built-*']);

var outputDir = Path.join(__dirname, 'test');
var inputPath = Path.join(outputDir, 'nyc-test.js');
var inputSource = fs.readFileSync(inputPath, 'utf8');

function parse() {
  return recast.parse(inputSource, {
    sourceFileName: inputPath
  });
}

function print(ast) {
  var result = recast.print(rootNode(ast), {
    sourceMapName: inputPath + '.map'
  });

  return result.code + '\n' + makeSourcemapComment(result.map);
}

var i = 0;

types.visit(parse(), {
  visitExpressionStatement: function (path) {
    var node = path.node;
    if (isIt(node)) {
      fs.writeFileSync(
        Path.join(outputDir, name(path, i)),
        print(copy(path))
      );
      i++;
      return false;
    }
    this.traverse(path);
  }
});

function copy(path) {
  var copied;
  if (path.parentPath) {
    copied = copy(path.parentPath).get(path.name);
  } else {
    copied = new types.NodePath({root: parse()});
  }

  var parent = copied.parent;
  var node = copied.value;
  if (!(n.Node.check(node) && parent && (n.BlockStatement.check(parent.node) || n.Program.check(parent.node)))) {
    return copied;
  }

  var body = parent.get('body').value;
  var keeper = parent.get('body', path.name).node;

  var statementIdx = 0;

  while (statementIdx < body.length) {
    var statement = body[statementIdx];
    if ((isDescribe(statement) || isIt(statement)) && statement !== keeper) {
      parent.get('body', statementIdx).replace();
    } else {
      statementIdx++;
    }
  }

  return copied;
}

function isDescribe(node) {
  if (!n.ExpressionStatement.check(node)) {
    return false;
  }
  node = node.expression;
  return n.CallExpression.check(node) && n.Identifier.check(node.callee) && (node.callee.name === 'describe');
}

function isIt(node) {
  if (!n.ExpressionStatement.check(node)) {
    return false;
  }
  node = node.expression;
  return n.CallExpression.check(node) && n.Identifier.check(node.callee) && (node.callee.name === 'it');
}

// Walks the path up to the root.
function rootNode(path) {
  while (path.parent) {
    path = path.parent;
  }
  return path;
}

// Picks a file name for the test, by walking up the tree and looking at describe / require calls.
function name(path, i) {
  var arr = [];
  _name(path, arr);
  var testName = arr.reverse().join(' ');
  var filename = i + '-' + testName.replace(/\s/g, '_') + '.js';
  if (i < 100) {
    filename = (i < 10 ? '00' : '0') + filename;
  }
  return 'built-' + filename;
}

function _name(path, arr) {
  if (!path) {
    return;
  }
  if (isDescribe(path.node) || isIt(path.node)) {
    var firstArg = path.get('expression', 'arguments', 0).node;
    n.Literal.assert(firstArg);
    arr.push(firstArg.value);
  }
  _name(path.parent, arr);
}
