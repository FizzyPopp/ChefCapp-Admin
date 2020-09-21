const fs = require('fs')
const cca = require('../index');
var schemas = cca.schemas;
const root = __dirname + '/../';
var exroot = root + 'examples/';
var exdirs = [
    exroot + 'steps/',
    // exroot + 'ingredients/',
    exroot + 'recipes/'
];
var reJson = /\.json$/;
var examples = [];
const msg = require('../lib/utils/msg')
      .name('PUSHTEST');
const strfy = require('../lib/utils/strfy')
      .space(2);

/**
 * Programmatically trawl through the example directories and load in each object
 * found by the RegExp.
 */
exdirs.forEach ((path) => {
    let fileList = fs.readdirSync (path);
    fileList.forEach ((file) => {
        if (file.match(reJson)) {
            let uri = path + file;
            // msg('Importing obj: ' + uri);
            let obj = require(uri);

            examples.push(obj);
        }
    });
});

examples.forEach((obj) => {
    cca.db.stampObject(obj, obj.type)
       .then((stamped) => {
           msg('stamped obj: ' + strfy(stamped));
           cca.db.pushObject(stamped.obj, stamped.obj.type) })
        .then((ret) => {
            msg('returned: ' + strfy(ret));
        })
        .catch((err) => {
            msg('returned');
            msg(err.obj.id);
            msg('got error: ' + strfy(err.errors));
        });
});
