'use strict'

/**
 * @module cc-admin
 */
const crypto = require('crypto');
const uuid = require('uuid');
const deserializeInstructions = require('./lib/utils/stringifyInstructions');
const msg = require('./lib/utils/msg')
      .name('CCA');
const strfy = require('./lib/utils/strfy')
      .space(2);
var _admin = require('firebase-admin');
var _funcs = require('firebase-functions');
var _schemas = require('./lib/schemas')
    .init(__dirname);
var _Ajv = require('ajv');
var _ajv = new _Ajv({verbose: true});
var _parser = require('./lib/parser');


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
 * @func buildRecipe
 * Takes an list of steps and builds a linked list, along with a
 * Steps are individually validated, if validation is unsuccessful,
 * throw error with object.
 *
 * @exports
 */
let _buildRecipe = async (candidate) => {
    let ret = {
        errors: [],
        stepsCandidate: candidate,
        recipeCandidate: {},
        stampedSteps: [],
    };

    if (Array.isArray(candidate) === false) {
        ret.errors.push('candidate is not an array: ' + JSON.stringify(candidate));
    }

    let recipe = {
        type: "recipe",
        id: uuid.NIL,
        name: "",
        tags: [],
        time: {
            cook: 0,
            prepare: 0,
        },
        ingredients: {
            keys:[]
        },
        steps: []
    }

    candidate.forEach((step) => {
        let parsedInstructions = _parser.transform(step.instructions);
        step.instructions = parsedInstructions;
        step.type = 'step';
        let vResult = _validate(step);
        if (vResult.errors) {
            ret.errors.push(vResult.errors);
            ret.step = step;
        }
    })


    if (candidate[0].id === uuid.NIL) {
        candidate[0].prev = uuid.NIL;
        candidate[0].id = uuid.v4();
    }

    for (let i = 1 ; i < candidate.length - 2 ; i++) {
        candidate[i].prev = candidate[i-1].id;
        if (candidate[i].id === uuid.NIL) {
            candidate[i].id = uuid.v4();
        }
        candidate[i-1].next = candidate[i].id;
    }

    let end = candidate.length-1;
    if (candidate[end].id === uuid.NIL) {
        candidate[end].next = uuid.NIL;
        candidate[end].id = uuid.v4();
        candidate[end].prev = candidate[end-1].id;
    }

    for (let step of candidate ) {
        await _stampObject(step, 'step').then((res) => {
            // msg(ret.stampedSteps)
            ret.stampedSteps.push(res.obj);
        }).catch((err) => {
            ret.errors.push(err.errors);
        });
    }

    candidate.forEach((step) => {
        recipe.steps.push(step.id);
        step.ingredients.keys.forEach((key) => {
            if (recipe.ingredients.keys.includes(key) === false) {
                recipe.ingredients.keys.push(key);
                recipe.ingredients[key] = step.ingredients[key];
            } else {
                recipe.ingredients[key].quantity += step.ingredients[key].quantity;
            }
        })

    })
    // msg('stampedSteps: ' + strfy(ret.stampedSteps));
    ret.recipeCandidate = recipe;

    return new Promise ((resolve, reject) => {
        if (ret.errors.length === 0)
        {
            msg("returning: " + strfy(ret));
            ret.errors = null;
            resolve(ret);
        } else
        {
            msg("returning: " + strfy(ret));
            reject(ret);
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
let _find = (candidate) => {
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
 * @func stampObject
 *
 * Takes candidate object, validates and injects timestamp and hash in a canonical way
 *
 * @returns {Promise} ret - {id <uuid>, hash<string>, errors<null|object>, validity<boolean>, timestamp<number>, obj<object>
 */
let _stampObject = async (object, type) => {
    let ret = {
        id: uuid.NIL,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', //this is the sha256 hash of empty string
        errors: [],
        validity: false,
        timestamp: -1,
        obj: object
    };

    if (object.type === type && dbTypes.includes(object.type)) {
        ret.validity = _schemas.validate[object.type](object);
        if ( ret.validity ) {
            const objectCollection = object.type;
            object.hash = _hash(object);
            msg('hashed incoming object: ' + object.hash);

            const collectionRef = _db.collection(objectCollection)
            const sameHashRef = collectionRef.doc(object.hash);
            const sameHash = await sameHashRef.get()

            if (!sameHash.exists) { //skip upload if there's already a document with the same hash
                ret.hash = object.hash
                if (object.id === uuid.NIL) {
                    object.id = uuid.v4();
                }
                ret.id = object.id;

                object.timestamp = Date.now();
                ret.timestamp = object.timestamp;

                ret.obj = object;
                msg('Stamped incoming object with id: ' + object.id);
            } else {
                ret.errors.push("Object with same hash found.");
            }
        } else {
            ret.errors.push(_schemas.validate[object.type].errors);
        }
    } else {
        ret.validity = false;
        ret.errors.push("Input object does not have a valid type field: " + JSON.stringify(object));
    }

    return new Promise ((resolve, reject) => {
        if (ret.errors.length === 0) {
            ret.errors = null
            resolve(ret);
        } else {
            reject(ret);
        }
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

    if (dbTypes.includes(candidate.type)) {

        ret.validity = _ajv.validate(candidate.type, candidate);

        if (ret.validity === false) {
            ret.errors = _ajv.errors;
        }

        return ret;
    }
    ret.errors = "Object has no valid type field.";
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

let _confirmRecipe = (candRecipe, candSteps) => {
    let ret = {
        errors: [],
        validity: false
    };

    if (candRecipe.steps.length === candSteps.length) {
        for (let i = 0 ; i < candSteps.length ; i++) {
            if(candSteps[i].id != candRecipe.steps[i]) {
                ret.errors.push('ID mismatch - recipe has: ' + candRecipe.steps[i] + ' | step has: ' + candSteps[i].id);
            }
            if (i > 0) {
                if (candSteps[i].previous != candSteps[i-1].id) {
                    ret.errors.push('Step link mismatch - expected previous step id: ' + candSteps[i].previous + ', got: ' + candSteps[i-1].id );
                }
            }
            if( i < candSteps.length-1 ) {
                if (candSteps[i].next != candSteps[i+1].id){
                    ret.errors.push('Step link mismatch - expected next step id: ' + candSteps[i].next + ', got: ' + candSteps[i+1].id );
                }
            }
            candSteps[i].ingredients.keys.forEach((id) => {
                if (candRecipe.ingredients.keys.includes(id) === false) {
                    ret.errors.push('Found unrecorded ingredient in step: ' + candSteps[i].id + ', with ingredient id: ' + id);
                }
            })
        }
    } else {
        ret.errors.push('Unequal lengths of recipe.steps versus candidate steps array');
    }

    if (ret.errors.length === 0) {
        ret.errors = null
        ret.validity = true;
    }
    return ret;
}

let _pushIngredient = async (candidate) => {
    let ret = {
        errors: [],
        recipeCandidate: candidate
    }
    candidate.type = 'ingredient';
    const candidateRef = _db.collection('ingredient').doc(candidate.hash)
    return candidateRef.set(candidate)
}

let _pushStep = async (candidate) => {
    candidate.type = 'step';
    const candidateRef = _db.collection('step').doc(candidate.hash)
    return candidateRef.set(candidate)
}

let _pushRecipe = async (candRecipe, steps) => {
    let ret = {
        errors: [],
        writeResults: {}
    };

    var recipe = {}
    try {
        recipe = await _stampObject(candRecipe,'recipe')
        msg('Recipe is stamped with hash  ' + recipe.hash)
    } catch (e) { ret.errors.push(e) }

    for (let step of steps) {
        if (step.hash && step.timestamp) {
            const stepRef = _db.collection('step').doc(step.hash)
            try {
                msg('pushing step id: ' + step.id + ' | hash: ' + step.hash);
                ret.writeResults[step.id] = await stepRef.set(step);
            } catch (e) { ret.errors.push(e); }
        } else {
            ret.errors.push({
                id: step.id,
                message: 'Step with id ' + step.id + ' is not stamped skipping.'
            });
        }
    }

    if (ret.errors.length === 0 ) {
        const recipeRef = _db.collection('recipe').doc(recipe.hash)
        try {
            msg('pushing recipe id: ' + recipe.id + ' | hash: ' + recipe.hash);
            ret.writeResults[recipe.id] = await recipeRef.set(recipe);
        } catch (e) { ret.errors.push(e); }
    }

    return new Promise ((resolve, reject) => {
        if (ret.errors.length === 0) {
            ret.errors = null
            resolve(ret);
        } else {
            reject(ret);
        }
    })
}



let _pushObject = async (candidate, type) => {
    msg('pushing obj with id: ' + candidate.id + ' | type: ' + type);
    if (dbTypes.includes(type)){
        const candidateRef = _db.collection(type).doc(candidate.hash)
        return candidateRef.set(candidate)
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
exports.parser = _parser;
exports.db.buildRecipe = _buildRecipe;
exports.db.confirmRecipe = _confirmRecipe;
exports.db.stampObject = _stampObject;
exports.db.pushIngredient = _pushIngredient;
exports.db.pushStep = _pushStep;
exports.db.pushRecipe = _pushRecipe;
exports.db.pushObject = _pushObject;
