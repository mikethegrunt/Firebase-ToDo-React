import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage, auth } from '../util/admin.js';
import { validateLoginData, validateSignUpData } from '../util/validators.js';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

let userData;

onAuthStateChanged(auth, user => {
  if (user) {
    userData = user
    console.log(user.uid);
  } else {
    null;
  }
});

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

// const deleteImage = (imageName) => {
//   const path = ref(storage, `${imageName}`);
//   return deleteObject(path)
//     .then(() => {
//       return
//     })
//     .catch(() => {
//       return
//     })
// };

const uploadProfilePhoto = (request, response) => {

  const imageRef = ref(storage, 'mountains123.png');

  const metadata = {
    contentType: 'image/png',
  };

  const uploadTask = uploadBytesResumable(imageRef, request.files[0].buffer, metadata);

  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      switch (error.code) {
        case 'storage/unauthorized':
          break;
        case 'storage/canceled':
          break;
        case 'storage/unknown':
          break;
      }
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
      });
    }
  );
  response.send();
};

const getUserDetail = (request, response) => {
  const userUid = userData.uid;
  // const auth = getAuth();
  // const user = auth.user.getIdToken();
  console.log(userUid)
  // const usernameRef = doc(db, 'users', request.user.username)
  // getDoc(usernameRef)
  //   .then((doc) => {
  //     if (doc.exists) {
  //       userData.userCredentials = doc.data();
  //       return response.json(userData);
  //     }
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     return response.status(500).json({ error: error.code });
  //   });
  response.send();
};


export { loginUser, signUpUser, getUserDetail, uploadProfilePhoto };
