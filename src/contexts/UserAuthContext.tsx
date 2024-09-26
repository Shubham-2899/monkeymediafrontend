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
    await setPersistence(auth, browserSessionPersistence);
    const res: any = await signInWithEmailAndPassword(auth, email, password);
    const token = res?.user?.accessToken;
    if (token) {
      sessionStorage.setItem("authToken", token);
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
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      setUser(currentuser);
      setLoading(false);
      setLogin(true);
      const token = sessionStorage.getItem("authToken");
      if (token) {
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
