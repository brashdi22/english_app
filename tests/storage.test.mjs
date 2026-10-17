import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/storage.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('progress is saved automatically shortly after a change', async () => {
  const storage = memoryStorage();
  const statuses = [];
  const store = createStore({ storage, onStatus: (s) => statuses.push(s) });
  store.createProfile('Ali', 'sam');
  store.updateActivity('ch1-2', (r) => { r.answers[0] = { value: ['girl'], done: true, earned: 1, possible: 1 }; });
  assert.equal(storage.data['englishApp.v1'], undefined, 'write is debounced');
  await wait(400);
  const saved = JSON.parse(storage.data['englishApp.v1']);
  const p = saved.profiles[saved.currentProfileId];
  assert.equal(p.name, 'Ali');
  assert.equal(p.progress['ch1-2'].answers[0].earned, 1);
  assert.equal(p.lastLocation, 'ch1-2');
  assert.ok(statuses.some((s) => s.ok));
});

test('flush writes immediately (used when the page is hidden or closed)', () => {
  const storage = memoryStorage();
  const store = createStore({ storage });
  store.createProfile('Mia', 'lina');
  store.flush();
  assert.ok(storage.data['englishApp.v1']);
});

test('saved progress is loaded on the next visit', () => {
  const storage = memoryStorage();
  const a = createStore({ storage });
  a.createProfile('Omar', 'ben');
  a.updateActivity('ch2-1', (r) => { r.completed = true; r.earned = 5; r.possible = 5; });
  a.flush();
  const b = createStore({ storage });
  assert.equal(b.profile().name, 'Omar');
  assert.equal(b.activityProgress('ch2-1').earned, 5);
});

test('trying again clears answers but keeps reading records', () => {
  const store = createStore({ storage: memoryStorage() });
  store.createProfile('Sara', 'dina');
  store.updateActivity('ch1-story', (r) => {
    r.completed = true;
    r.answers = [1];
    r.data.keep = { records: [{ seconds: 60, mistakes: 2 }] };
  });
  store.resetActivity('ch1-story');
  const rec = store.activityProgress('ch1-story');
  assert.equal(rec.completed, false);
  assert.deepEqual(rec.answers, []);
  assert.equal(rec.data.keep.records.length, 1);
});

test('broken saved data starts fresh instead of crashing', () => {
  const store = createStore({ storage: memoryStorage({ 'englishApp.v1': '{not json' }) });
  assert.equal(store.profile(), null);
});

test('backup export and import round-trip', () => {
  const a = createStore({ storage: memoryStorage() });
  a.createProfile('Huda', 'max');
  a.updateSettings({ rate: 0.7 });
  const json = a.exportData();
  const b = createStore({ storage: memoryStorage() });
  b.importData(json);
  assert.equal(b.profile().name, 'Huda');
  assert.equal(b.settings().rate, 0.7);
  assert.throws(() => b.importData('{"hello": 1}'));
});

test('failed writes are reported, not thrown', () => {
  const statuses = [];
  const storage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
  const store = createStore({ storage, onStatus: (s) => statuses.push(s) });
  store.createProfile('X', 'sam');
  assert.equal(store.flush(), false);
  assert.ok(statuses.some((s) => s.ok === false));
});
