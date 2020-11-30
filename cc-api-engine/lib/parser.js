'use strict'

const uuid = require('uuid');
var unified = require('unified');
var remark = require('remark-parse');
var recipeStepParse = require('./parser/inline/recipe-step');

// var recipeStepCompile = require('./parser/inline/recipe-step');

var parser = unified()
    .use(remark, {commonmark: true})
    .use(recipeStepParse);

var visit = require('unist-util-visit')
var is = require('unist-util-is')

exports.transform = (markdown) => {
    let tree = parser.parse(markdown);
    let instructions = {
        abstract: [],
        copy: [],
        quantity: [],
        name: [],
        time: [],
        unit: [],
        mentionedIngredientList: []
    };

    var nodeType = '';
    var copyText = '';
    // console.log("tree: " + JSON.stringify(tree));

    visit(tree, visitor);

    function visitor(node) {
        // console.log(node);
        switch (node.type) {
            case 'text':
                copyText = copyText + node.value;
                console.log("copyText: " + copyText);
                nodeType = 'copy';
                break;
            case 'name':
                if (instructions.mentionedIngredientList.includes(node.value) === false) {
                    instructions.mentionedIngredientList.push(node.value);
                }
            case 'quantity':
            case 'time':
            case 'unit':
                if (nodeType === 'copy') {
                    // console.log('copy reset');
                    instructions.abstract.push('copy');
                    instructions.copy.push(copyText);
                    copyText = '';
                }
                nodeType = node.type;
                // console.log(nodeType + ": " + node.value);
                instructions.abstract.push(nodeType);
                instructions[nodeType].push(node.value);
                break;
            default:
                break;
        }
    };

    if (copyText !== '') {
        instructions.abstract.push('copy');
        instructions.copy.push(copyText);
    }

    return instructions;
};
