// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCU7DbZiKfk_JbNIC5KOG2d37arKPXGpEE",
  authDomain: "medishare-dab86.firebaseapp.com",
  projectId: "medishare-dab86",
  storageBucket: "medishare-dab86.firebasestorage.app",
  messagingSenderId: "392692055719",
  appId: "1:392692055719:web:61fd02cd54adbc38d3e582"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
