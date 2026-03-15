// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Importera Firebase Authentication
import { getFirestore } from "firebase/firestore"; // Importera Firestore
import { getDatabase } from "firebase/database"; // Importera Realtime Database
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_NYZcFywYn79gYX464Te7xG7K1nmfteU",
  authDomain: "polis-api-e1ad3.firebaseapp.com",
  databaseURL: "https://polis-api-e1ad3-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "polis-api-e1ad3",
  storageBucket: "polis-api-e1ad3.firebasestorage.app",
  messagingSenderId: "810292831760",
  appId: "1:810292831760:web:ff1fb2f3141dc5e1cf8c95",
  measurementId: "G-GQL44WNYTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);  // Exportera Firebase Authentication
export const firestore = getFirestore(app);  // Exportera Firestore
export const realtimeDb = getDatabase(app); // Exportera Realtime Database