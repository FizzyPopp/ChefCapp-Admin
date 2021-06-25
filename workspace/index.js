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
const ccaDev = new Cca.CcApiEngine('CcApiEngine');

var bayleefID = "04be8ac2-bf5a-4df0-b18f-5f4b902256cb";
var frzavosID = "05d7a0f3-1d0b-4602-8777-0b8709b3a956";

var bayleefRef = ccaDev.db.collection('ingredients').doc(bayleefID);
var frzavosRef = ccaDev.db.collection('ingredients').doc(frzavosID);

bayleefRef.get().then((doc) => {
  return doc.data();
}).then((data) => {
  let one = data;
  one.name.plural = "toasted poop";

  bayleefRef.get().then((doc) => {
    return doc.data();
  }).then((data) => {
    let two = data;
    console.log(one);
    console.log(two);
    let diffRes = ccaDev.diff(two, one);
    console.log(JSON.stringify(diffRes, null ,2));
  }).catch((e) => {console.log(e);});
}).catch((e) => {console.log(e);});

// function dumpCollection(colname) {
//     cca.db.collection(colname).get()
//        .then(collectionSnapshot => {
//            let objList = {};
//            collectionSnapshot.forEach(docSnapshot => {
//                if (docSnapshot.exists) {
//                    console.log(docSnapshot.id);
//                    console.log(docSnapshot.data());
//                    objList[docSnapshot.id] = docSnapshot.data();
//                }
//            })
//            return objList;
//        }).then(objList => {
//            const data = JSON.stringify(objList);
//            fs.writeFile(colname + 'List.json', data, (err) => {
//                if (err) {
//                    throw err;
//                }
//                console.log("JSON data is saved.");
//            });
//        }).catch((e) => {
//            console.log(e);
//        })
// }


// collections.forEach((col) => {
//     let colData = require('./' + col + 'List.json');
//     for (let key in colData) {
//         console.log(key);
//         ccaDev.db.collection(col).doc(key).set(colData[key]);
//     }
// });
