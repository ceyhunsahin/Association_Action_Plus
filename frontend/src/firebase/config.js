import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const cleanEnv = (value) => (value || "").trim().replace(/^['"]|['"]$/g, "");

const firebaseConfig = {
  apiKey: cleanEnv(process.env.REACT_APP_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: cleanEnv(process.env.REACT_APP_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID),
};

Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing Firebase config: ${key}`);
  }
});

let app = null;
let auth = null;

try {
  const hasRequiredConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
  );

  if (hasRequiredConfig) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    auth.useDeviceLanguage();
    auth.settings.appVerificationDisabledForTesting = false;
    auth.languageCode = "fr";
  } else {
    // eslint-disable-next-line no-console
    console.error("Firebase init skipped because configuration is incomplete.");
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Firebase init error:", err);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { googleProvider };
export { auth };

export default app;
