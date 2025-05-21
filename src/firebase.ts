// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyB1z6sEMQnavvuOfcPJKv_kpKjuCESGLfA",
  authDomain: "proyecto-final-santa-cruz.firebaseapp.com",
  projectId: "proyecto-final-santa-cruz",
  storageBucket: "proyecto-final-santa-cruz.firebasestorage.app",
  messagingSenderId: "525271498623",
  appId: "1:525271498623:web:466f3d6bc57a799938244a",
  measurementId: "G-L0QWYNZ970"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);

