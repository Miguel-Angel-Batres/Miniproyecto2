import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './env';

// Verifica si firebaseConfig está definido
if (!firebaseConfig) {
  throw new Error("El archivo .env no está configurado correctamente o firebaseConfig es undefined");
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore
export const db = getFirestore(app);

// Exporta la instancia de Auth
export const auth = getAuth(app);
