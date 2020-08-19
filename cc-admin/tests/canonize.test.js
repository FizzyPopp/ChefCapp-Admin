const fs = require('fs')
const crypto = require('crypto');
var cca = require('../index');
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'components/',
    exroot + 'ingredients/',
    exroot + 'recipes/'
];
var reJson = /\.json$/;
var examples = [];
var canons = [];
var stringifies = [];
var otostrings = [];

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

examples.forEach((obj) => {
    o = obj.toString();
    otostrings.push(o);

    s = JSON.stringify(obj)
    stringifies.push(s);

    c = cca.canonize(obj);
    canons.push(c)

    h = crypto.createHash('sha256');
    h.update(c);
    obj.hash = h.digest('hex');

    console.log('-----' + obj.id + '-----');
    console.log('type: ' + obj.type);
    console.log('CANONICAL-------------------------------------')
    // console.log(c);
    console.log('STRINGIFRIED----------------------------------')
    // console.log(s);
    console.log('OBJECTIFIED-----------------------------------')
    // console.log(o);
    console.log('HASH------------------------------------------')
    console.log(obj.hash);
    console.log('DONE------------------------------------------');
});
