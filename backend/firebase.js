const admin = require('firebase-admin');
const serviceAccount = require('./ruta/a/tu/serviceAccountKey.json'); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://proyecto-final-santa-cruz-default-rtdb.firebaseio.com' 
});

module.exports = admin;
