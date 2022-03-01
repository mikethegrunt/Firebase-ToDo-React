import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import config from '../util/config.js';

const firebaseApp = initializeApp(config);

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth();

export { db, firebaseApp, storage, auth }