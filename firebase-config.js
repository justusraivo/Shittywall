// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // Firebase-konfiguraatio
  apiKey: "AIzaSyD7uUEA1ktWqFC3rShiOsnQcjQIDmo4wRI",
  authDomain: "shittywall.firebaseapp.com",
  projectId: "shittywall",
  storageBucket: "shittywall.appspot.com",
  messagingSenderId: "1044971304901",
  appId: "1:1044971304901:web:85e6d5f895ea8a54303dac",
  measurementId: "G-K8PFZHC70N",
  databaseURL: "https://shittywall-default-rtdb.europe-west1.firebasedatabase.app"
};


const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

// Huomaa muuttujien erilaiset nimet tässä
const firestoreStorage = getStorage(app);
const appStorage = app.storage();