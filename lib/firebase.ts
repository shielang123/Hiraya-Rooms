import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { firebasePublicConfig as pub } from "./firebase-public-config"
const firebaseConfig = { apiKey: pub.apiKey, authDomain: `${pub.projectId}.firebaseapp.com`, projectId: pub.projectId, storageBucket: `${pub.projectId}.firebasestorage.app`, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "" }
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = typeof window !== "undefined" ? getAuth(app) : null
export const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null
export const db = getFirestore(app)
