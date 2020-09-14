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
    "step",
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


_db.buildIngredient = (candidate) => {
    //theoretical pathway:
    // -> request with obj -> validate -> build -> push ->
    //
    let isValid = _schemas.validate.ingredient(candidate);
    let ingredient = {};
    if(ret.isValid) {
        if ( candidate.unit.unitCategory === 'SI' ) {

        }
        if ( candidate.unit.cooking ) {
            ingredient.unit.singular = candidate.unit.cooking
        } else {
        }
    }
}

_db.buildRecipe = (candidate) => {
    let isValid = _schemas.validate.recipe(candidate);
    let recipe = {};
    if (isValid) {

    }
    return new Promise ((resolve, reject) => {
        if (isValid)
        { resolve(recipe); }
        else
        {
            reject(candidate);
        }
    })
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

let _stampObject = async (object, type) => {
    let ret = {
        id: uuid.NIL,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', //this is the sha256 hash of empty string
        errors: false,
        validity: false,
        timestamp: -1,
        obj: {}
    };

    if (object.type === type && dbTypes.includes(object.type)) {
        console.log(object.type);
        ret.validity = _schemas.validate[object.type](object);

        if ( ret.validity ) {
            const objectCollection = object.type;
            object.hash = _hash(object);
            console.log(object.hash);

            const collectionRef = _db.collection(objectCollection)
            const sameHashRef = collectionRef.doc(object.hash);
            const sameHash = await sameHashRef.get()

            if (!sameHash.exists) { //skip upload if there's already a document with the same hash
                ret.hash = object.hash

                if (object.id === ret.id) {
                    object.id = uuid.v4();
                    ret.id = object.id;
                }

                object.timestamp = Date.now();
                ret.timestamp = object.timestamp;
                ret.obj = object;
            } else {
                ret.errors = "Object with same hash found, push not attempted."
            }
        } else {
            ret.errors = _ajv.errors;
        }
    } else {
        ret.validity = false;
        ret.errors = "Input object does not have a valid type field: " + JSON.stringify(object);
    }

    return new Promise ((resolve, reject) => {
        if (ret.errors === false)
        { resolve(ret); }
        else
        { reject(ret); }
    })
}

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

let _addUnit = async (unit) => {
    let specificUnitRef = _db.collection('ingredient-metadata').doc('specific-units');
    if (typeof unit === 'string'){
        specificUnitRef.get().then((doc) => {
            let newkeys = doc.get('keys');
            if (!newkeys.includes(unit)){
                newkeys.push(unit);
            }
        })
    }
}

let _push = (candidate) => {
    if (_validate(candidate)){
        switch (candidate.type) {
            case 'ingredient':

                break;
            case 'step':
                break;
            case 'recipe':
                break;
        }
        _stampObject(candidate).then((ret) => {

        })
    }
}

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
