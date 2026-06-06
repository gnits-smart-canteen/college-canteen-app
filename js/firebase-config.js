import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3DJl3B9InTEIsVKKlId5jMWBmPPgkZrI",
  authDomain: "college-canteen-app-1f971.firebaseapp.com",
  projectId: "college-canteen-app-1f971",
  storageBucket: "college-canteen-app-1f971.firebasestorage.app",
  messagingSenderId: "663133910434",
  appId: "1:663133910434:web:7f98c471f171041a586efb",
  measurementId: "G-VW1Y2TL73B"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
window.db = db;
