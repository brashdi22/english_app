// Checks tools/admin.mjs against the Firebase emulator:
//   npx firebase-tools emulators:start --only auth,firestore --project demo-greenhill
//   npm run test:emulator
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { kidEmail, kidPassword } from '../js/cloud.js';
import { hashParentPassword } from '../js/accounts.js';

const PROJECT = 'demo-greenhill';
const CODE = 'ADMN2345';
const admin = fileURLToPath(new URL('../tools/admin.mjs', import.meta.url));

const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT }, 'admin-test');
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

// Test data is written with the Admin SDK, which skips the security rules.
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
const adminApp = initializeAdmin({ projectId: PROJECT }, 'admin-test');
const db = getFirestore(adminApp);

function run(...args) {
  return new Promise((resolve) => {
    execFile('node', [admin, ...args, '--emulator'], (err, stdout, stderr) => {
      resolve({ code: err ? err.code : 0, out: stdout + stderr });
    });
  });
}

const canSignIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  .then(() => signOut(auth)).then(() => true, () => false);

// A parent with family CODE, and a child "sami" (PIN 1234) who is a member.
before(async () => {
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  const mum = (await createUserWithEmailAndPassword(auth, 'mum@example.com', 'oldpassword')).user.uid;
  const sami = (await createUserWithEmailAndPassword(auth, kidEmail('sami'), kidPassword('1234'))).user.uid;
  await signOut(auth);
  await db.doc(`users/${mum}`).set({ role: 'parent', email: 'mum@example.com', familyCode: CODE });
  await db.doc(`families/${CODE}`).set({ parentUid: mum });
  await db.doc(`families/${CODE}/private/settings`).set({ parentPasswordHash: await hashParentPassword('adminpass') });
  await db.doc(`users/${sami}`).set({ role: 'kid', username: 'sami', familyCode: CODE });
  await db.doc(`families/${CODE}/members/${sami}`).set({ username: 'sami', summary: '{}' });
});
after(async () => {
  await deleteApp(app);
  await deleteAdmin(adminApp);
});

test('kid-pin sets a new PIN; the old one stops working', async () => {
  const r = await run('kid-pin', 'Sami', '98765');
  assert.equal(r.code, 0, r.out);
  assert.ok(await canSignIn(kidEmail('sami'), kidPassword('98765')));
  assert.ok(!(await canSignIn(kidEmail('sami'), kidPassword('1234'))));
});

test('kid-pin refuses a bad PIN or an unknown child', async () => {
  assert.match((await run('kid-pin', 'sami', '12')).out, /4 to 8 numbers/);
  assert.match((await run('kid-pin', 'sami', 'abcd')).out, /4 to 8 numbers/);
  const r = await run('kid-pin', 'nobody', '1234');
  assert.equal(r.code, 1);
  assert.match(r.out, /no child with the username "nobody"/);
});

test('parent-password sets a new login password', async () => {
  const r = await run('parent-password', 'mum@example.com', 'newpassword');
  assert.equal(r.code, 0, r.out);
  assert.ok(await canSignIn('mum@example.com', 'newpassword'));
  assert.ok(!(await canSignIn('mum@example.com', 'oldpassword')));
  assert.match((await run('parent-password', 'mum@example.com', 'short')).out, /at least 6/);
  assert.match((await run('parent-password', kidEmail('sami'), 'longenough')).out, /child's account/);
});

test('grownup-password changes the family password, by family ID or parent email', async () => {
  const settings = async () => (await db.doc(`families/${CODE}/private/settings`).get()).get('parentPasswordHash');
  assert.equal((await run('grownup-password', 'admn-2345', 'letmein')).code, 0);
  assert.equal(await settings(), await hashParentPassword('letmein'));
  assert.equal((await run('grownup-password', 'mum@example.com', 'again')).code, 0);
  assert.equal(await settings(), await hashParentPassword('again'));
  assert.match((await run('grownup-password', 'ZZZZ9999', 'x')).out, /no family with the ID ZZZZ9999/);
});

test('list shows children and parents with their family', async () => {
  const r = await run('list');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Children \(1\):\n {2}sami {2}ADMN2345/);
  assert.match(r.out, /Parents \(1\):\n {2}mum@example.com {2}ADMN2345/);
});

test('without a key it explains what to do', async () => {
  const r = await new Promise((resolve) => execFile('node', [admin, 'list'], { env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: '' } },
    (err, stdout, stderr) => resolve({ code: err?.code, out: stdout + stderr })));
  assert.equal(r.code, 1);
  assert.match(r.out, /--key/);
});
