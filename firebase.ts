// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

/*
 * TEMPORARILY DISABLED — Firebase init is commented out so the app runs
 * without the VITE_APP_* env keys (it was throwing auth/invalid-api-key).
 * To re-enable: uncomment the imports above and this block, and delete the
 * two `null` stubs below.
 *
 * const firebaseConfig = {
 *   apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
 *   authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
 *   projectId: import.meta.env.VITE_APP_PROJECTID,
 *   storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
 *   messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
 *   appId: import.meta.env.VITE_APP_APPID,
 * };
 *
 * // Initialize Firebase
 * const app = initializeApp(firebaseConfig);
 * export const auth = getAuth(app);
 * export const db = getFirestore(app);
 */

// Stubs while Firebase is disabled (typed so callers still compile).
const app = null;
export const auth = null as Auth | null;
export const db = null as Firestore | null;

export const getIdToken = (forceRefresh = false) => {
  // was: const authInstance = getAuth();
  const authInstance = auth;
  authInstance?.currentUser
    ?.getIdToken(forceRefresh)
    .then(function (idToken) {
      console.log("ID token:", idToken);
      if (idToken) sessionStorage.setItem("authToken", idToken);
      return idToken;
    })
    .catch(function (error) {
      console.error("Error getting ID token:", error);
      throw error;
    });
};

export default app;
