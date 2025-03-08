import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECTID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export const getIdToken = (forceRefresh = false) => {
  const authInstance = getAuth();
   authInstance?.currentUser?.getIdToken(forceRefresh)
    .then(function(idToken) {
      console.log("ID token:", idToken);
      if(idToken) sessionStorage.setItem("authToken",  idToken);
      return idToken;
    })
    .catch(function(error) {
      console.error("Error getting ID token:", error);
      throw error;
    });
}

export default app;
