import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";
 
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
 
export const logoutUser = () => signOut(auth);
 
export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback);