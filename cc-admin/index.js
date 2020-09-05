'use strict'

/**
 * @module cc-admin
 */
const crypto = require('crypto');
const uuid = require('uuid');
var _admin = require('firebase-admin');
var _funcs = require('firebase-functions');
var _schemas = require('./lib/schemas')
                .init(__dirname);
var _Ajv = require('ajv');
var _ajv = new _Ajv({ verbose: false });


const dbTypes = [
    "component",
    "ingredient",
    "recipe",
    "user"
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


_schemas.validate = {};
for (let key in _schemas.list) {
    _ajv.addSchema(_schemas.list[key], _schemas.list[key].title);
}

// do it twice to prevent dependency issues
for (let key in _schemas.list) {
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
_db.pushObject = async function(object) {
    let ret = {
        id: uuid.NIL,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', //this is the sha256 hash of empty string
        errors: null,
        validity: false,
        timestamp: -1,
        obj: {}
    };

    if (typeof object.type === 'string') {
        if (dbTypes.includes(object.type)) {
            let isValid = _ajv.validate(object.type, object);
            if ( isValid ) {
                const oCollection = object.type + '-test';
                const oHash = _hash(object);
                console.log(object.hash);

                const collectionRef = await _db.collection(oCollection)
                const sameHashRef = collectionRef.doc(oHash);
                const sameHash = await sameHashRef.get()

                if (!sameHash.exists) { //skip upload if there's already a document with the same hash
                    object.hash = oHash;
                    const id = uuid.v4();
                    const nameQueryRef = collectionRef.where('name','==', object.name);
                    let nameQuerySnapshot = await nameQueryRef.get();
                    if (!nameQuerySnapshot.empty) {
                        id = nameQuerySnapshot.docs[0].id;
                    }

                    object.id = id;
                    object.timestamp = Date.now();
                    _db.collection(oCollection).doc(object.hash).set(object);

                    ret.id = object.id;
                    ret.hash = object.hash
                    ret.timestamp = object.timestamp;
                    ret.obj = object;
                }
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
    if (dbTypes.includes(obj.type)){
        if ( typeof obj.hash !== 'undefined' ) { delete obj.hash; }
        if ( typeof obj.timestamp !== 'undefined' ) { delete obj.timestamp; }

        let c = _canonize(obj);
        let h = crypto.createHash('sha256');

        h.update(c);
        return h.digest('hex');
    }
    throw new Error("Not a hashable type: " + obj.type);
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
    ret.errors = new Error("Object has no valid type field.");
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
exports.hash = _hash;
