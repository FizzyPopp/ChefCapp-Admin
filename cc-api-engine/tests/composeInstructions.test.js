const fs = require('fs')
const msg = require('../lib/utils/msg').name('COMPOSE');
const stringifyInstructions = require('../lib/utils/stringifyInstructions');
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'steps/',
];
var reJson = /\.json$/;
var steps = [];



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
            steps.push(obj);
        }
    });
});

msg(JSON.stringify(steps,null, 2));

steps.forEach((step) => {
    msg('composing step:' + step.id);
    let ret = stringifyInstructions(step.instructions);
    msg('result: \n' + ret );
});
