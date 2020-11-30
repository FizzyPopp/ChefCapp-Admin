const fs = require('fs')
const crypto = require('crypto');
const util = require('util');
var cca = require('../index');
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'components/',
    exroot + 'ingredients/',
    exroot + 'recipes/'
];
var reJson = /\.json$/;

/**
 * Programmatically trawl through the example directories and load in each object
 * found by the RegExp.
 */
var examples = [];
exdirs.forEach ((path) => {
    let fileList = fs.readdirSync (path);
    fileList.forEach ((file) => {
        if (file.match(reJson)) {
            let uri = path + file;
            // console.log('Importing obj: ' + uri);
            let obj = require(uri);

            obj.path = uri;
            obj.timestamp = Date.now();
            examples.push(obj);
        }
    });
});

/**
 * Generate two hash lists out of the same json objects 500ms apart
 */
let h1 = hashList(examples);
let h2 = [];
test('Checking if rehash after 500ms will return same hashes', done => {
    let cb = () => {
        h2 = hashList(examples);
        for (let i = 0; i < h1.length ; i++) {
            // console.log('1 <==' + h1[i] + '\n2 ==>' + h2[i]);
            expect(h1[i]).toBe(h2[i]);
        }
        done();
    }
    setTimeout(cb, 500);
});

function hashList(list) {
    let canons = [];
    let stringifies = [];
    let otostrings = [];
    let hashes = [];
    list.forEach((obj) => {
        obj.timestamp = Date.now();
        let o = obj.toString();
        otostrings.push(o);

        let s = JSON.stringify(obj)
        stringifies.push(s);

        let c = cca.canonize(obj);
        canons.push(c);

        let h = cca.hash(obj);
        hashes.push(h);
        // console.log('----------' + obj.id + '----------\n' + 'type: ' + obj.type + ' | time: ' + obj.timestamp + '\n' + h + '\n' + '--------------------------DONE--------------------------');
    });
    return hashes;
}
