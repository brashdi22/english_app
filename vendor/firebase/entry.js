export { initializeApp } from 'firebase/app';
export {
  getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, browserLocalPersistence, setPersistence,
  deleteUser, reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
export {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, serverTimestamp, increment,
} from 'firebase/firestore';
