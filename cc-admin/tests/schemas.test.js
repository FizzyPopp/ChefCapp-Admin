const root = __dirname + '/..';
var schemas = require('../lib/schemas').init(root);

for (let key in schemas.list){
    console.log("generated skeleton for " + key + ":\n", schemas.list[key].skeleton);
}
//console.log(schemas.list);
test('Existence of schemas', () => {
    expect(typeof schemas.list).toBe('object');
})
