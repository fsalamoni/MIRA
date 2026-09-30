// MIRA Firebase Configuration
// Initialize Firebase app, auth, firestore, and functions for the
// MIRA — Módulo de Inteligência em Rastreamento de Ativos platform.
//
// IMPORTANT: Set VITE_FIREBASE_* env vars in .env (see .env.example).
// For the prototype, falls back to a demo project so the UI loads with
// mocked chain data without a real Firebase backend.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Demo / fallback project (replace with your own Firebase project for production).
const fallbackFirebaseConfig = {
    apiKey: 'AIzaSyMIRA-demo-key-replace-with-real-key',
    authDomain: 'mira-platform.firebaseapp.com',
    projectId: 'mira-platform',
    storageBucket: 'mira-platform.firebasestorage.app',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
};

const envFirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
];

const placeholderConfigPatterns = [
    /^your_/,
    /^sua_/,
    /^seu_/,
    /^MIRA-demo/,
    /your-project-id/,
    /your_project_id/,
    /sua_api_key/,
    /seu_project_id/,
];

const isPlaceholderValue = (value) => {
    if (typeof value !== 'string') return false;
    const normalizedValue = value.trim().toLowerCase();
    return placeholderConfigPatterns.some(pattern => pattern.test(normalizedValue));
};

const invalidEnvConfigFields = requiredConfigFields.filter(
    fieldName => !envFirebaseConfig[fieldName] || isPlaceholderValue(envFirebaseConfig[fieldName])
);

const shouldUseFallbackConfig = invalidEnvConfigFields.length > 0;

const firebaseConfig = shouldUseFallbackConfig
    ? fallbackFirebaseConfig
    : envFirebaseConfig;

if (shouldUseFallbackConfig && import.meta.env.PROD) {
    console.warn('[MIRA] Invalid or missing VITE Firebase env vars. Using fallback project config.', {
        invalidEnvConfigFields,
    });
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
});
export const functions = getFunctions(app, 'southamerica-east1'); // São Paulo region
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account',
});

// Emulator setup for development
if (import.meta.env.DEV) {
    const USE_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';
    if (USE_EMULATORS) {
        console.log('[MIRA] 🔧 Using Firebase Emulators');
        try {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectFunctionsEmulator(functions, 'localhost', 5001);
        } catch (error) {
            console.warn('[MIRA] Failed to connect to emulators:', error);
        }
    }
}

if (import.meta.env.DEV) {
    console.log('[MIRA] Firebase initialized:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        isFallback: shouldUseFallbackConfig,
    });
}

export default app;
