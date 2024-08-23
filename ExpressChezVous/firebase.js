import firebase from 'firebase/compat/app'; // Utilise la version compat pour éviter des conflits avec Firebase 9+
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCFRUpvCyqVOBFj2nEQIP8UMaKLBO3T0MM",
  authDomain: "expressechezvous.firebaseapp.com",
  projectId: "expressechezvous",
  storageBucket: "expressechezvous.appspot.com",
  messagingSenderId: "239807401850",
  appId: "1:239807401850:android:623a4ec307ef28f0b910c3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
