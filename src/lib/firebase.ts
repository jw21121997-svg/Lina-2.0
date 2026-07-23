import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

/**
 * Perform real Google Sign-In via Firebase Auth Popup
 */
export async function loginWithGoogle() {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error?.code, error?.message);
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.message?.includes('unauthorized-domain')
    ) {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
      throw new Error(
        `Domain Unauthorized: '${currentDomain}' is not listed in Firebase Authorized Domains. Please add '${currentDomain}' in Firebase Console > Authentication > Settings > Authorized Domains.`
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logout() {
  cachedAccessToken = null;
  return await signOut(auth);
}

/**
 * Helper to subscribe to Firebase Auth state changes
 */
export function initAuthListener(
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = cachedAccessToken || (await user.getIdToken());
        if (onSuccess) onSuccess(user, token);
      } catch (err) {
        console.warn('Error fetching user token:', err);
        if (onSuccess) onSuccess(user, '');
      }
    } else {
      if (!isSigningIn && onFailure) {
        onFailure();
      }
    }
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error:', error, operationType, path);
}
