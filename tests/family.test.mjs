// Logins, the parent password, syncing rules and the summaries used by the
// parent dashboard and the scoreboard.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/storage.js';
import { createFamily } from '../js/family.js';
import { checkParentPassword, hashParentPassword, checkPin, hashPin, validPin } from '../js/accounts.js';
import { computeSummary, summaryFor } from '../js/progress.js';

function memoryStorage() {
  const data = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } };
}

test('the parent password is "adminpass" until it is changed', async () => {
  assert.ok(await checkParentPassword('adminpass', null));
  assert.ok(!(await checkParentPassword('wrong', null)));
  const changed = await hashParentPassword('newpass1');
  assert.ok(await checkParentPassword('newpass1', changed));
  assert.ok(!(await checkParentPassword('adminpass', changed)));
});

test('passwords and PINs are stored only as hashes', async () => {
  const hash = await hashParentPassword('adminpass');
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.ok(!hash.includes('adminpass'));
  // The same PIN gives a different hash for each child.
  assert.notEqual(await hashPin('1234', 'a'), await hashPin('1234', 'b'));
});

test('PINs are 4 numbers', () => {
  assert.ok(validPin('0427'));
  assert.ok(!validPin('123'));
  assert.ok(!validPin('12a4'));
});

test('a child logs in with the right PIN only (this-device family)', async () => {
  const store = createStore({ storage: memoryStorage() });
  const family = createFamily(store, { mode: 'local' });
  assert.equal(family.mode, 'local');
  const id = await family.addChild('Huda', 'lina', '2580');
  assert.equal(store.profile(), null, 'adding a child does not log them in');
  assert.ok(!(await family.loginChild(id, '1111')));
  assert.equal(store.profile(), null);
  assert.ok(await family.loginChild(id, '2580'));
  assert.equal(store.profile().name, 'Huda');
  family.logout();
  assert.equal(store.profile(), null);
});

test('the parent can change the parent password (this-device family)', async () => {
  const store = createStore({ storage: memoryStorage() });
  const family = createFamily(store, { mode: 'local' });
  assert.ok(await family.checkParent('adminpass'));
  await family.setParentPassword('secret99');
  assert.ok(await family.checkParent('secret99'));
  assert.ok(!(await family.checkParent('adminpass')));
});

test('a child without a PIN (from before logins) can still log in', async () => {
  const store = createStore({ storage: memoryStorage() });
  const id = store.createProfile('Omar', 'ben', { select: false });
  assert.ok(await checkPin('', store.state.profiles[id]));
});

test('changes on this device are reported for syncing', () => {
  const events = [];
  const store = createStore({ storage: memoryStorage(), onChange: (e) => events.push(e) });
  const id = store.createProfile('Ali', 'sam');
  store.updateActivity('ch1-2', (r) => { r.completed = true; });
  store.updateSettings({ rate: 0.7 });
  assert.deepEqual(events.map((e) => e.type), ['profile', 'activity', 'profile']);
  assert.equal(events[1].profileId, id);
  assert.equal(events[1].activityId, 'ch1-2');
});

test('progress from another device replaces older progress only', () => {
  const events = [];
  const store = createStore({ storage: memoryStorage(), onChange: (e) => events.push(e) });
  const id = store.createProfile('Ali', 'sam');
  store.updateActivity('ch1-2', (r) => { r.earned = 3; });
  const mine = store.activityProgress('ch1-2');
  const older = { ...mine, earned: 1, updatedAt: '2000-01-01T00:00:00.000Z' };
  const newer = { ...mine, earned: 6, updatedAt: new Date(Date.now() + 60000).toISOString() };
  events.length = 0;
  assert.equal(store.applyRemoteActivity(id, 'ch1-2', older), false);
  assert.equal(store.activityProgress('ch1-2').earned, 3);
  assert.equal(store.applyRemoteActivity(id, 'ch1-2', newer), true);
  assert.equal(store.activityProgress('ch1-2').earned, 6);
  assert.equal(events.length, 0, 'changes from other devices are not sent back');
});

test('children added on another device appear here', () => {
  const store = createStore({ storage: memoryStorage() });
  store.applyRemoteProfile({ id: 'k1', name: 'Mia', avatar: 'dina', pinHash: 'x', updatedAt: new Date().toISOString(), summary: { stars: 5, updatedAt: new Date().toISOString() } });
  assert.equal(store.state.profiles.k1.name, 'Mia');
  assert.deepEqual(store.state.profiles.k1.progress, {});
  store.removeRemoteProfile('k1');
  assert.equal(store.state.profiles.k1, undefined);
});

test('a summary counts stars, finished reviews and reading speed', () => {
  const now = Date.now();
  const iso = new Date(now).toISOString();
  const progress = {
    'ch1-15': { completed: true, earned: 4, possible: 4, bestStars: 3, completedAt: iso, updatedAt: iso },
    'ch1-16': { completed: true, earned: 4, possible: 4, bestStars: 3, completedAt: iso, updatedAt: iso },
    'ch1-17': { completed: true, earned: 3, possible: 4, bestStars: 2, completedAt: '2000-01-01T00:00:00Z', updatedAt: iso },
    'ch1-story': { completed: true, bestStars: 0, data: { keep: { records: [{ seconds: 60, mistakes: 2, words: 51 }] } }, updatedAt: iso },
    'ch1-say': { completed: true, bestStars: 3, answers: [{ stars: 3 }, { stars: 0 }, { stars: 1 }], updatedAt: iso },
  };
  const s = computeSummary(progress, now);
  assert.equal(s.stars, 11);
  assert.equal(s.starsThisWeek, 6, 'only activities finished in the last 7 days');
  assert.equal(s.units.ch1.score.earned, 11);
  assert.equal(s.units.ch1.stars, 3, 'Chapter 1 Review 11/12 is ★★★');
  assert.equal(s.unitsFinished, 1);
  assert.equal(s.reviewPercent, 92);
  assert.equal(s.bestWpm, 51);
  assert.equal(s.wordsSaid, 2);
});

test('the newest summary is used: from this device or from another', () => {
  const old = '2000-01-01T00:00:00.000Z';
  const recent = new Date().toISOString();
  const fromOtherDevice = { stars: 99, updatedAt: recent };
  assert.equal(summaryFor({ progress: { x: { bestStars: 1, updatedAt: old } }, summary: fromOtherDevice }).stars, 99);
  const stale = { stars: 1, updatedAt: old };
  assert.equal(summaryFor({ progress: { 'ch1-2': { bestStars: 3, updatedAt: recent } }, summary: stale }).stars, 3);
});
