const fs = require('fs')
const cca = require('../index');
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
            // console.log('Importing obj: ' + uri);
            let obj = require(uri);

            examples.push(obj);
        }
    });
});

examples.forEach((obj) => {
    cca.db.pushObject(obj, obj.type)
       .then((ret) => {
           console.log(ret);
       })
       .catch((err) => {
           console.log(err);
       });
});
