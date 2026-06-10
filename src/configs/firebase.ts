import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, EmailAuthProvider, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getDownloadURL, getStorage, ref, uploadBytes, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const emailAuthProvider = new EmailAuthProvider();
const functions = getFunctions(app, 'asia-northeast1');
const storage = getStorage(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export {
  auth,
  onAuthStateChanged,
  signOut,
  emailAuthProvider,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  onSnapshot,
  functions,
  httpsCallable,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
};
export default db;
