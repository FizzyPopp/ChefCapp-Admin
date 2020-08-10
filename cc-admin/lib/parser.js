var unified = require('unified');
var remark = require('remark-parse');
var copyToken = require('./parser/remark-copy-token');

var parser = unified()
  .use(remark, {commonmark: true})
  .use(copyToken)

module.exports = parser;
