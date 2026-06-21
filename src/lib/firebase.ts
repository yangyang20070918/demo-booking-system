import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-_lDey-3vlLuETjxvs8S7jZ8Q2wflzb0",
  authDomain: "booking-sys-portfolio.firebaseapp.com",
  projectId: "booking-sys-portfolio",
  storageBucket: "booking-sys-portfolio.firebasestorage.app",
  messagingSenderId: "805121988912",
  appId: "1:805121988912:web:c880b16ab321cbac17d0f5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
