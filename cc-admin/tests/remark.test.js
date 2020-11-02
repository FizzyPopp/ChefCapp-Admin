var parse = require('../lib/parser');

const sample = "asdfasdf [toast](wikipedia.org) @[ingredient name] #[a quantity] $[unitio] %[12 minute]";
const tree = parse.transform(sample);

console.log("printing sample text: " + sample)
console.log(JSON.stringify(tree, null, 2));

function treeterate (node) {
    for (key in node) {
        console.log(key + ": " + JSON.stringify(node[key]), null, 4);
        if (key === 'children') {
            node.children.forEach((child) => treeterate(child));
        }
    }
};

// test('Tree Structure:', () => {
//     for (let key in tree.children.) {
//         expect(tree[key] === treeCanon[key]).toBe(true);
//     }
// })
