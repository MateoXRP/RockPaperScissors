// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Load from environment variables (with VITE_ prefix)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);

// 🔧 Optional helpers for writing to leaderboard:
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc
} from "firebase/firestore";

export async function submitScore(db, playerName, wins, losses, ties) {
  const ref = doc(db, "leaderboard", playerName);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const data = existing.data();
    await updateDoc(ref, {
      wins: data.wins + wins,
      losses: data.losses + losses,
      ties: data.ties + ties
    });
  } else {
    await setDoc(ref, {
      name: playerName,
      wins,
      losses,
      ties
    });
  }
}

export async function fetchLeaderboard(db) {
  const snapshot = await getDocs(collection(db, "leaderboard"));
  const results = [];

  snapshot.forEach(doc => {
    results.push(doc.data());
  });

  results.sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses));
  return results;
}

