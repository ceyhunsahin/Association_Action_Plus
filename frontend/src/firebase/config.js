import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAQxAEcxJB8A8Wmd5-uEKRf7mnry2wsEi4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "metz-actionplus.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "metz-actionplus",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "metz-actionplus.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth servisini al
const auth = getAuth(app);

// Geliştirme ortamında hata ayıklama
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized with config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey.substring(0, 5) + '...',
    appId: firebaseConfig.appId ? firebaseConfig.appId.substring(0, 5) + '...' : 'not set'
  });
}

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