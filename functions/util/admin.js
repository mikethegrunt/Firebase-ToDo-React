import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../util/config.js';

const firebaseApp = initializeApp(config);

const db = getFirestore(firebaseApp)

export { db, firebaseApp }