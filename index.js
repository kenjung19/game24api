const functions = require('firebase-functions');
const app = require('./server'); // Adjust the path as necessary

exports.app = functions.https.onRequest(app);