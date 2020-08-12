var schemas = require('../lib/schemas').init(root);
const root = __dirname + '/..';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'components',
    exroot + 'ingredients',
    exroot + 'recipes'
];
var reJson = /\.json$/;
var examples = [];


for (let key in schemas.list){
    console.log("generated skeleton for " + key + ":\n", schemas.list[key].skeleton);
}

//console.log(schemas.list);
test('Existence of schemas', () => {
    expect(typeof schemas.list).toBe('object');
});

