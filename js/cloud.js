// Accounts online, with Firebase Authentication and Cloud Firestore.
//
// users/{uid}                         a child's or a parent's account
// users/{kidUid}/progress/{activity}  a child's saved work (one document per activity)
// families/{code}                     a family; code is the family ID children type
// families/{code}/private/settings    the parent password hash (grown-up scoring)
// families/{code}/requests/{kidUid}   join requests waiting for the parent
// families/{code}/members/{kidUid}    accepted children + their scoreboard summary
//
// Who may read and write what is in firestore.rules. Children have no email:
// their username becomes a made-up address that is never used for mail.
// Records are saved as JSON text so any shape of saved answer is allowed.
// Firestore keeps a copy on the device, so saving also works offline.

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

// For testing the one-device mode on this computer: http://localhost:…/?local
function useLocalOnly() {
  const local = ['localhost', '127.0.0.1'].includes(globalThis.location?.hostname);
  if (!local) return false;
  try {
    if (new URLSearchParams(location.search).has('local')) sessionStorage.setItem('englishApp.localOnly', '1');
    return sessionStorage.getItem('englishApp.localOnly') === '1';
  } catch {
    return false;
  }
}

const emulator = useEmulator();
const config = useLocalOnly() ? null : (emulator ? EMULATOR_CONFIG : FIREBASE_CONFIG);

export const configured = Boolean(config);

export const KID_EMAIL_DOMAIN = 'kids.example.com';
// Firebase needs passwords of 6+ characters; a child's PIN is wrapped.
export const kidPassword = (pin) => `greenhill:${pin}`;
export const kidEmail = (username) => `${normalizeUsername(username)}@${KID_EMAIL_DOMAIN}`;
export const normalizeUsername = (name) => String(name).trim().toLowerCase();
export const validUsername = (name) => /^[a-z0-9][a-z0-9_.-]{2,19}$/.test(normalizeUsername(name));

// Family IDs avoid letters and numbers that look alike (0/O, 1/I).
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newFamilyCode() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => CODE_LETTERS[b % CODE_LETTERS.length]).join('');
}
export const normalizeCode = (code) => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');

let ready = null;

export function init() {
  if (!configured) return Promise.reject(new Error('Accounts are not set up.'));
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

const ref = (fb, db, path) => fb.doc(db, path);
const col = (fb, db, path) => fb.collection(db, path);

// ------------------------------------------------------------------ auth
export async function onAuth(callback) {
  const { fb, auth } = await init();
  return fb.onAuthStateChanged(auth, (user) => callback(user ? { uid: user.uid, email: user.email } : null));
}

export async function signUpKid(username, pin) {
  const { fb, auth } = await init();
  const cred = await fb.createUserWithEmailAndPassword(auth, kidEmail(username), kidPassword(pin));
  return cred.user.uid;
}

export async function signInKid(username, pin) {
  const { fb, auth } = await init();
  const cred = await fb.signInWithEmailAndPassword(auth, kidEmail(username), kidPassword(pin));
  return cred.user.uid;
}

export async function signUpParent(email, password) {
  const { fb, auth } = await init();
  const cred = await fb.createUserWithEmailAndPassword(auth, email.trim(), password);
  return cred.user.uid;
}

export async function signInParent(email, password) {
  const { fb, auth } = await init();
  const cred = await fb.signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user.uid;
}

export async function signOut() {
  const { fb, auth } = await init();
  await fb.signOut(auth);
}

export async function resetPassword(email) {
  const { fb, auth } = await init();
  await fb.sendPasswordResetEmail(auth, email.trim());
}

export function errorMessage(err, { kid = false } = {}) {
  const code = err?.code || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(code)) {
    return kid ? 'That username or PIN is not right.' : 'That email or password is not right.';
  }
  if (/email-already-in-use/.test(code)) {
    return kid ? 'That username is taken. Please choose another one.' : 'There is already an account with this email. Log in instead.';
  }
  if (/invalid-email/.test(code)) return kid ? 'Please use only letters, numbers, dots, dashes and _.' : 'Please check the email address.';
  if (/weak-password/.test(code)) return 'Please choose a password with at least 6 characters.';
  if (/network-request-failed|unavailable/.test(code)) return 'No internet connection. Please try again when you are online.';
  if (/too-many-requests/.test(code)) return 'Too many tries. Please wait a few minutes and try again.';
  if (/permission-denied/.test(code)) return 'That is not allowed.';
  return err?.message || 'Something went wrong. Please try again.';
}

// --------------------------------------------------------------- accounts
export async function getUser(uid) {
  const { fb, db } = await init();
  const snap = await fb.getDoc(ref(fb, db, `users/${uid}`));
  return snap.exists() ? userFromData(uid, snap.data()) : null;
}

