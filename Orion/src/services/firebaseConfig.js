// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage'; // This is the correct import
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyDADuvas0XD0e670921SnC49NirndOkUq8",
    authDomain: "expressechezvous.firebaseapp.com",
    projectId: "expressechezvous",
    storageBucket: "expressechezvous.appspot.com",
    messagingSenderId: "239807401850",
    appId: "1:239807401850:web:2bc93b7f94ee4fd7b910c3",
    measurementId: "G-MT0LS7ERMP"
  };

  if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }


export { firebase };
