import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase yapılandırması - Doğru proje bilgileriyle
const firebaseConfig = {
  apiKey: "AIzaSyAQxAEcxJB8A8Wmd5-uEKRf7mnry2wsEi4",
  authDomain: "metz-actionplus.firebaseapp.com",
  projectId: "metz-actionplus",
  storageBucket: "metz-actionplus.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Firebase konsolundan alın
  appId: "YOUR_APP_ID" // Firebase konsolundan alın
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth servisini dışa aktar
const auth = getAuth(app);

// Dil ayarını Fransızca yap
auth.languageCode = 'fr';

export { auth };

export default app; 