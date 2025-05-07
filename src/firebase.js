
// Replace with your actual Firebase config values
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmMp0ocvb2C5nq3j291cER0QMgl8PP4Fk",
  authDomain: "match-reports-29520.firebaseapp.com",
  projectId: "match-reports-29520",
  storageBucket: "match-reports-29520.firebasestorage.app",
  messagingSenderId: "4203146844",
  appId: "1:4203146844:web:2764068b110a1b66ec8099",
  measurementId: "G-9CX41WDKQH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
