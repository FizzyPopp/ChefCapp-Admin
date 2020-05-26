/**
 * @module cc-admin
 */

const schemaRegExp = /\.schema\.json$/;

/**
 *  The modules required from Firebase
 */
var cc = require('firebase-admin');
var functions = require('firebase-functions');
var fs = require('fs');
var path = require('path');
var Ajv = require('ajv');
var uuid = require('uuid')


/**
 * List of data schemas which defines the data structures
 * @constant
 */
var _schemas = {}
/**
 * Load schemas into schema object that match the schema regex
 */
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

let _ajv = new Ajv();

_ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
for (let name in _schemas) {
    console.log(_schemas[name]);
    _ajv.addSchema(_schemas[name], name);
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
const _app = cc.initializeApp({
    credential: cc.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
});
exports.app = _app;



/**
 * The Firestore database associated with ChefCapp
 * @constant
 * @exports
 */
const _db = cc.firestore();
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


/** @function recipeParse
 * Takes a recipe according to schema and parses it into a Firestore DB element
 * @exports
 */
exports.recipeParse = async function (candidate) {

};

/**
 * @func recipeVerify
 *
 * @param {Object} recipe -
 *
 * Returns true if [recipe] contains the fields required
 */
exports.candidateVerify = function (candidate) {
    let isRecipe = false
    let recipeSchema = exports.recipeSchema;
    for (let required in recipeSchema.required) {
        if (candidate[required] == null) {

        }
    }
    return isRecipe;
};
