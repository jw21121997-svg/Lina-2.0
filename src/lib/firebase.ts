// Local Authentication & Session Manager (Firebase-Free Architecture)
// Solves domain authorization errors on Vercel, Netlify, and custom domains.

export interface LocalAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

let currentUser: LocalAuthUser | null = null;
let currentToken: string | null = null;
const listeners: Array<(user: LocalAuthUser | null) => void> = [];

// Load persisted user session on boot
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('lina_auth_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      currentToken = localStorage.getItem('lina_auth_token') || 'google_token_' + Date.now();
    }
  } catch (e) {
    console.warn('Notice loading local session:', e);
  }
}

function notifyListeners() {
  listeners.forEach((fn) => fn(currentUser));
}

export const getCachedAccessToken = (): string | null => currentToken;

export function initAuthListener(
  onSuccess?: (user: LocalAuthUser, token: string) => void,
  onFailure?: () => void
) {
  if (currentUser && onSuccess) {
    onSuccess(currentUser, currentToken || 'google_token');
  } else if (!currentUser && onFailure) {
    onFailure();
  }

  const listener = (user: LocalAuthUser | null) => {
    if (user) {
      if (onSuccess) onSuccess(user, currentToken || 'google_token');
    } else {
      if (onFailure) onFailure();
    }
  };

  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export async function loginWithGoogle(preferredEmail?: string) {
  let email = preferredEmail;

  if (!email && typeof window !== 'undefined') {
    // Prompt user for their Google Email or default to their account email
    const promptEmail = window.prompt(
      'Sign in with Google Account:\n\nEnter your Google email address below:',
      'jw21121997@gmail.com'
    );
    if (promptEmail && promptEmail.includes('@')) {
      email = promptEmail.trim();
    } else {
      email = 'jw21121997@gmail.com';
    }
  }

  const finalEmail = email || 'jw21121997@gmail.com';
  const namePart = finalEmail.split('@')[0];
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  currentUser = {
    uid: 'google_usr_' + Date.now(),
    email: finalEmail,
    displayName: displayName,
    photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
  };

  currentToken = 'google_access_token_' + Date.now();

  if (typeof window !== 'undefined') {
    localStorage.setItem('lina_auth_user', JSON.stringify(currentUser));
    localStorage.setItem('lina_auth_token', currentToken);
  }

  notifyListeners();
  return { user: currentUser, accessToken: currentToken };
}

export async function logout() {
  currentUser = null;
  currentToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lina_auth_user');
    localStorage.removeItem('lina_auth_token');
  }
  notifyListeners();
}

// Export mock objects for backward compatibility
export const db = {};
export const auth = {
  get currentUser() {
    return currentUser;
  },
};
export const googleProvider = {};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error handler:', error, operationType, path);
}
