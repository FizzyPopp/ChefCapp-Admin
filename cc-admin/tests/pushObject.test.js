const fs = require('fs')
const cca = require('../index');
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

/**
 * Programmatically trawl through the example directories and load in each object
 * found by the RegExp.
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

let testObj = examples.pop();

cca.db.pushObject(testObj)
   .then((ret) => {
       console.log(ret);
   })
   .catch((err) => {
       console.log(err);
   });
