// Family accounts online, with Firebase Authentication and Cloud Firestore.
//
// families/{familyId}                        family settings (parent password hash)
// families/{familyId}/children/{childId}     name, picture, PIN hash, settings, summary
// families/{familyId}/children/{childId}/progress/{activityId}   one saved activity
//
// familyId is the family account's user id; firestore.rules only lets that
// account read or write it. Records are saved as JSON text so any shape of
// saved answer is allowed. Firestore keeps a copy on the device, so saving
// works offline and catches up when the device is back online.

import { FIREBASE_CONFIG } from './cloud-config.js';

const EMULATOR_CONFIG = {
  apiKey: 'demo-key',
  authDomain: 'demo-greenhill.firebaseapp.com',
  projectId: 'demo-greenhill',
  appId: 'demo-app',
};

// For testing on this computer with the Firebase emulator: open the app at
// http://localhost:…/?emulator
function useEmulator() {
  const local = ['localhost', '127.0.0.1'].includes(globalThis.location?.hostname);
  if (!local) return false;
  try {
    if (new URLSearchParams(location.search).has('emulator')) sessionStorage.setItem('englishApp.emulator', '1');
    return sessionStorage.getItem('englishApp.emulator') === '1';
  } catch {
    return false;
  }
}

const emulator = useEmulator();
const config = emulator ? EMULATOR_CONFIG : FIREBASE_CONFIG;

export const configured = Boolean(config);

let ready = null;

export function init() {
  if (!configured) return Promise.reject(new Error('Family accounts are not set up.'));
  ready ||= (async () => {
    const fb = await import('../vendor/firebase/firebase.js');
    const app = fb.initializeApp(config);
    const auth = fb.getAuth(app);
    let db;
    try {
      db = fb.initializeFirestore(app, { localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() }) });
    } catch {
      db = fb.initializeFirestore(app, { localCache: fb.memoryLocalCache() });
    }
    if (emulator) {
      fb.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      fb.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    return { fb, auth, db };
  })();
  return ready;
}

// ------------------------------------------------------------------ auth
export async function onAuth(callback) {
  const { fb, auth } = await init();
  return fb.onAuthStateChanged(auth, (user) => callback(user ? { id: user.uid, email: user.email } : null));
}

export async function signUp(email, password) {
  const { fb, auth } = await init();
  const cred = await fb.createUserWithEmailAndPassword(auth, email.trim(), password);
  return { id: cred.user.uid, email: cred.user.email };
}

export async function signIn(email, password) {
  const { fb, auth } = await init();
  const cred = await fb.signInWithEmailAndPassword(auth, email.trim(), password);
  return { id: cred.user.uid, email: cred.user.email };
}

export async function signOut() {
  const { fb, auth } = await init();
  await fb.signOut(auth);
}

export async function resetPassword(email) {
  const { fb, auth } = await init();
  await fb.sendPasswordResetEmail(auth, email.trim());
}

export function errorMessage(err) {
  const code = err?.code || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(code)) return 'That email or password is not right.';
  if (/email-already-in-use/.test(code)) return 'There is already a family account with this email. Sign in instead.';
  if (/invalid-email/.test(code)) return 'Please check the email address.';
  if (/weak-password/.test(code)) return 'Please choose a password with at least 6 characters.';
  if (/network-request-failed|unavailable/.test(code)) return 'No internet connection. Please try again when you are online.';
  if (/too-many-requests/.test(code)) return 'Too many tries. Please wait a few minutes and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------- family
const familyDoc = (fb, db, familyId) => fb.doc(db, 'families', familyId);
const childDoc = (fb, db, familyId, childId) => fb.doc(db, 'families', familyId, 'children', childId);
const progressCol = (fb, db, familyId, childId) => fb.collection(db, 'families', familyId, 'children', childId, 'progress');

export async function watchFamily(familyId, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(familyDoc(fb, db, familyId), (snap) => callback(snap.exists() ? snap.data() : null));
}

export async function saveFamily(familyId, data) {
  const { fb, db } = await init();
  await fb.setDoc(familyDoc(fb, db, familyId), data, { merge: true });
}

// --------------------------------------------------------------- children
function childFromDoc(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    avatar: d.avatar,
    pinHash: d.pinHash || null,
    settings: d.settings ? JSON.parse(d.settings) : {},
    summary: d.summary ? JSON.parse(d.summary) : null,
    lastLocation: d.lastLocation || null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function watchChildren(familyId, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(fb.collection(db, 'families', familyId, 'children'), (snap) => {
    const changes = snap.docChanges().map((c) => ({ type: c.type, child: childFromDoc(c.doc) }));
    callback(changes);
  });
}

export async function saveChild(familyId, child) {
  const { fb, db } = await init();
  const data = {};
  for (const key of ['name', 'avatar', 'pinHash', 'lastLocation', 'createdAt', 'updatedAt']) {
    if (child[key] !== undefined) data[key] = child[key];
  }
  if (child.settings) data.settings = JSON.stringify(child.settings);
  if (child.summary) data.summary = JSON.stringify(child.summary);
  await fb.setDoc(childDoc(fb, db, familyId, child.id), data, { merge: true });
}

export async function deleteChild(familyId, childId) {
  const { fb, db } = await init();
  const progress = await fb.getDocs(progressCol(fb, db, familyId, childId));
  const docs = progress.docs.map((d) => d.ref);
  for (let i = 0; i < docs.length; i += 400) {
    const batch = fb.writeBatch(db);
    docs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  await fb.deleteDoc(childDoc(fb, db, familyId, childId));
}

// --------------------------------------------------------------- progress
export async function watchProgress(familyId, childId, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(progressCol(fb, db, familyId, childId), (snap) => {
    const changes = snap.docChanges()
      .filter((c) => c.type !== 'removed')
      .map((c) => ({ activityId: c.doc.id, record: JSON.parse(c.doc.data().json) }));
    if (changes.length) callback(changes);
  });
}

export async function saveProgress(familyId, childId, entries) {
  const { fb, db } = await init();
  const batch = fb.writeBatch(db);
  for (const { activityId, record } of entries) {
    batch.set(fb.doc(progressCol(fb, db, familyId, childId), activityId), {
      json: JSON.stringify(record),
      updatedAt: record.updatedAt || new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function deleteProgress(familyId, childId, activityIds) {
  const { fb, db } = await init();
  for (let i = 0; i < activityIds.length; i += 400) {
    const batch = fb.writeBatch(db);
    activityIds.slice(i, i + 400).forEach((id) => batch.delete(fb.doc(progressCol(fb, db, familyId, childId), id)));
    await batch.commit();
  }
}
