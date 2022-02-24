import { firebaseApp, db } from './admin.js';
import { getAuth, collection, where, query } from 'firebase/firestore';

const authToken = (request, response, next) => {
  let idToken;
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
    idToken = request.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return response.status(403).json({ error: 'Unauthorized' });
  }
  getAuth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      const userRef = collection(db, 'users');
      return query(userRef, where('userId', '==', request.user.uid).limit(1));
    })
    .then((data) => {
      request.user.username = data.docs[0].data().username;
      request.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch((err) => {
      console.error('Error while verifying token', err);
      return response.status(403).json(err);
    });
};

export { authToken };