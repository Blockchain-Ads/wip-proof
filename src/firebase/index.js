// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKAE0BUZv2ZbSQ5bJaEmtq0Jbjmc_t8N0",
  authDomain: "the-web3-cookie.firebaseapp.com",
  projectId: "the-web3-cookie",
  storageBucket: "the-web3-cookie.appspot.com",
  messagingSenderId: "367759942037",
  appId: "1:367759942037:web:2203b7269c9dffc042d69c",
  measurementId: "G-98P2Y00F8C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);