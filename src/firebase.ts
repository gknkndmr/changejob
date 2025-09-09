// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Firestore / Storage kullanacaksan yorumları aç
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId opsiyonel; varsa analytics’i açarız
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
};

// SSR / HMR sırasında birden fazla init'i önlemek için:
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Temel servisler:
export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// Analytics (yalnızca destekleniyorsa ve tarayıcıda):
export let analytics: Analytics | undefined = undefined;
isSupported().then((ok) => {
  if (ok && typeof window !== "undefined" && location.protocol === "https:") {
    analytics = getAnalytics(app);
  }
});
