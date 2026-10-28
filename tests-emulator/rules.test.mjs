// Checks firestore.rules against the Firebase emulator:
//   npx firebase-tools emulators:start --only firestore --project demo-greenhill
//   npm run test:emulator
import test, { before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

let env;
const CODE = 'FAM12345';

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-greenhill',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
after(() => env.cleanup());

// A family with parent "mum", member "huda", a pending request from "omar",
// another family's parent "otherdad", and a child "zara" in no family.
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/mum'), { role: 'parent', familyCode: CODE });
    await setDoc(doc(db, `families/${CODE}`), { parentUid: 'mum' });
    await setDoc(doc(db, `families/${CODE}/private/settings`), { parentPasswordHash: 'x' });
    await setDoc(doc(db, 'users/huda'), { role: 'kid', username: 'huda', familyCode: CODE });
    await setDoc(doc(db, 'users/huda/progress/ch1-2'), { json: '{}' });
    await setDoc(doc(db, `families/${CODE}/members/huda`), { username: 'huda', summary: '{}' });
    await setDoc(doc(db, 'users/omar'), { role: 'kid', username: 'omar', familyCode: CODE });
    await setDoc(doc(db, 'users/omar/progress/ch1-2'), { json: '{}' });
    await setDoc(doc(db, `families/${CODE}/requests/omar`), { status: 'pending', username: 'omar' });
    await setDoc(doc(db, 'users/otherdad'), { role: 'parent', familyCode: 'OTHER999' });
    await setDoc(doc(db, 'families/OTHER999'), { parentUid: 'otherdad' });
    await setDoc(doc(db, 'users/zara'), { role: 'kid', username: 'zara', familyCode: null });
  });
});

const as = (uid) => env.authenticatedContext(uid).firestore();

test('a child reads and writes only their own account and progress', async () => {
  await assertSucceeds(getDoc(doc(as('huda'), 'users/huda/progress/ch1-2')));
  await assertSucceeds(setDoc(doc(as('huda'), 'users/huda/progress/ch1-3'), { json: '{}' }));
  await assertFails(getDoc(doc(as('huda'), 'users/omar/progress/ch1-2')));
  await assertFails(setDoc(doc(as('zara'), 'users/huda/progress/ch1-3'), { json: '{}' }));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users/huda')));
});

test('a child cannot turn their account into a parent account', async () => {
  await assertFails(updateDoc(doc(as('huda'), 'users/huda'), { role: 'parent' }));
});

test("the parent reads a member child's progress, but not a child who only asked to join", async () => {
  await assertSucceeds(getDoc(doc(as('mum'), 'users/huda')));
  await assertSucceeds(getDocs(collection(as('mum'), 'users/huda/progress')));
  await assertFails(getDoc(doc(as('mum'), 'users/omar/progress/ch1-2')));
  await assertFails(setDoc(doc(as('mum'), 'users/huda/progress/ch1-2'), { json: 'changed' }));
});

test("another family's parent sees nothing of this family", async () => {
  await assertFails(getDoc(doc(as('otherdad'), 'users/huda/progress/ch1-2')));
  await assertFails(getDocs(collection(as('otherdad'), `families/${CODE}/members`)));
  await assertFails(getDoc(doc(as('otherdad'), `families/${CODE}/private/settings`)));
  await assertFails(getDocs(collection(as('otherdad'), `families/${CODE}/requests`)));
});

test('any signed-in child can look up a family ID, but not list families', async () => {
  await assertSucceeds(getDoc(doc(as('zara'), `families/${CODE}`)));
  await assertFails(getDocs(collection(as('zara'), 'families')));
});

