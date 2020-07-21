const root = __dirname + '/..';
var db = require('../lib/db').init(root);

for (let key in db.schemas){
    console.log("generated skeleton for " + key + ":\n", db.schemas[key].skeleton);
}
// console.log(db.schemas);
test('Existence of schemas', () => {
    expect(typeof db.schemas).toBe('object');
})
