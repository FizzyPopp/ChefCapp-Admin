var unified = require('unified');
var remark = require('remark-parse');
var recipeStep = require('./parser/inline/recipe-step');


var parser = unified()
  .use(remark, {commonmark: true})
  .use(recipeStep)

module.exports = parser;
