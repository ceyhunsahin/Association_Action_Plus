import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAQxAEcxJB8A8Wmd5-uEKRf7mnry2wsEi4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "metz-actionplus.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "metz-actionplus",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "metz-actionplus.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
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

// Dil ayarını Fransızca yap
auth.languageCode = 'fr';

export { auth };

export default app; 