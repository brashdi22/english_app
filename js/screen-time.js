// Daily screen time for children in a family.
//
// The parent sets each child's daily limit (minutes; 0 = no limit) and can
// add extra minutes for a day, from their own device or with the grown-up
// password on the child's. The child's devices count the time the app is on
// screen and in use, and add it to users/{kid}/usage/{day}; every device of
// the child adds to the same total. The day starts at midnight on the device.

export const DEFAULT_LIMIT = 60; // minutes, until the parent changes it
export const WARN_SECONDS = 5 * 60;
const IDLE_MS = 3 * 60 * 1000; // no touch or key for this long: not counted
const TICK_MS = 5000;
const SEND_EVERY_SECONDS = 60;

export function dayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The limit of a family member (minutes; 0 = no limit).
export function limitOf(member) {
  if (!member) return 0;
  return Number.isFinite(member.dailyLimit) ? member.dailyLimit : DEFAULT_LIMIT;
}

// { limited, limitMinutes, extraMinutes, usedSeconds, remainingSeconds, timeUp }
export function timeState({ limit, extraMinutes = 0, usedSeconds = 0 }) {
  const limited = limit > 0;
  const remainingSeconds = limited ? Math.max(0, (limit + extraMinutes) * 60 - usedSeconds) : Infinity;
  return { limited, limitMinutes: limit, extraMinutes, usedSeconds, remainingSeconds, timeUp: limited && remainingSeconds <= 0 };
}

export const minutesText = (seconds) => {
  const m = Math.ceil(seconds / 60);
  return m === 1 ? '1 minute' : `${m} minutes`;
};

// Counts this device's time for a child and sends it to their account.
//   watchUsage(day, cb) → unsubscribe   cb({ seconds, extraMinutes })
//   addSeconds(day, n)                  adds n seconds to that day's total
//   getLimit() → minutes (0 = no limit); onChange() when the state changes
export function createScreenTimeTracker({
  watchUsage, addSeconds, getLimit, onChange,
  now = () => Date.now(), doc = globalThis.document, setTimer = setInterval, clearTimer = clearInterval,
}) {
  let day = null;
  let usage = { seconds: 0, extraMinutes: 0 };
  let unwatch = null;
  let pending = 0; // counted here, not sent yet
  let lastTick = now();
  let lastActive = now();
  let timer = null;
  let lastKey = '';

  const active = () => lastActive = now();
  const visible = () => !doc || doc.visibilityState !== 'hidden';

  function state() {
    return timeState({ limit: getLimit(), extraMinutes: usage.extraMinutes || 0, usedSeconds: (usage.seconds || 0) + pending });
  }

  function changed() {
    const s = state();
    // Tell the app when the minutes left or "time's up" change.
    const key = `${s.limited}:${s.timeUp}:${s.limited ? Math.ceil(s.remainingSeconds / 60) : ''}:${s.extraMinutes}`;
    if (key !== lastKey) {
      lastKey = key;
      onChange();
    }
  }

  function send() {
    const n = Math.floor(pending);
    if (n <= 0 || !day) return;
    pending -= n;
    Promise.resolve(addSeconds(day, n)).catch((err) => console.warn('Screen time:', err));
  }

  function openDay(d) {
    send();
    unwatch?.();
    day = d;
    usage = { seconds: 0, extraMinutes: 0 };
    unwatch = null;
    Promise.resolve(watchUsage(d, (u) => {
      if (day !== d) return;
      usage = { seconds: u?.seconds || 0, extraMinutes: u?.extraMinutes || 0 };
      changed();
    })).then((fn) => { if (day === d) unwatch = fn; else fn?.(); });
  }

  function tick() {
    const t = now();
    const d = dayKey(new Date(t));
    if (d !== day) openDay(d);
    const s = state();
    // Only time on screen and in use counts; a long gap (device asleep) does not.
    if (!s.timeUp && visible() && t - lastActive < IDLE_MS) {
      pending += Math.min(Math.max(0, t - lastTick), 2 * TICK_MS) / 1000;
    }
    lastTick = t;
    // Sent at once when the page is hidden or the time is up (so the parent sees it).
    if (pending >= SEND_EVERY_SECONDS || (pending >= 1 && (!visible() || state().timeUp))) send();
    changed();
  }

  const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];
  function onVisibility() {
    if (visible()) active();
    tick();
  }

  return {
    start() {
      if (timer) return;
      lastTick = now();
      active();
      openDay(dayKey(new Date(lastTick)));
      EVENTS.forEach((e) => globalThis.addEventListener?.(e, active, { passive: true, capture: true }));
      doc?.addEventListener?.('visibilitychange', onVisibility);
      timer = setTimer(tick, TICK_MS);
    },
    stop() {
      if (!timer) return;
      tick();
      send();
      clearTimer(timer);
      timer = null;
      EVENTS.forEach((e) => globalThis.removeEventListener?.(e, active, { capture: true }));
      doc?.removeEventListener?.('visibilitychange', onVisibility);
      unwatch?.();
      unwatch = null;
      day = null;
      lastKey = '';
    },
    flush: send,
    tick,
    noteActivity: active,
    state,
    get day() { return day; },
  };
}
