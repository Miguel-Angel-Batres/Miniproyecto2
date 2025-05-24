const admin = require('firebase-admin');
const serviceAccount = require('./proyecto-final-santa-cruz-firebase-adminsdk-fbsvc-4602c6c697.json'); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://proyecto-final-santa-cruz.firebaseio.com'
});

module.exports = admin;
