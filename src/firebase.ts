import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAWNZYXJizMQvkVW9UvogBJ9Z9g5fByUp8",
  authDomain: "changejob-718ae.firebaseapp.com",
  projectId: "changejob-718ae",
  storageBucket: "changejob-718ae.firebasestorage.app",
  messagingSenderId: "188980502622",
  appId: "1:188980502622:web:80ee1fe422435b76fd98cf",
  measurementId: "G-K3T884HZCV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

if (import.meta.env.DEV) {
  (auth as any).settings.appVerificationDisabledForTesting = true;
}

console.log(
  "Auth domain:", firebaseConfig.authDomain,
  "| API key:", (firebaseConfig.apiKey ?? "").slice(0,4) + "…"
);
