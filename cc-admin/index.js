#!/usr/bin/env node

// firebase includes
var admin = require('firebase-admin')
var functions = require('firebase-functions')

// node libraries
var fs = require('fs')
var path = require('path')

const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://chef-capp.firebaseio.com"
})

const db = admin.firestore();

exports.db = db;
exports.app = app;

exports.getCollection = function (colName) {
    return exports.db.collection(colName)
}

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
