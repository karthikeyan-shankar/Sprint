import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User as FbUser,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";

// Firebase Web config — public/publishable, safe to ship in client bundle.
const firebaseConfig = {
  apiKey: "AIzaSyA_BB6wUB5JDbPFIQFkYi2b6oDnY9zRbuQ",
  authDomain: "sprint-9d4a5.firebaseapp.com",
  projectId: "sprint-9d4a5",
  storageBucket: "sprint-9d4a5.firebasestorage.app",
  messagingSenderId: "1044978601364",
  appId: "1:1044978601364:web:94b6cbb2004444c7cc5381",
  measurementId: "G-5Y0MQ3TBPB",
};

// Allow overriding the (public) web API key via Vite env without leaking it in code.
const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY as string | undefined;
if (envKey) firebaseConfig.apiKey = envKey;

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function getFirebase() {
  if (typeof window === "undefined") return { app: null, auth: null, db: null, storage: null } as const;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!authInstance) authInstance = getAuth(app);
  if (!dbInstance) dbInstance = getFirestore(app);
  if (!storageInstance) storageInstance = getStorage(app);
  return { app, auth: authInstance, db: dbInstance, storage: storageInstance } as const;
}

export function getDb(): Firestore {
  const { db } = getFirebase();
  if (!db) throw new Error("Firestore unavailable (SSR)");
  return db;
}

export async function googleSignIn() {
  const { auth } = getFirebase();
  if (!auth) throw new Error("Firebase unavailable");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function emailSignIn(email: string, password: string) {
  const { auth } = getFirebase();
  if (!auth) throw new Error("Firebase unavailable");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function emailSignUp(name: string, email: string, password: string) {
  const { auth } = getFirebase();
  if (!auth) throw new Error("Firebase unavailable");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function resetPassword(email: string) {
  const { auth } = getFirebase();
  if (!auth) throw new Error("Firebase unavailable");
  await sendPasswordResetEmail(auth, email);
}

export async function firebaseSignOut() {
  const { auth } = getFirebase();
  if (!auth) return;
  await fbSignOut(auth);
}

export function onFirebaseAuth(cb: (u: FbUser | null) => void) {
  const { auth } = getFirebase();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, cb);
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const { storage } = getFirebase();
  if (!storage) throw new Error("Firebase Storage unavailable");
  const ext = file.name.split('.').pop();
  const filename = `${path}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export type { FbUser };
