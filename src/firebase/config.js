import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZ7a40Nm4r12MVIloXUY2Rc_xICwknLnA",
  authDomain: "organization-91111.firebaseapp.com",
  databaseURL: "https://organization-91111-default-rtdb.firebaseio.com",
  projectId: "organization-91111",
  storageBucket: "organization-91111.appspot.com", // fix: add .appspot.com
  messagingSenderId: "930968281245",
  appId: "1:930968281245:web:a03739a7153296efbeb474"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Realtime Database
export const db = getDatabase(app);

// Export Storage
export const storage = getStorage(app);
export const auth = getAuth(app);