test('a child can ask to join, but cannot make themselves a member', async () => {
  await assertFails(setDoc(doc(as('zara'), `families/${CODE}/requests/zara`), { status: 'pending', username: 'zara' }));
  await assertSucceeds(updateDoc(doc(as('zara'), 'users/zara'), { familyCode: CODE }));
  await assertSucceeds(setDoc(doc(as('zara'), `families/${CODE}/requests/zara`), { status: 'pending', username: 'zara' }));
  await assertFails(setDoc(doc(as('zara'), `families/${CODE}/requests/zara`), { status: 'accepted', username: 'zara' }));
  await assertFails(setDoc(doc(as('zara'), `families/${CODE}/members/zara`), { username: 'zara' }));
  await assertFails(setDoc(doc(as('zara'), `families/${CODE}/requests/huda`), { status: 'pending' }));
});

test('the parent accepts a request (member added, request removed)', async () => {
  const db = as('mum');
  const batch = writeBatch(db);
  batch.set(doc(db, `families/${CODE}/members/omar`), { username: 'omar' });
  batch.delete(doc(db, `families/${CODE}/requests/omar`));
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(as('mum'), 'users/omar/progress/ch1-2')));
});

test('the parent cannot add a child who never asked', async () => {
  await assertFails(setDoc(doc(as('mum'), `families/${CODE}/members/zara`), { username: 'zara' }));
});

test('the parent rejects a request', async () => {
  await assertSucceeds(updateDoc(doc(as('mum'), `families/${CODE}/requests/omar`), { status: 'rejected' }));
  await assertSucceeds(getDoc(doc(as('omar'), `families/${CODE}/requests/omar`)));
});

test('family members see each other on the scoreboard; non-members do not', async () => {
  await assertSucceeds(getDocs(collection(as('huda'), `families/${CODE}/members`)));
  await assertFails(getDocs(collection(as('omar'), `families/${CODE}/members`)));
  await assertFails(getDocs(collection(as('zara'), `families/${CODE}/members`)));
});

test('a member updates only their own scoreboard summary', async () => {
  await assertSucceeds(updateDoc(doc(as('huda'), `families/${CODE}/members/huda`), { summary: '{"stars":5}', updatedAt: 'now' }));
  await assertFails(updateDoc(doc(as('huda'), `families/${CODE}/members/huda`), { joinedAt: 'yesterday' }));
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `families/${CODE}/members/omar`), { username: 'omar' }));
  await assertFails(updateDoc(doc(as('huda'), `families/${CODE}/members/omar`), { summary: '{"stars":0}' }));
});

test('members read the parent password hash for grown-up scoring; outsiders do not', async () => {
  await assertSucceeds(getDoc(doc(as('huda'), `families/${CODE}/private/settings`)));
  await assertFails(getDoc(doc(as('zara'), `families/${CODE}/private/settings`)));
  await assertFails(setDoc(doc(as('huda'), `families/${CODE}/private/settings`), { parentPasswordHash: 'y' }));
});

test('only the parent removes members; a child cannot leave or switch family', async () => {
  await assertFails(deleteDoc(doc(as('omar'), `families/${CODE}/members/huda`)));
  await assertFails(deleteDoc(doc(as('huda'), `families/${CODE}/members/huda`)));
  await assertFails(updateDoc(doc(as('huda'), 'users/huda'), { familyCode: null }));
  await assertFails(updateDoc(doc(as('huda'), 'users/huda'), { familyCode: 'OTHER999' }));
  await assertFails(setDoc(doc(as('huda'), 'families/OTHER999/requests/huda'), { status: 'pending', username: 'huda' }));
  await assertSucceeds(updateDoc(doc(as('huda'), 'users/huda'), { avatar: 'lina' }));
  // A child who only asked to join can change their mind.
  await assertSucceeds(deleteDoc(doc(as('omar'), `families/${CODE}/requests/omar`)));
  await assertSucceeds(updateDoc(doc(as('omar'), 'users/omar'), { familyCode: 'OTHER999' }));
  // Once the parent removes a child, the child can join another family.
  await assertSucceeds(deleteDoc(doc(as('mum'), `families/${CODE}/members/huda`)));
  await assertSucceeds(updateDoc(doc(as('huda'), 'users/huda'), { familyCode: 'OTHER999' }));
});

