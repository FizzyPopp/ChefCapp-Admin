/**
 * @module cc-admin
 */

var _admin = require('firebase-admin');
var _funcs = require('firebase-functions');
var _schemas = require('./lib/schemas')
    .init(__dirname);
var _Ajv = require('ajv');
var _ajv = new _Ajv({ verbose: false });

const { v4 : uuid } = require('uuid');


/**
 * The js representation of the ChefCapp firebase application, used to access
 * and authorize admin functions.
 * @exports
 */
var _app = _admin.initializeApp({
    credential: _admin.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
});


var _db = _admin.firestore();



for (let schema in _schemas.list) {
    _ajv.addSchema(schema, schema.title);
}


/**
 * Validator functions compiled by ajv from the loaded _schemas
 * @exports
 */
_schemas.validate = {};
for (let title in _schemas) {
    console.log("Compiling ajv schema validator function for: " + title);
    _schemas.validate[title] = exports.ajv.compile(_schemas[title]);
}


/** @function test
 * Testing function to do testing stuff
 * @exports
 */
var _test = (collectionRef) => {
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

/**
 * @func getObject
 * Returns object from named collection with given ID (uuid v4)
 *
 * @exports
 */
_db.getObject = (colName, uuid) => {
    let docRef = exports.db.firestore.collection(colName).doc(uuid);
    docRef.get()
        .then ((doc) => {
            return doc;
        })
        .catch ((err) => {
            console.log("Could not find document with id " + uuid);
            throw err;
        });
};

_db.push = (object) => {
    if (typeof object.title !== 'string') {
        err = "Input object is not a valid" + JSON.stringify(object);
        throw new TypeError (err);
    }

    isValid = _schema.validate[object.title](object)
    _db.collection(object.title).doc(object.id)
}


/** @TODO - implement
 * @func find
 * Takes an unknown object with only characteristic fields, tries to match characterstic fields with existing
 * objects in specified type database.
 * Potential fields:
 * - uuid (just use fetch from db instead)
 * - tags
 * - name
 */
_db.find = (candidate) => {};

/**
 * @func validate
 * Wraps the ajv validation function with async, then checking and throwing untyped object errors.
 * This is the sound of me screaming for monads.
 * @param {Object} data - Some object to be validated against schema
 */
async function _validate(data){
    if (data.dataType != null){
        let ret = {
            errors: null,
            validity: false
        };

        ret.validity = await exports.ajv.validate(data.dataType, data);

        if (ret.validity === false) {
            ret.errors = exports.ajv.errors;
        }

        return ret;
    }
    else {
         throw new Error.TypeError("Object has no valid dataType field.");
    }
};


/**
 * @namespace exports
 * @prop {object} db - cloud firestore instance loaded with additional chefcapp specific functions
 * @prop {object} db. -
 * @prop {object} db -
 * @prop {object} db -
 * @prop {object} db -
 * @prop {object} db -
 *
 */
exports.name = 'cc-admin';
exports.db = _db
exports.schemas = _schemas
exports.firebase = _app;
exports.ajv = _ajv;
exports.validate = _validate;
