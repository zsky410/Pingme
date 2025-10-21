// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9hwSOQRA0SIfe03PJ3-0N67hrX_NIZPo",
  authDomain: "pingme-e32fb.firebaseapp.com",
  projectId: "pingme-e32fb",
  storageBucket: "pingme-e32fb.firebasestorage.app",
  messagingSenderId: "292732258763",
  appId: "1:292732258763:web:49d0318fbdfbd3adb10e4e",
  measurementId: "G-P3ZG9EGZ7C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
