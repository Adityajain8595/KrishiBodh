import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type UserCredential,
  type Auth,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export type AuthErrorCode =
  | "auth/invalid-credential"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/network-request-failed"
  | "auth/popup-blocked"
  | "auth/popup-closed-by-user"
  | "auth/cancelled-popup-request"
  | string;

export function friendlyAuthError(code?: AuthErrorCode): string {
  switch (code) {
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Redirecting to Google sign-in...";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

function getFirebaseCode(e: unknown): AuthErrorCode | undefined {
  const anyErr = e as { code?: string } | undefined;
  return anyErr?.code;
}

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (e) {
    const code = getFirebaseCode(e);
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(auth, googleProvider);
      // control returns after redirect, so we never resolve a credential here
      throw Object.assign(new Error(friendlyAuthError(code)), { code });
    }
    throw Object.assign(new Error(friendlyAuthError(code)), { code });
  }
}

export async function completeRedirectSignIn(a: Auth = auth): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(a);
  } catch (_) {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    const code = getFirebaseCode(e);
    throw Object.assign(new Error(friendlyAuthError(code)), { code });
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    const code = getFirebaseCode(e);
    throw Object.assign(new Error(friendlyAuthError(code)), { code });
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

