const fs = require('fs')
var cca = require('../index');
var schemas = cca.schemas;
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'steps/',
    exroot + 'ingredients/',
    exroot + 'recipes/'
];
var reJson = /\.json$/;
var examples = [];



/**
 * Programmatically trawl through the example directories and load in each object
 * found by the RegExp.
 */
exdirs.forEach ((path) => {
    let fileList = fs.readdirSync (path);
    fileList.forEach ((file) => {
        if (file.match(reJson)) {
            let uri = path + file;
            console.log('Importing obj: ' + uri);
            let obj = require(uri);

            obj.path = uri;
            examples.push(obj);
        }
    });
});

var results = [];
examples.forEach((obj) => {
    let result = cca.validate(obj)
    // console.log("validating " + obj.id + " | type: " + obj.type + " | r: " + JSON.stringify(r, null, 2));
    test('Verifying validity of ' + JSON.stringify(obj.id, null, 2), () => {
        expect(result.errors).toBe(null);
    });
    // results.push(result);
});

