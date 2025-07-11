import { Auth, User, UserCredential } from "firebase/auth";
import { ReactNode } from "react";

export interface AuthProviderProps {
  children?: ReactNode;
}

export interface UserContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  id?: string;
}

export interface AuthContextModel {
  auth?: Auth;
  user: User | null;
  login: Boolean;
  isAdmin: Boolean;
  loading: Boolean;
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logIn(email: string, password: string): Promise<void | UserCredential>;
  signUp(
    email: string,
    password: string,
    username: string
  ): Promise<UserCredential>;
  sendPasswordResetEmail?: (email: string) => Promise<void>;
  logOut(): Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
  resetPassword(email: string): Promise<void>;
}

export interface IUserData {
  username: string;
  email: string;
  password: string;
  contact_number: string;
}

export interface Errors {
  emailError: string;
  passwordError: string;
  confirmPassError: string;
  nameError: string;
  contactError: string;
}

export interface ServerErrorResponse {
  code: number;
  message: string;
  errors: ServerError[];
}

export interface ServerError {
  message: string;
  domain: string;
  reason: string;
}
