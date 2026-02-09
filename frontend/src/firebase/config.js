import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const cleanEnv = (value) => (value || '').trim().replace(/^['"]|['"]$/g, '');

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: cleanEnv(process.env.REACT_APP_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.REACT_APP_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID)
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  // eslint-disable-next-line no-console
  console.error('Firebase config is incomplete. Check REACT_APP_FIREBASE_* variables.');
}

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth servisini al
const auth = getAuth(app);

// Firebase Auth'u etkinleştir
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = false;

// Dil ayarını Fransızca yap
auth.languageCode = 'fr';

// Google Auth Provider'ı yapılandır
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { googleProvider };

export { auth };

export default app; 
