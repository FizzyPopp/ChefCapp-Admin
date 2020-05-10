/**
 * @module cc-admin
 */


/**
 *  The modules required from Firebase
 */
var cc = require('firebase-admin')
var functions = require('firebase-functions')

var fs = require('fs')
var path = require('path')

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
})
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
}

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
}


/** @function recipeParse
 * Takes a recipe according to schema and parses it into a Firestore DB element
 * @exports
 */
exports.recipeParse = function (recipe_string) {
    if (typeof(recipe_string) === 'string') {
        //try (JSON.parse(recipe_string)
    }

    if (exports.recipeVerify(recipe)) {
        return recipe
    }
    else { throw 'Bad recipe format!'; }


}

/**
 * @func recipeVerify
 *
 * @param {Object} recipe -
 *
 * Returns true if [recipe] contains the fields required
 */
exports.recipeVerify = function (recipe) {
    if (
        recipe.steps === undefined ||
        recipe.title === undefined ||
        recipe.number_of_steps === undefined ||
        recipe.ingredients === undefined
    ) { return false }

    if (
        typeof(recipe.title) !== 'string' ||
        typeof(recipe.number_of_steps) !== 'string'
    )

    for (const step in recipe.steps) {
        if (
            step.num === undefined ||
            time_min === undefined ||
            time_max === undefined ||
            time_avg === undefined ||
            text === undefined
        ) { return false }
    }

    return isRecipe;
}
