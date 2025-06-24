// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBoKLDspI4YeHJw0J6krS6tSN8WIvlT5sQ",
  authDomain: "guardian-lock-fc1aa.firebaseapp.com",
  databaseURL:
    "https://guardian-lock-fc1aa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guardian-lock-fc1aa",
  storageBucket: "guardian-lock-fc1aa.firebasestorage.app",
  messagingSenderId: "308099715960",
  appId: "1:308099715960:web:05de8acac0d6cb08aa2e8d",
  measurementId: "G-5R3XLJNYLS",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
