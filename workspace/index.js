'use strict'
const fs = require('fs');


var collections = [
    'recipe',
    'ingredient',
    'ingredients',
    'step',
    'recipe-metadata',
    'ingredient-metadata',
    'step-metadata',
]

if (process.argv.length > 2) {
    collections = process.argv.slice(2);
}

const Cca = require('@chefcapp/chefcapp-api-engine');
// const cca = new Cca.CcApiEngine();
const ccaDev = new Cca.CcApiEngine('CcApiEngine', true);

function dumpCollection(colname) {
    cca.db.collection(colname).get()
       .then(collectionSnapshot => {
           let objList = {};
           collectionSnapshot.forEach(docSnapshot => {
               if (docSnapshot.exists) {
                   console.log(docSnapshot.id);
                   console.log(docSnapshot.data());
                   objList[docSnapshot.id] = docSnapshot.data();
               }
           })
           return objList;
       }).then(objList => {
           const data = JSON.stringify(objList);
           fs.writeFile(colname + 'List.json', data, (err) => {
               if (err) {
                   throw err;
               }
               console.log("JSON data is saved.");
           });
       }).catch((e) => {
           console.log(e);
       })
}


collections.forEach((col) => {
    let colData = require('./' + col + 'List.json');
    for (let key in colData) {
        console.log(key);
        ccaDev.db.collection(col).doc(key).set(colData[key]);
    }
});
