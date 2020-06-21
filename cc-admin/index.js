/**
 * @module cc-admin
 */


/**
 *  The modules required from Firebase
 */
var admin = require('firebase-admin');
var funcs = require('firebase-functions');
var fs = require('fs');
var path = require('path');
var Ajv = require('ajv');
const { v4 : uuid } = require('uuid');

/**
 * Name of module
 * @exports
 */
exports.name = 'cc-admin';

/**
 * The js representation of the ChefCapp firebase application, used to access
 * and authorize admin functions.
 * @exports
 */
var _app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
});

exports.firebase = _app;


/**
 * The Firestore database associated with ChefCapp
 * @exports
 */
var _firestore = admin.firestore();
exports.db = {};
exports.db.firestore = _firestore;

/**
 * List of data schemas which defines the data structures to be loaded into the
 * database. Generated on module load based on included schemas within the pack.
 * @exports
 */
var _schemas = {};
let _schemaDirs = [
    __dirname + "/" + "schemas/atomic/",
    __dirname + "/" + "schemas/"
    ];
let _schemaRegExp = /\.schema\.json$/;
var _ajv = new Ajv({
    verbose: false
});

/**
 * Programmatically trawl through the schema directories and load in each schema
 * found by the schemaRegExp. When found, attach schema to internal _ajv instance.
 */
_schemaDirs.forEach ((root) => {
    let fileList = fs.readdirSync (root);
    fileList.forEach ((file) => {
        if (file.match(_schemaRegExp)) {
            let uri = root + file;
            console.log('Importing schema: ' + uri);

            var schema = require(uri);
            _schemas[schema.title] = schema;

            _ajv.addSchema(schema, schema.title);
        }
    });
});
exports.db.schemas = _schemas;
exports.db.types = Object.keys(_schemas);

/**
 * Instanced ajv object, mainly used to build validator functions
 * @exports
 */
exports.ajv = _ajv;

/**
 * Validator functions compiled by ajv from the loaded _schemas
 * @exports
 */
var _validators = {};
for (let title in _schemas) {
    console.log("Compiling ajv schema validator function for: " + title);
    _validators[title] = exports.ajv.compile(_schemas[title]);
}
exports.validators = _validators;




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
exports.db.getCollection = function (colName) {
    if (typeof(colName) === 'string') {
        return exports.db.collection(colName)
                      .catch(err => {
                          console.log('Couldnt get collection ' + colName + ' , idk whats going on', err);
                      });
    }
    else{ throw "Collection name must be a string."; }
};

/**
 * @func getObject
 * Returns object from named collection with given ID (uuid v4)
 *
 * @exports
 */
exports.db.getObject = function (colName, uuid) {
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

//TODO
exports.push = (instance) => {

}


/** @function parse
 * Takes a candidate data object, looks up its schema and parses it into a Firestore DB element - this function
 * expects complete data at each of its sublevels - not DB pointer representations
 * @exports
 * @param{Object} candidate - a candidate for parsing into a complex DB object (e.g. recipes, ingredients)
 * @param{function} callback - callback function, the instance (on success) and errors are passed through when they exist.
 */
exports.parse = function (callback, candidate) {
    let schemas = exports.schemas; // makes it a bit easier on the eyes
    let instance = {};

    if (Object.keys(schemas).includes(candidate.dataType) === false) {
        throw new Error.TypeError;
    }
    else {
        let candidateSchema = schemas[candidate.dataType];
        for (let property in candidateSchema.requires) {
            if (candidate[property] === null) {
                throw new Error.TypeError;
            }
            else {
                exports.validate(candidate[property])
                       .then ((r) => {
                           if (r.validity === false) { throw r.errors; }
                           else {
                               instance[property] = candidate[property];
                           }
                       })
                       .catch ((e) => {
                           throw e;
                       });
            }
        }
    }

    if (callback) {
        return callback (ajv.errors, candidate);
    }

    return instance;
};

/**
 * @func find
 * Takes an unknown object with only characteristic fields, tries to match characterstic fields with existing
 * objects in specified type database.
 *
 * Potential fields:
 * - uuid (just use fetch from db instead)
 * - tags
 * - name
 */
exports.db.find = async function (type, data) {
    let db = exports.db.firestore;

}

/**
 * @func validate
 * Wraps the ajv validation function with async, then checking and throwing untyped object errors.
 * This is the sound of me screaming for monads.
 * @param {Object} data - Some object to be validated against schema
 */
exports.validate = async function (data){
    if (data.dataType != null){
        ret = {
            errors: null
        };

        ret.validity = await exports.ajv.validate(data.dataType, data);

        if (ret.validity === false){
            ret.errors = exports.ajv.errors;
        }
        return ret;
    }
    else {
         throw new Error.TypeError;
    }
};


exports.buildRecipe = function (nodeID) {
    let components = [];
    let node = getRecipe(nodeID);

    if (typeof node.components === "undefined") {
        return node;
    }
    else {
        for (let childID in node.components) {
            let child = buildRecipe(childID);
            node.components.push(child);
        }

        for (let child in components) {
            for (let id in child.ingredients.keys) {
                if (typeof node.ingredients.name[id] === "undefined") {
                    // construct new ingredient object in current node
                    node.ingredients[id] = child.ingredients[id];
                } else {
                    node.ingredients[id] += child.ingredients[i]
                }
            }
            for (let field in node.required) {
                for (let item in child[field]) {
                    if (unionList.contains(field)) {
                        node[field].push(item);
                    }
                    else { if (sumList.contains(field)) {
                        node[field] = node[field] + child[field];
                    }}
                }
            }
        }
    }
};
