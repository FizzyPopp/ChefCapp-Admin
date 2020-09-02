'use strict'

/**
 * @module cc-admin
 */
const crypto = require('crypto');
const {v4 : uuidv4} = require('uuid');
var _admin = require('firebase-admin');
var _funcs = require('firebase-functions');
var _schemas = require('./lib/schemas')
                .init(__dirname);
var _Ajv = require('ajv');
var _ajv = new _Ajv({ verbose: false });


const collections = [
    "components",
    "ingredients",
    "recipes",
    "users"
]

/**
 * The ChefCapp firebase application, used to access
 * and authorize admin functions.
 * @exports
 */
var _firebase = _admin.initializeApp({
    credential: _admin.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
});

var _db = _admin.firestore();

for (let key in _schemas.list) {
    _ajv.addSchema(_schemas.list[key], _schemas.list[key].title);
}

// console.log(Date.now());

/**
 * Validator functions compiled by ajv from the loaded _schemas
 * @exports
 */
_schemas.validate = {};
for (let key in _schemas.list) {
    // console.log("Compiling ajv schema validator function for: " + key);
    _schemas.validate[key] = _ajv.compile(_schemas.list[key]);
}


/**
 * @function authenticate
 *
 */
let _authenticate = (idToken) => {
    var uid = _firebase.auth().verifyIdToken(idToken)
         .then((decodedToken) => {
             return decodedToken.uid;
         })
         .catch((error) => {
         });
}


/**
 * @func getObject
 * Returns object from named collection with given ID (uuid v4)
 *
 * @exports
 */
_db.getObject = (colName, id) => {
    if (uuidv4.validate(uuid)) {
        let docRef = exports.db.collection(colName).doc(uuid);
        docRef.get()
              .then ((doc) => {
                  return doc;
              })
              .catch ((err) => {
                  console.log("Could not find document with id " + uuid);
                  throw err;
              });
    } else { throw new Error('Invalid UUID') }
};

/**
 * @func push
 * Takes an object, validates, then pushes to database. If validation is unsuccessful,
 * throw error with object.
 *
 * @exports
 */
_db.pushObject = (object) => {
    let ret = {
        id: uuidv4.NIL,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', //this is the sha256 hash of empty string
        errors: null,
        validity: false,
        obj: {}
    };

    if (typeof object.type === 'string') {
        if (collections.includes(object.type)) {
            isValid = _ajv.validate(object.type, object);
            if ( isValid ) {
                if ( typeof object.hash !== 'undefined' ) { delete object.hash; }
                object.hash = _hash(object);
                //TODO : load up a list of UUIDs from the database.
                let id = uuidv4();
                if (dbID !== uuidv4.NIL) {
                    id = dbID;
                }

                object.timestamp = Date.now();
                _db.collection(object.title).doc(object.hash).set(object);

                ret.id = id;
                ret.hash = object.hash
            }

            ret.validity = isValid;
            ret.errors = _ajv.errors;
        }
    } else {
        ret.validity = false;
        ret.errors = "Input object does not have a valid type field: " + JSON.stringify(object);
    }

    return ret;
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
_db.find = (candidate) => {
    let ret = uuidv4.NIL;

    try {
        const docRef = exports.db.collection(candidate.type).doc(candidate.id);
        docRef.get()
              .then ((doc) => {
                  obj = doc.data()
                  return obj.id;
              })
              .catch ((err) => {
                  return ret;
              });

    } catch (err) { return ret; }
};


/**
 * @func hash
 * hashes given database object, this is unsafe and should not be called outside of the module
 */
let _hash = (obj) => {
    if (collections.includes(obj.type)){
        c = _canonize(obj);
        h = crypto.createHash('sha256');
        h.update(c);
        return h.digest('hex');
    }
    throw new Error.TypeError("Not a hashable type.")
}


/**
 * @func canonize
 * Turns a valid database object (recipe, component, ingredient) into its
 * canonical string form (spaces/newlines stripped, fields alphabetised).
 * THIS FUNCTION IS UNSAFE ON CIRCULAR STRUCTURES.
 * @param {Object} obj - candidate to be canonized
 * @exports
 */
let _canonize = (obj) => {
    if(typeof obj !== 'object') {
        if (typeof obj === 'string') {
            return '"' + obj + '"';
        }
        return JSON.stringify(obj);
    }

    var keys = Object.keys(obj);
    var objstr = '{';
    keys.sort();
    // console.log(keys);
    keys.forEach((val) => {
        if(val != 'hash'){
            objstr = objstr + '"' + val + '":';
            objstr = objstr + _canonize(obj[val]) + ',';
        }
    });
    objstr = objstr.slice(0, -1);
    objstr = objstr + '}';
    return objstr;
}

/**
 * @func validate
 * Wraps the ajv validation function with async, then checking and throwing untyped object errors.
 * This is the sound of me screaming for monads.
 * @param {Object} candidate - Some object to be validated against schema
 */
let _validate = (candidate) => {
    let ret = {
        errors: null,
        validity: false
    };

    if (candidate.type != null){

        ret.validity = _ajv.validate(candidate.type, candidate);

        if (ret.validity === false) {
            ret.errors = _ajv.errors;
        }

        return ret;
    }
    ret.errors = new Error.TypeError("Object has no valid type field.");
    return ret;
};


/**
 * @namespace exports
 * @prop {object} ajv - exposes ajv instance for debugging
 * @prop {object} canonize - canonical stringify on safe objects (recipes, steps, units)
 * @prop {object} db - cloud firestore instance loaded with additional chefcapp specific functions
 * @prop {object} firebase -
 * @prop {object} name - cc-admin
 * @prop {object} schemas - object containing all schemas loaded
 * @prop {function} validate - exposes validation interface for ease of access
 *
 */
exports.ajv = _ajv;
exports.canonize = _canonize;
exports.db = _db;
exports.firebase = _firebase;
exports.name = 'cc-admin';
exports.schemas = _schemas;
exports.validate = _validate;
