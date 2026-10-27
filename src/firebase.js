import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBC8zadGVSXkpNkHXlZ7Zyl2UezZv5paA",
  authDomain: "softedge-8b745.firebaseapp.com",
  projectId: "softedge-8b745",
  storageBucket: "softedge-8b745.firebasestorage.app",
  messagingSenderId: "525913828102",
  appId: "1:525913828102:web:26fcc670c519ba7fd8cc87",
  measurementId: "G-ZMGQ24KKYS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();