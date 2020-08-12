const fs = require('fs')
var cca = require('../index');
var schemas = cca.schemas;
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'components/',
    exroot + 'ingredients/',
    exroot + 'recipes/'
];
var reJson = /\.json$/;
var examples = [];


// console.log(cca.schemas.list)

/**
 * Programmatically trawl through the schema directories and load in each schema
 * found by the schemaRegExp. When found, attach schema to internal _ajv instance.
 */
exdirs.forEach ((path) => {
    let fileList = fs.readdirSync (path);
    fileList.forEach ((file) => {
        if (file.match(reJson)) {
            let uri = path + file;
            // console.log('Importing obj: ' + uri);
            let obj = require(uri);

            obj.path = uri;
            examples.push(obj);
        }
    });
});

examples.forEach((obj) => {
    let id = obj.id;
    let type = obj.type;
    let ret = cca.validate(obj);
    console.log("ID: " + id + " | type: " + type +  " | " + JSON.stringify(ret, null, 2));
    test('Verifying ' + id + ' of type ' + type + '...', (ret) => {
        expect(ret.validity).toBe(true);
    });
});
