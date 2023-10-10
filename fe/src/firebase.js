// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-942b2.firebaseapp.com",
  projectId: "mern-estate-942b2",
  storageBucket: "mern-estate-942b2.appspot.com",
  messagingSenderId: "482828988249",
  appId: "1:482828988249:web:7b2135cd0330f88d77e648"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);