import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '../util/admin.js';
import { validateLoginData, validateSignUpData } from '../util/validators.js';

const loginUser = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return response.status(400).json(errors);

  const auth = getAuth();

  signInWithEmailAndPassword(auth, user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token })
    })
    .catch((e) => {
      console.error(e);
      return response.status(403).json({ general: 'wrong username or password' });
    })
};

const signUpUser = (request, response) => {
  const newUser = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    phoneNumber: request.body.phoneNumber,
    country: request.body.country,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) return response.status(400).json(errors);

  let token, userId;

  const usernameRef = doc(db, 'users', newUser.username);
  getDoc(usernameRef)
    .then((doc) => {
      if (doc.exists()) {
        return response.status(400).json({ username: 'this username is already taken' });
      } else {
        const auth = getAuth();
        return createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idtoken) => {
      token = idtoken;
      const userCredentials = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        country: newUser.country,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return setDoc(doc(db, 'users', newUser.username), userCredentials)
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return response.status(400).json({ email: 'Email already in use' });
      } else {
        return response.status(500).json({ general: 'Something went wrong, please try again' });
      }
    });
};

export { loginUser, signUpUser };
