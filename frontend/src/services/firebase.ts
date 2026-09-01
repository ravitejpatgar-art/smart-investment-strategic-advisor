import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
  type Auth,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  type Firestore 
} from 'firebase/firestore';

// Authoritative SmartVest Firebase Web App Configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAhYS6boi5mvLZpv_Dxa2eeFaObttnYkag',
  authDomain: 'smart-investment-advisor-863f5.firebaseapp.com',
  projectId: 'smart-investment-advisor-863f5',
  storageBucket: 'smart-investment-advisor-863f5.firebasestorage.app',
  messagingSenderId: '86273308363',
  appId: '1:86273308363:web:badc8a352795cdc8298d4e'
};

function getCleanEnv(val: unknown, fallback: string = ''): string {
  if (typeof val !== 'string' || !val.trim()) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

// Helper to check if authentication is enabled via feature flag or configured Firebase env
export function isAuthEnabled(): boolean {
  const envVal = getCleanEnv(import.meta.env.VITE_ENABLE_AUTH, 'true');
  if (envVal === 'false') return false;
  return true;
}

// Helper to verify if real Firebase environment variables are configured
export function isFirebaseConfigured(): boolean {
  const apiKey = getCleanEnv(import.meta.env.VITE_FIREBASE_API_KEY, DEFAULT_FIREBASE_CONFIG.apiKey);
  const projectId = getCleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, DEFAULT_FIREBASE_CONFIG.projectId);
  const authDomain = getCleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, DEFAULT_FIREBASE_CONFIG.authDomain);
  const useEmulator = getCleanEnv(import.meta.env.VITE_USE_FIREBASE_EMULATOR) === 'true';

  if (useEmulator) return true;

  return Boolean(
    apiKey && 
    apiKey.length > 0 &&
    projectId && 
    projectId.length > 0 &&
    authDomain && 
    authDomain.length > 0 &&
    !apiKey.includes('your_firebase_api_key')
  );
}

// Firebase configuration strictly prioritized: Environment Variables -> Authoritative Web App Config
const firebaseConfig = {
  apiKey: getCleanEnv(import.meta.env.VITE_FIREBASE_API_KEY, DEFAULT_FIREBASE_CONFIG.apiKey),
  authDomain: getCleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, DEFAULT_FIREBASE_CONFIG.authDomain),
  projectId: getCleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, DEFAULT_FIREBASE_CONFIG.projectId),
  storageBucket: getCleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, DEFAULT_FIREBASE_CONFIG.storageBucket),
  messagingSenderId: getCleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, DEFAULT_FIREBASE_CONFIG.messagingSenderId),
  appId: getCleanEnv(import.meta.env.VITE_FIREBASE_APP_ID, DEFAULT_FIREBASE_CONFIG.appId)
};

// Initialize Firebase App safely and exactly once
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let emulatorConnected = false;

function setupEmulatorIfRequested(authInstance: Auth) {
  if (emulatorConnected) return;
  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
  if (useEmulator) {
    try {
      const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'http://127.0.0.1:9099';
      connectAuthEmulator(authInstance, emulatorHost, { disableWarnings: true });
      emulatorConnected = true;
      console.log(`Connected to Firebase Auth Emulator at ${emulatorHost}`);
    } catch (e) {
      console.warn('Firebase Auth Emulator connection:', e);
    }
  }
}

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
    setupEmulatorIfRequested(auth);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, app as firebaseApp, auth, db, browserLocalPersistence, setPersistence };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function getActiveAuth(): Auth {
  if (!auth) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase configuration is missing in frontend/.env. Please configure your Firebase Web App credentials.');
    }
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
    setupEmulatorIfRequested(auth);
  }
  return auth;
}

function getActiveFirestore(): Firestore | null {
  if (!db && app) {
    try {
      db = getFirestore(app);
    } catch {
      // Non-blocking
    }
  }
  return db;
}

/**
 * Creates/Updates user document structure in Firestore collection:
 * users/{uid}
 * {
 *   uid,
 *   name,
 *   email,
 *   createdAt,
 *   lastLogin
 * }
 */
