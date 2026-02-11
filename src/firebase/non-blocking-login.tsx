'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Email sign-up error:", error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
      // For development, if the user doesn't exist, create them automatically.
      // This makes the "Quick Login" buttons work without manual sign-ups first.
      if (error.code === 'auth/invalid-credential' && process.env.NODE_ENV === 'development') {
        console.log(`Dev login: User ${email} not found. Attempting to create user...`);
        createUserWithEmailAndPassword(authInstance, email, password)
          .catch((creationError) => {
            console.error("Dev login: Failed to create user after failed sign-in:", creationError);
          });
      } else {
        // In production, or for other errors, we don't automatically create a user.
        // The onAuthStateChanged listener in login/page.tsx will handle the UI feedback.
        console.error("Sign-in error:", error);
      }
    });
}
