import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

function getEnv(name: string): string | undefined {
  return (import.meta as any).env?.[name] as string | undefined;
}

function isPlaceholder(v: string): boolean {
  return !v || v.includes("your_") || v === "your_api_key" || v === "your_project";
}

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let firebaseReady = false;

try {
  const apiKey = getEnv("VITE_FIREBASE_API_KEY");
  const authDomain = getEnv("VITE_FIREBASE_AUTH_DOMAIN");
  const projectId = getEnv("VITE_FIREBASE_PROJECT_ID");
  const storageBucket = getEnv("VITE_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID");
  const appId = getEnv("VITE_FIREBASE_APP_ID");

  if (
    apiKey &&
    authDomain &&
    projectId &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(projectId)
  ) {
    const config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId: messagingSenderId || "",
      appId: appId || "",
    };
    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    firebaseReady = true;
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
} catch (_) {
  firebaseReady = false;
}

export const firebaseConfig = firebaseReady ? {} : null;
export { firebaseApp, auth, googleProvider, firebaseReady };