function userFromData(uid, d) {
  return {
    uid,
    role: d.role,
    username: d.username || null,
    email: d.email || null,
    avatar: d.avatar || null,
    familyCode: d.familyCode || null,
    settings: d.settings ? JSON.parse(d.settings) : {},
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// callback(user) with the account, or null once the server says there is
// none (a "not saved on this device" answer from the device cache is skipped).
export async function watchUser(uid, callback, onError) {
  const { fb, db } = await init();
  let last;
  return fb.onSnapshot(ref(fb, db, `users/${uid}`), { includeMetadataChanges: true }, (snap) => {
    if (!snap.exists() && snap.metadata.fromCache) return;
    const key = snap.exists() ? JSON.stringify(snap.data()) : null;
    if (key === last) return;
    last = key;
    callback(snap.exists() ? userFromData(uid, snap.data()) : null);
  }, onError);
}

export async function saveUser(uid, data) {
  const { fb, db } = await init();
  const out = { ...data };
  if (out.settings) out.settings = JSON.stringify(out.settings);
  await fb.setDoc(ref(fb, db, `users/${uid}`), out, { merge: true });
}

// ---------------------------------------------------------------- families
export async function createFamily(parentUid, parentPasswordHash) {
  const { fb, db } = await init();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newFamilyCode();
    const existing = await fb.getDoc(ref(fb, db, `families/${code}`));
    if (existing.exists()) continue;
    await fb.setDoc(ref(fb, db, `families/${code}`), { parentUid, createdAt: new Date().toISOString() });
    await fb.setDoc(ref(fb, db, `families/${code}/private/settings`), { parentPasswordHash });
    return code;
  }
  throw new Error('Could not make a family ID. Please try again.');
}

export async function familyExists(code) {
  const { fb, db } = await init();
  const snap = await fb.getDoc(ref(fb, db, `families/${normalizeCode(code)}`));
  return snap.exists();
}

export async function watchFamilySettings(code, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(ref(fb, db, `families/${code}/private/settings`),
    (snap) => callback(snap.exists() ? snap.data() : null), () => callback(null));
}

export async function saveFamilySettings(code, data) {
  const { fb, db } = await init();
  await fb.setDoc(ref(fb, db, `families/${code}/private/settings`), data, { merge: true });
}

// --------------------------------------------------------------- joining
export async function requestToJoin(code, kid) {
  const { fb, db } = await init();
  await fb.setDoc(ref(fb, db, `families/${code}/requests/${kid.uid}`), {
    username: kid.username, avatar: kid.avatar, status: 'pending', createdAt: new Date().toISOString(),
  });
}

export async function cancelRequest(code, kidUid) {
  const { fb, db } = await init();
  await fb.deleteDoc(ref(fb, db, `families/${code}/requests/${kidUid}`));
}

export async function watchMyRequest(code, kidUid, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(ref(fb, db, `families/${code}/requests/${kidUid}`),
    (snap) => callback(snap.exists() ? snap.data() : null), () => callback(null));
}

export async function watchRequests(code, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(col(fb, db, `families/${code}/requests`),
    (snap) => callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))));
}

export async function acceptRequest(code, kidUid, request) {
  const { fb, db } = await init();
  const batch = fb.writeBatch(db);
  batch.set(ref(fb, db, `families/${code}/members/${kidUid}`), {
    username: request.username, avatar: request.avatar || null, joinedAt: new Date().toISOString(),
  });
  batch.delete(ref(fb, db, `families/${code}/requests/${kidUid}`));
  await batch.commit();
}

export async function rejectRequest(code, kidUid) {
  const { fb, db } = await init();
  await fb.updateDoc(ref(fb, db, `families/${code}/requests/${kidUid}`), { status: 'rejected' });
}

// --------------------------------------------------------------- members
function memberFromDoc(d) {
  const data = d.data();
  return {
    uid: d.id,
    username: data.username,
    avatar: data.avatar,
    joinedAt: data.joinedAt,
    summary: data.summary ? JSON.parse(data.summary) : null,
  };
}

export async function watchMembers(code, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(col(fb, db, `families/${code}/members`),
    (snap) => callback(snap.docs.map(memberFromDoc)), () => callback([]));
}

export async function watchMember(code, kidUid, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(ref(fb, db, `families/${code}/members/${kidUid}`),
    (snap) => callback(snap.exists() ? memberFromDoc(snap) : null), () => callback(null));
}

export async function saveMemberSummary(code, kidUid, { summary, username, avatar }) {
  const { fb, db } = await init();
  const data = { summary: JSON.stringify(summary), updatedAt: new Date().toISOString() };
  if (username) data.username = username;
  if (avatar) data.avatar = avatar;
  await fb.updateDoc(ref(fb, db, `families/${code}/members/${kidUid}`), data);
}

export async function removeMember(code, kidUid) {
  const { fb, db } = await init();
  await fb.deleteDoc(ref(fb, db, `families/${code}/members/${kidUid}`));
}

// --------------------------------------------------------------- progress
export async function watchProgress(uid, callback) {
  const { fb, db } = await init();
  return fb.onSnapshot(col(fb, db, `users/${uid}/progress`), (snap) => {
    const changes = snap.docChanges()
      .filter((c) => c.type !== 'removed')
      .map((c) => ({ activityId: c.doc.id, record: JSON.parse(c.doc.data().json) }));
    if (changes.length) callback(changes);
  }, () => {});
}

export async function saveProgress(uid, entries) {
  const { fb, db } = await init();
  for (let i = 0; i < entries.length; i += 400) {
    const batch = fb.writeBatch(db);
    for (const { activityId, record } of entries.slice(i, i + 400)) {
      batch.set(ref(fb, db, `users/${uid}/progress/${activityId}`), {
        json: JSON.stringify(record),
        updatedAt: record.updatedAt || new Date().toISOString(),
      });
    }
    await batch.commit();
  }
}

export async function deleteProgress(uid, activityIds) {
  const { fb, db } = await init();
  for (let i = 0; i < activityIds.length; i += 400) {
    const batch = fb.writeBatch(db);
    activityIds.slice(i, i + 400).forEach((id) => batch.delete(ref(fb, db, `users/${uid}/progress/${id}`)));
    await batch.commit();
  }
}
