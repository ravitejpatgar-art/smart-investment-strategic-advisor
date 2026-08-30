import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
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

// Helper to check if authentication is enabled via feature flag
export function isAuthEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_AUTH === 'true';
}

// Helper to verify if real Firebase environment variables are configured
export function isFirebaseConfigured(): boolean {

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

  if (useEmulator) return true;

  return Boolean(
    apiKey && 
    apiKey.trim().length > 0 &&
    projectId && 
    projectId.trim().length > 0 &&
    authDomain && 
    authDomain.trim().length > 0 &&
    !apiKey.includes('DemoKey') && 
    !apiKey.includes('your_firebase_api_key')
  );
}

// Firebase configuration strictly from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'emulator-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'emerald-codex-wc9s2',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Initialize Firebase App safely and exactly once
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
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
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
    setupEmulatorIfRequested(auth);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, app as firebaseApp, auth, browserLocalPersistence, setPersistence };

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();

function getActiveAuth(): Auth {
  if (!auth) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase configuration is missing in frontend/.env. Please configure your Firebase Web App credentials.');
    }
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
    setupEmulatorIfRequested(auth);
  }
  return auth;
}

// Google OAuth Login
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await signInWithPopup(activeAuth, googleProvider);
  return result.user;
}

// GitHub OAuth Login
export async function loginWithGitHub(): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await signInWithPopup(activeAuth, githubProvider);
  return result.user;
}

// Email + Password Login
export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await signInWithEmailAndPassword(activeAuth, email, password);
  return result.user;
}

// Email Registration
export async function registerWithEmail(email: string, password: string, fullName: string): Promise<FirebaseUser> {
  const activeAuth = getActiveAuth();
  const result = await createUserWithEmailAndPassword(activeAuth, email, password);
  if (fullName.trim() && result.user) {
    try {
      await updateProfile(result.user, { displayName: fullName.trim() });
    } catch {
      // Non-blocking
    }
  }
  return result.user;
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

// Human-friendly Firebase Error Mapping (Step 14 & Step 19)
export function mapFirebaseError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = (error?.code || '').toLowerCase();
  const message = (error?.message || '').toLowerCase();
  
  if (
    code.includes('api-key') || 
    message.includes('api-key') || 
    message.includes('api key') ||
    message.includes('configuration is missing')
  ) {
    return 'Firebase configuration is missing or invalid in frontend/.env. Please configure your Firebase Web App credentials.';
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
    return 'Sign-in was cancelled.';
  }
  if (code.includes('cancelled-popup-request') || message.includes('cancelled-popup-request')) {
    return 'Authentication request cancelled due to multiple popups.';
  }
  if (code.includes('popup-blocked') || message.includes('popup-blocked')) {
    return 'Your browser blocked the sign-in popup.';
  }
  if (code.includes('account-exists-with-different-credential')) {
    return 'An account already exists with the same email using a different sign-in method.';
  }
  if (code.includes('operation-not-allowed') || message.includes('operation-not-allowed')) {
    return 'This sign-in provider is not enabled in your Firebase Console. Go to Authentication > Sign-in method to enable it.';
  }
  if (code.includes('network-request-failed') || message.includes('network')) {
    return 'Network error. Please try again.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many unsuccessful attempts. Please wait a few minutes before retrying.';
  }
  if (code.includes('unauthorized-domain') || message.includes('unauthorized-domain')) {
    return 'This domain is not authorized in Firebase.';
  }
  
  return error.message || 'Authentication failed. Please try again.';
}
