'use strict'

const fs = require('fs')
const cca = require('../index');
const root = __dirname + '/../' + 'examples/';
const f = fs.readFileSync(root + './ingredients/168c32e7-4171-468f-82e9-08d2e4f69431.json')

const peps = JSON.parse(f);
const id = peps.id;

let dbid = cca.db.find(peps);

console.log(peps);
test('Finding green peps by ID...', () => {
    expect(dbid).toBe(id);
});
