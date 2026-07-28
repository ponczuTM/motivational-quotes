// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Dane konfiguracyjne Firebase (podane przez Ciebie)
const firebaseConfig = {
  apiKey: 'AIzaSyDFSgDII4Y1_z4OXuFzuHe12rB0t2puKsY',
  authDomain: 'przetargi-c7080.firebaseapp.com',
  databaseURL: 'https://przetargi-c7080-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'przetargi-c7080',
  storageBucket: 'przetargi-c7080.firebasestorage.app',
  messagingSenderId: '41621053378',
  appId: '1:41621053378:web:da936492c97d1f80a4805b',
  measurementId: 'G-25GP833V95',
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Pobranie referencji do Realtime Database
const database = getDatabase(app);

export { database };