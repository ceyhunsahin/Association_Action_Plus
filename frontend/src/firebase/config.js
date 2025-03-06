import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase yapılandırması - Sadece kimlik doğrulama için
const firebaseConfig = {
  apiKey: "AIzaSyA5hmYfFGyOW_VBcmKJhZm_T0lmOEsbjGY",
  authDomain: "actionplus-metz.firebaseapp.com",
  projectId: "actionplus-metz",
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Sadece Auth servisini dışa aktar
export const auth = getAuth(app);

export default app; 