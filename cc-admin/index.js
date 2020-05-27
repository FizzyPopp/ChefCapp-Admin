/**
 * @module cc-admin
 */

const schemaRegExp = /\.schema\.json$/;

/**
 *  The modules required from Firebase
 */
var firebase-admin = require('firebase-admin');
var firebase-functions = require('firebase-functions');
var fs = require('fs');
var path = require('path');
var Ajv = require('ajv');
var Uuid = require('uuid');

/**
 * List of data schemas which defines the data structures to be loaded into the
 * database. Generated on module load based on included schemas within the pack.
 * @constant
 * @exports
 */
var _schemas = {}
fs.readdir(__dirname, (err, files) => {
    if(err != null) {
        console.log(err);
        return;
    }
    files.forEach ((file) => {
        if (file.match(schemaRegExp)) {
            let uri = 'cc-admin/' + file;
            console.log('loading schema: ' + uri);
            var s = require(uri);
            _schemas[s.title] = s;
        }
    });
});
exports.schemas = _schemas;

/**
 * Instanced ajv object built from the loaded schemas.
 * @exports
 */
let _ajv = new Ajv();
_ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
for (let s in _schemas) {
    console.log(s);
    _ajv.addSchema(s, s.title);
}
exports.ajv = _ajv;


/**
 * Name of module
 * @exports
 */
exports.name = 'cc-admin';

/**
 * The js representation of the ChefCapp firebase application, used to access
 * and authorize admin functions.
 * @constant
 * @exports
 */
const _app = firebase-admin.initializeApp({
    credential: firebase-admin.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
});
exports.app = _app;



/**
 * The Firestore database associated with ChefCapp
 * @constant
 * @exports
 */
const _db = firebase-admin.firestore();
exports.db = _db;



/** @function test
 * Testing function to do testing stuff
 * @exports
 */
exports.test = function (collectionRef) {
    let allDocs = collectionRef.get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id, ':', doc.data());
        });
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
    return allDocs;
};

/** @function getCollection
 * Returns collection from the CC database by name, takes Strings only
 * @exports
 */
exports.getCollection = function (colName) {
    if (typeof(colName) === 'string') {
        return exports.db.collection(colName)
                      .catch(err => {
                          console.log('Couldnt get collection ' + colName + ' , idk whats going on', err);
                      });
    }
    throw "Collection name must be a string.";
};

exports.ingredientParse = async function (candidate){

};


/** @function recipeParse
 * Takes a recipe according to schema and parses it into a Firestore DB element
 * @exports
 */
exports.recipeParse = async function (candidate) {

};

/**
 * @func validate
 * @param {Object} Any object with a suppied schema
 */
exports.validate = _ajv.validate
