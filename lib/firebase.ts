import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDl1o9FNELELQnqbOwSO70lbxaHZwc6HBI",
    authDomain: "sivas-kirala.firebaseapp.com",
    projectId: "sivas-kirala",
    storageBucket: "sivas-kirala.firebasestorage.app",
    messagingSenderId: "84959416683",
    appId: "1:84959416683:web:c14be93c54b400898d3c2e",
    measurementId: "G-92YC0FP10B"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