export async function syncUserDocument(uid: string, name: string, email: string, isNewUser: boolean = false): Promise<void> {
  const firestoreDb = getActiveFirestore();
  if (!firestoreDb || !uid) return;

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    const data: Record<string, any> = {
      uid,
      name: name || (email ? email.split('@')[0] : 'Investor'),
      email: email || '',
      lastLogin: serverTimestamp()
    };
    if (isNewUser) {
      data.createdAt = serverTimestamp();
    }
    await setDoc(userDocRef, data, { merge: true });
  } catch (err) {
    // Non-blocking for offline / restricted security rules
    console.warn('Firestore user document sync notice:', err);
  }
}

// Google OAuth Login
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await signInWithPopup(activeAuth, googleProvider);
  const user = result.user;
  if (user) {
    await syncUserDocument(user.uid, user.displayName || '', user.email || '', false);
  }
  return user;
}

// Email + Password Login
export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await signInWithEmailAndPassword(activeAuth, email, password);
  const user = result.user;
  if (user) {
    await syncUserDocument(user.uid, user.displayName || '', user.email || '', false);
  }
  return user;
}

// Email Registration
export async function registerWithEmail(email: string, password: string, fullName: string): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await createUserWithEmailAndPassword(activeAuth, email, password);
  const user = result.user;
  if (user) {
    if (fullName.trim()) {
      try {
        await updateProfile(user, { displayName: fullName.trim() });
      } catch {
        // Non-blocking
      }
    }
    await syncUserDocument(user.uid, fullName.trim() || user.displayName || '', user.email || '', true);
  }
  return user;
}

// Password Reset Email
export async function resetPassword(email: string): Promise<void> {
  const activeAuth = getActiveAuth();
  await sendPasswordResetEmail(activeAuth, email);
}

// Logout
export async function logoutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// Auth State Change Listener wrapper
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void): () => void {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { onAuthStateChanged };
export type { FirebaseUser };

// Human-friendly Firebase Error Mapping
export function mapFirebaseError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = (error?.code || '').toLowerCase();
  const message = (error?.message || '').toLowerCase();
  
  if (
    code.includes('api-key') || 
    message.includes('api-key') || 
    message.includes('api key')
  ) {
    return 'Invalid Firebase API Key. Please verify your Firebase Web App credentials in Firebase Console.';
  }
  if (message.includes('configuration is missing')) {
    return 'Firebase configuration is missing or incomplete. Please verify your environment variables.';
  }
  if (code.includes('invalid-email') || message.includes('invalid-email')) {
    return 'The email address is formatted incorrectly.';
  }
  if (code.includes('user-disabled') || message.includes('user-disabled')) {
    return 'This user account has been disabled.';
  }
  if (code.includes('user-not-found') || message.includes('user-not-found')) {
    return 'No registered account found with this email.';
  }
  if (
    code.includes('wrong-password') || 
    code.includes('invalid-credential') || 
    code.includes('invalid-login-credentials') ||
    message.includes('invalid-credential')
  ) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('email-already-in-use') || message.includes('email-already-in-use')) {
    return 'An account already exists with this email.';
  }
  if (code.includes('weak-password') || message.includes('weak-password')) {
    return 'The password is too weak. Please use at least 6 characters.';
  }
  if (code.includes('popup-closed-by-user') || message.includes('popup-closed-by-user')) {
    return 'Sign-in popup was closed before completing.';
  }
  if (code.includes('cancelled-popup-request') || message.includes('cancelled-popup-request')) {
    return 'Authentication request cancelled due to multiple popups.';
  }
  if (code.includes('popup-blocked') || message.includes('popup-blocked')) {
    return 'Your browser blocked the sign-in popup. Please allow popups for this site.';
  }
  if (code.includes('account-exists-with-different-credential')) {
    return 'An account already exists with the same email using a different sign-in method.';
  }
  if (code.includes('operation-not-allowed') || message.includes('operation-not-allowed')) {
    return 'This sign-in provider is not enabled in your Firebase Console. Go to Authentication > Sign-in method to enable it.';
  }
  if (code.includes('network-request-failed') || message.includes('network')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many unsuccessful attempts. Please wait a few minutes before retrying.';
  }
  if (code.includes('unauthorized-domain') || message.includes('unauthorized-domain')) {
    return 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).';
  }
  
  return error.message || 'Authentication failed. Please try again.';
}
