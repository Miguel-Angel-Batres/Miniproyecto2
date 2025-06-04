const fs = require('fs');
const path = require('path');

const fileContent = `
export const firebaseConfig = {
  apiKey: '${process.env.VITE_FIREBASE_API_KEY}',
  authDomain: '${process.env.VITE_FIREBASE_AUTH_DOMAIN}',
  projectId: '${process.env.VITE_FIREBASE_PROJECT_ID}',
  storageBucket: '${process.env.VITE_FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${process.env.VITE_FIREBASE_APP_ID}',
  measurementId: '${process.env.VITE_FIREBASE_MEASUREMENT_ID}',
};

export const recaptchav2Config = {
  v2SiteKey: '${process.env.VITE_RECAPTCHA_SITE_KEY}',
};
`;

fs.writeFileSync(
  path.resolve(__dirname, '../src/env.ts'),
  fileContent.trim(),
  'utf8'
);

console.log('✅ env.ts generado correctamente.');
