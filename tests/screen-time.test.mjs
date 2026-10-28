import test from 'node:test';
import assert from 'node:assert/strict';
import { createScreenTimeTracker, timeState, limitOf, dayKey, DEFAULT_LIMIT } from '../js/screen-time.js';

// A tracker with a fake clock, page visibility and account.
function setup({ limit = 60, start = new Date(2026, 9, 28, 10, 0, 0) } = {}) {
  let t = start.getTime();
  const doc = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  const server = {}; // day → { seconds, extraMinutes }
  const watchers = {};
  let changes = 0;
  const emit = (day) => watchers[day]?.(server[day] || null);
  const tracker = createScreenTimeTracker({
    watchUsage: (day, cb) => { watchers[day] = cb; emit(day); return () => { delete watchers[day]; }; },
    addSeconds: (day, n) => { server[day] = { ...server[day], seconds: (server[day]?.seconds || 0) + n }; emit(day); },
    getLimit: () => limit,
    onChange: () => { changes++; },
    now: () => t,
    doc,
    setTimer: () => 1,
    clearTimer: () => {},
  });
  // Moves the clock on in 5-second ticks; `touch` keeps the child active.
  const run = async (seconds, { touch = true } = {}) => {
    for (let i = 0; i < seconds / 5; i++) {
      t += 5000;
      if (touch) tracker.noteActivity();
      tracker.tick();
    }
    await Promise.resolve();
  };
  return { tracker, run, doc, server, setLimit: (n) => { limit = n; }, addExtra: (day, m) => { server[day] = { ...server[day], extraMinutes: (server[day]?.extraMinutes || 0) + m }; emit(day); }, get changes() { return changes; }, now: () => t, setNow: (d) => { t = d.getTime(); } };
}

test('limits: a missing limit is the default; 0 is no limit; not in a family is no limit', () => {
  assert.equal(limitOf({}), DEFAULT_LIMIT);
  assert.equal(limitOf({ dailyLimit: 45 }), 45);
  assert.equal(limitOf({ dailyLimit: 0 }), 0);
  assert.equal(limitOf(null), 0);
  assert.deepEqual(timeState({ limit: 0, usedSeconds: 99999 }).timeUp, false);
  assert.equal(timeState({ limit: 60, usedSeconds: 3600 }).timeUp, true);
  assert.equal(timeState({ limit: 60, extraMinutes: 10, usedSeconds: 3600 }).remainingSeconds, 600);
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('time in use is counted and sent about once a minute', async () => {
  const s = setup();
  s.tracker.start();
  await s.run(90);
  const day = dayKey(new Date(s.now()));
  assert.equal(s.server[day].seconds, 60);
  assert.equal(Math.round(s.tracker.state().usedSeconds), 90);
  s.tracker.flush();
  assert.equal(s.server[day].seconds, 90);
});

test('a hidden page, or no touch for 3 minutes, is not counted', async () => {
  const s = setup();
  s.tracker.start();
  s.doc.visibilityState = 'hidden';
  await s.run(120);
  assert.equal(Math.round(s.tracker.state().usedSeconds), 0);
  s.doc.visibilityState = 'visible';
  s.tracker.noteActivity();
  await s.run(600, { touch: false });
  // Counted until the child had been still for 3 minutes.
  assert.ok(Math.abs(s.tracker.state().usedSeconds - 180) <= 5, String(s.tracker.state().usedSeconds));
});

test('a device asleep for an hour does not count the hour', async () => {
  const s = setup();
  s.tracker.start();
  s.setNow(new Date(s.now() + 3600 * 1000));
  s.tracker.tick();
  assert.ok(s.tracker.state().usedSeconds <= 10);
});

test('time from other devices adds up, and time is up at the limit', async () => {
  const s = setup({ limit: 30 });
  s.tracker.start();
  const day = dayKey(new Date(s.now()));
  s.server[day] = { seconds: 29 * 60 };
  s.addExtra(day, 0); // another device's minutes arrive
  assert.equal(s.tracker.state().timeUp, false);
  await s.run(60);
  assert.equal(s.tracker.state().timeUp, true);
  const used = s.tracker.state().usedSeconds;
  await s.run(60);
  assert.equal(s.tracker.state().usedSeconds, used, 'no counting after time is up');
  s.addExtra(day, 10); // the parent adds 10 minutes
  assert.equal(s.tracker.state().timeUp, false);
  assert.equal(Math.ceil(s.tracker.state().remainingSeconds / 60), 10);
});

test('a new day starts from zero', async () => {
  const s = setup({ start: new Date(2026, 9, 28, 23, 59, 0) });
  s.tracker.start();
  await s.run(30);
  await s.run(60);
  assert.ok(s.tracker.state().usedSeconds < 61, 'counting started again after midnight');
  assert.ok(s.server['2026-10-28'].seconds >= 55, 'the minute before midnight was sent to the old day');
});

test('a change of limit is reported', async () => {
  const s = setup({ limit: 60 });
  s.tracker.start();
  const before = s.changes;
  s.setLimit(0);
  s.tracker.tick();
  assert.ok(s.changes > before);
  assert.equal(s.tracker.state().limited, false);
});
