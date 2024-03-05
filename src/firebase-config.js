// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACmfA_OuJTjF77UfJN5skDy8pUk6YAQUw",
  authDomain: "learning-6a02e.firebaseapp.com",
  projectId: "learning-6a02e",
  storageBucket: "learning-6a02e.appspot.com",
  messagingSenderId: "167877893495",
  appId: "1:167877893495:web:bee782b3e2ffb5d888d572"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
