// Children's and parents' accounts are stored with Firebase (free plan).
// See "Setting up accounts" in the README. These values are not secret: the
// security rules in firestore.rules keep each child's data private.
//
// If this is set to null, the app still has child logins (picture + PIN) and
// the parent area, but everything is saved on one device only.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAJwmWHbTI83CgJDDTuG3auLM0gsmjNdnA",
  authDomain: "english-a1453.firebaseapp.com",
  projectId: "english-a1453",
  storageBucket: "english-a1453.firebasestorage.app",
  messagingSenderId: "775498340036",
  appId: "1:775498340036:web:169f21c4e57b5ee69c1b91"
};
