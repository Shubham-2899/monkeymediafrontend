import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  setPersistence,
  sendPasswordResetEmail,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../../firebase";
import { AuthContextModel, AuthProviderProps } from "../Interfaces/index";
import { jwtDecode as jwtDecodeFn } from "jwt-decode";
import { 
  getMaxSessionDuration, 
  getTokenRefreshInterval, 
  isSessionExpired 
} from "../config/auth.config";

interface DecodedToken {
  admin?: boolean;
  [key: string]: unknown;
}

const userAuthContext = createContext<AuthContextModel>({} as AuthContextModel);

export function useAuth(): AuthContextModel {
  return useContext(userAuthContext);
}

export function UserAuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [login, setLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  async function logIn(email: string, password: string) {
    await setPersistence(auth, browserSessionPersistence);
    const res = await signInWithEmailAndPassword(auth, email, password);
    
    // Get fresh token from the user object
    if (res?.user) {
      const token = await res.user.getIdToken();
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("loginTime", Date.now().toString());
      
      const decodedToken = jwtDecodeFn<DecodedToken>(token);
      setIsAdmin(decodedToken?.admin || false);
    }
    
    return res;
  }
  function signUp(email: string, password: string, username: string) {
    console.log("username:", username);
    setLogin(false);
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function logOut() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
      setUser(currentuser);
      setLoading(false);
      
      if (currentuser) {
        // Get fresh token and store it
        try {
          const token = await currentuser.getIdToken();
          sessionStorage.setItem("authToken", token);
          setLogin(true);
          
          // Decode the JWT token to check admin claim
          const decodedToken = jwtDecodeFn<DecodedToken>(token);
          setIsAdmin(decodedToken?.admin || false);
          
          // Store login timestamp for absolute session timeout
          const loginTime = sessionStorage.getItem("loginTime");
          if (!loginTime) {
            sessionStorage.setItem("loginTime", Date.now().toString());
          }
          
          // Set up automatic token refresh every 50 minutes (before 60min expiry)
          const refreshInterval = setInterval(async () => {
            try {
              // Check if absolute session timeout has been reached
              const loginTimestamp = parseInt(sessionStorage.getItem("loginTime") || "0");
              
              if (isSessionExpired(loginTimestamp)) {
                console.log(`Session expired after ${getMaxSessionDuration() / (60 * 60 * 1000)} hours - logging out`);
                clearInterval(refreshInterval);
                sessionStorage.clear();
                await signOut(auth);
                window.location.href = "/signin?reason=session_expired";
                return;
              }
              
              console.log("Proactively refreshing token...");
              const freshToken = await currentuser.getIdToken(true);
              sessionStorage.setItem("authToken", freshToken);
              console.log("Token refreshed successfully");
            } catch (error) {
              console.error("Error refreshing token:", error);
              clearInterval(refreshInterval);
            }
          }, getTokenRefreshInterval());
          
          // Clean up interval on unmount or user change
          return () => clearInterval(refreshInterval);
        } catch (error) {
          console.error("Error getting initial token:", error);
        }
      } else {
        setLogin(false);
        setIsAdmin(false);
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("loginTime");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const values = {
    user,
    logIn,
    signUp,
    logOut,
    googleSignIn,
    login,
    setLogin,
    isAdmin,
    loading,
    resetPassword,
  };

  return (
    <userAuthContext.Provider value={values}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