test("the parent deletes a member's account; the login cannot make a new one", async () => {
  await assertFails(deleteDoc(doc(as('huda'), 'users/huda')));
  await assertFails(deleteDoc(doc(as('otherdad'), 'users/huda/progress/ch1-2')));
  await assertFails(setDoc(doc(as('otherdad'), 'deleted/huda'), { deletedAt: 'now' }));
  await assertFails(deleteDoc(doc(as('mum'), 'users/omar'))); // only asked to join
  await assertSucceeds(deleteDoc(doc(as('mum'), 'users/huda/progress/ch1-2')));
  const db = as('mum');
  const batch = writeBatch(db);
  batch.set(doc(db, 'deleted/huda'), { deletedAt: 'now' });
  batch.delete(doc(db, 'users/huda'));
  batch.delete(doc(db, `families/${CODE}/members/huda`));
  batch.delete(doc(db, `families/${CODE}/requests/huda`));
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(as('huda'), 'deleted/huda')));
  await assertFails(getDoc(doc(as('zara'), 'deleted/huda')));
  await assertFails(setDoc(doc(as('huda'), 'users/huda'), { role: 'kid', username: 'huda' }));
});

test('a parent deletes their own family and account', async () => {
  const db = as('mum');
  const batch = writeBatch(db);
  batch.delete(doc(db, `families/${CODE}/members/huda`));
  batch.delete(doc(db, `families/${CODE}/requests/omar`));
  batch.delete(doc(db, `families/${CODE}/private/settings`));
  batch.delete(doc(db, `families/${CODE}`));
  await assertFails(deleteDoc(doc(as('otherdad'), `families/${CODE}`)));
  await assertSucceeds(batch.commit());
  await assertSucceeds(deleteDoc(doc(as('mum'), 'users/mum')));
});

test("nobody can take over someone else's family", async () => {
  await assertFails(updateDoc(doc(as('otherdad'), `families/${CODE}`), { parentUid: 'otherdad' }));
  await assertFails(updateDoc(doc(as('mum'), `families/${CODE}`), { parentUid: 'huda' }));
});

test('screen time: the child adds seconds (never fewer); the parent adds extra minutes', async () => {
  const day = 'users/huda/usage/2026-10-28';
  await assertSucceeds(setDoc(doc(as('huda'), day), { seconds: 60, updatedAt: 'now' }));
  await assertSucceeds(updateDoc(doc(as('huda'), day), { seconds: 120 }));
  await assertFails(updateDoc(doc(as('huda'), day), { seconds: 10 }));
  await assertFails(updateDoc(doc(as('huda'), day), { cheat: true }));
  await assertSucceeds(updateDoc(doc(as('huda'), day), { extraMinutes: 15 })); // grown-up on her tablet
  await assertSucceeds(getDoc(doc(as('mum'), day)));
  await assertSucceeds(updateDoc(doc(as('mum'), day), { extraMinutes: 30, updatedAt: 'later' }));
  await assertFails(updateDoc(doc(as('mum'), day), { seconds: 0 }));
  await assertSucceeds(setDoc(doc(as('mum'), 'users/huda/usage/2026-10-29'), { extraMinutes: 20, updatedAt: 'now' }));
  await assertFails(setDoc(doc(as('mum'), 'users/huda/usage/2026-10-30'), { seconds: 5 }));
  await assertFails(getDoc(doc(as('otherdad'), day)));
  await assertFails(setDoc(doc(as('otherdad'), 'users/huda/usage/2026-10-31'), { extraMinutes: 99 }));
  await assertFails(setDoc(doc(as('mum'), 'users/omar/usage/2026-10-28'), { extraMinutes: 99 })); // not a member yet
  await assertFails(getDoc(doc(as('zara'), day)));
});

test('only the parent sets a child’s daily limit', async () => {
  await assertSucceeds(updateDoc(doc(as('mum'), `families/${CODE}/members/huda`), { dailyLimit: 45 }));
  await assertFails(updateDoc(doc(as('huda'), `families/${CODE}/members/huda`), { dailyLimit: 0 }));
});
