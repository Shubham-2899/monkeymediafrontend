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

const userAuthContext = createContext<AuthContextModel>({} as AuthContextModel);

// Firebase is temporarily disabled in /firebase.ts; auth calls fail with a clear message.
function requireAuth() {
  if (!auth) throw new Error("Sign-in is temporarily unavailable: Firebase is disabled (see firebase.ts).");
  return auth;
}

export function useAuth(): AuthContextModel {
  return useContext(userAuthContext);
}

export function UserAuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [login, setLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  async function logIn(email: string, password: string) {
    //   const persistence = false  //remember me functionality
    //  ? auth.Persistence.LOCAL
    //  : auth.Auth.Persistence.SESSION;
    await setPersistence(requireAuth(), browserSessionPersistence);
    const res: any = await signInWithEmailAndPassword(requireAuth(), email, password);
    const token = res?.user?.accessToken;
    if (token) {
      sessionStorage.setItem("authToken", token);
      const decodedToken: any = jwtDecodeFn(token);

      // Check if the token has the 'admin' claim
      if (decodedToken?.admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    return res;
  }
  function signUp(email: string, password: string, username: string) {
    console.log("username:", username);
    setLogin(false);
    return createUserWithEmailAndPassword(requireAuth(), email, password);
  }
  function logOut() {
    return signOut(requireAuth());
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(requireAuth(), email);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(requireAuth(), googleAuthProvider);
  }

  useEffect(() => {
    // Firebase disabled: no user session; stop the loading state so pages render.
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      setUser(currentuser);
      setLoading(false);
      /**
       * sessionStorage.getItem("authToken")  is redundant as we can directly get the token from currentuser
       * const token = await currentUser.getIdTokenResult();
       * setIsAdmin(token.claims.admin || false);
       */
      const token = sessionStorage.getItem("authToken");
      if (token) {
        setLogin(true);
        // Decode the JWT token
        const decodedToken: any = jwtDecodeFn(token);
        // Check if the token has the 'admin' claim
        if (decodedToken?.admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
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
