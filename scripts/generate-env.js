const fs = require('fs');
const path = require('path');

const fileContent = `
export const firebaseConfig = {
  apiKey: '${process.env.FIREBASE_API_KEY}',
  authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
  projectId: '${process.env.FIREBASE_PROJECT_ID}',
  storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${process.env.FIREBASE_APP_ID}',
  measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}',
};

export const recaptchav2Config = {
  v2SiteKey: '${process.env.RECAPTCHA_SITE_KEY}',
};
`;

fs.writeFileSync(
  path.resolve(__dirname, '../src/env.ts'),
  fileContent.trim(),
  'utf8'
);

console.log('✅ env.ts generado correctamente.');
