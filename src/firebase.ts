import { firebaseConfig } from './env';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


if (!firebaseConfig) {
  throw new Error("El archivo .env no está configurado correctamente o firebaseConfig es undefined");
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
