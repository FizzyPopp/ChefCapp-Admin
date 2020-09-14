const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


// exports.addToWaitingList = functions.https.onRequest((req, res) => {
//     if (req.body.email) {
//         var maillingListRef = admin.firestore().collection('communication').doc('maillingList');
//         mailingListRef.update({
//             waitingList: admin.firestore.FieldValue.arrayUnion(req.body.email)
//         })
//     }
//     return
// })
// // // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
