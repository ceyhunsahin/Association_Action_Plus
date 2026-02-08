import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBDAbFvTDb_P7-A2G_aiEjSnKgP2yLxSMM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "actionplusmetz.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "actionplusmetz",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "actionplusmetz.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "237117945539",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:237117945539:web:259a96b99a693aa1dfd476",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GEVR2FTVKQ"
};

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
