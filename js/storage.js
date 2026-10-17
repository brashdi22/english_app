// Auto-saving progress store. Every change goes through `update()`, which
// schedules a write to localStorage; pending writes are flushed when the page
// is hidden or closed so nothing is lost if the tab is shut mid-lesson.
//
// Changes made on this device are also reported through `onChange`, so the
// family sync (family.js) can send them to the other devices. Changes that
// arrive from other devices go through the `applyRemote…` functions, which
// don't report them back.

export const LOCAL_KEY = 'englishApp.v1';
const SAVE_DELAY_MS = 300;

export const DEFAULT_SETTINGS = {
  rate: 0.85,
  accent: 'en-US',
  voiceName: '',
  autoSpeak: true,
  listenEngine: 'offline',
};

function emptyState() {
  return { version: 1, currentProfileId: null, profiles: {}, parentPasswordHash: null };
}

export function newProfileId() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const newer = (a, b) => (Date.parse(a || 0) || 0) > (Date.parse(b || 0) || 0);

export function createStore({ storage = globalThis.localStorage, key = LOCAL_KEY, onStatus = () => {}, onChange = () => {} } = {}) {
  let storageKey = key;
  let state = load();
  let timer = null;
  let dirty = false;
  const listeners = new Set();

  function load() {
    try {
      const raw = storage?.getItem(storageKey);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.profiles) return emptyState();
      return { ...emptyState(), ...parsed };
    } catch {
      return emptyState();
    }
  }

  function flush() {
    clearTimeout(timer);
    timer = null;
    if (!dirty) return true;
    try {
      storage.setItem(storageKey, JSON.stringify(state));
      dirty = false;
      onStatus({ ok: true, at: new Date() });
      return true;
    } catch (err) {
      onStatus({ ok: false, error: err });
      return false;
    }
  }

  function update(mutator) {
    mutator(state);
    dirty = true;
    onStatus({ pending: true });
    clearTimeout(timer);
    timer = setTimeout(flush, SAVE_DELAY_MS);
    listeners.forEach((fn) => fn(state));
  }

  // Each family account keeps its own saved copy on the device.
  function switchKey(nextKey) {
    if (nextKey === storageKey) return;
    flush();
    storageKey = nextKey;
    state = load();
    listeners.forEach((fn) => fn(state));
  }

  function profile() {
    return state.profiles[state.currentProfileId] || null;
  }

  function createProfile(name, avatar, { id = newProfileId(), pinHash = null, select = true } = {}) {
    update((s) => {
      s.profiles[id] = {
        id,
        name: name.trim() || 'Friend',
        avatar,
        pinHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { ...DEFAULT_SETTINGS },
        progress: {},
        lastLocation: null,
      };
      if (select) s.currentProfileId = id;
    });
    onChange({ type: 'profile', profileId: id });
    return id;
  }

  function updateProfile(id, mutator) {
    if (!state.profiles[id]) return;
    update((s) => {
      mutator(s.profiles[id]);
      s.profiles[id].updatedAt = new Date().toISOString();
    });
    onChange({ type: 'profile', profileId: id });
  }

  // Logging in and out only changes this device, never the family data.
  function selectProfile(id) {
    update((s) => { s.currentProfileId = id; });
  }

  function deleteProfile(id) {
    update((s) => {
      delete s.profiles[id];
      if (s.currentProfileId === id) s.currentProfileId = null;
    });
    onChange({ type: 'delete', profileId: id });
  }

  function resetProgress(id) {
    if (!state.profiles[id]) return;
    const activityIds = Object.keys(state.profiles[id].progress);
    update((s) => {
      s.profiles[id].progress = {};
      s.profiles[id].lastLocation = null;
      s.profiles[id].summary = null;
    });
    onChange({ type: 'reset', profileId: id, activityIds });
  }

  function activityProgress(activityId) {
    return profile()?.progress[activityId] || null;
  }

  function updateActivity(activityId, mutator) {
    const id = state.currentProfileId;
    if (!state.profiles[id]) return;
    let rec;
    update((s) => {
      const p = s.profiles[id];
      rec = p.progress[activityId] || {
        index: 0, answers: [], data: {}, earned: 0, possible: 0,
        stars: 0, bestStars: 0, bestEarned: 0, completed: false, timesCompleted: 0,
      };
      rec.data ||= {};
      mutator(rec);
      rec.updatedAt = new Date().toISOString();
      p.progress[activityId] = rec;
      p.lastLocation = activityId;
    });
    onChange({ type: 'activity', profileId: id, activityId, record: rec });
  }

  function resetActivity(activityId) {
    updateActivity(activityId, (rec) => {
      rec.index = 0;
      rec.answers = [];
      // `keep` holds history that survives a retry (e.g. reading records).
      rec.data = rec.data?.keep ? { keep: rec.data.keep } : {};
      rec.earned = 0;
      rec.possible = 0;
      rec.stars = 0;
      rec.completed = false;
    });
  }

  function updateSettings(patch) {
    const id = state.currentProfileId;
    updateProfile(id, (p) => { p.settings = { ...DEFAULT_SETTINGS, ...p.settings, ...patch }; });
  }

  function settings() {
    return { ...DEFAULT_SETTINGS, ...(profile()?.settings || {}) };
  }

  // ------------------------------------------------- from other devices
  // An activity record from another device replaces ours only if it is newer.
  function applyRemoteActivity(profileId, activityId, record) {
    const p = state.profiles[profileId];
    if (!p || !record) return false;
    const mine = p.progress[activityId];
    if (mine && !newer(record.updatedAt, mine.updatedAt)) return false;
    update((s) => { s.profiles[profileId].progress[activityId] = record; });
    return true;
  }

  function applyRemoteProfile(remote) {
    const mine = state.profiles[remote.id];
    if (mine && !newer(remote.updatedAt, mine.updatedAt) && mine.summary?.updatedAt === remote.summary?.updatedAt) return;
    update((s) => {
      const base = s.profiles[remote.id] || { progress: {}, lastLocation: null, createdAt: remote.createdAt };
      const takeFields = !mine || newer(remote.updatedAt, mine.updatedAt);
      s.profiles[remote.id] = {
        ...base,
        id: remote.id,
        ...(takeFields ? {
          name: remote.name,
          avatar: remote.avatar,
          pinHash: remote.pinHash ?? null,
          settings: { ...DEFAULT_SETTINGS, ...(remote.settings || {}) },
          updatedAt: remote.updatedAt,
          lastLocation: remote.lastLocation ?? base.lastLocation,
        } : {}),
        summary: remote.summary || base.summary || null,
      };
    });
  }

  function removeRemoteProfile(id) {
    if (!state.profiles[id]) return;
    update((s) => {
      delete s.profiles[id];
      if (s.currentProfileId === id) s.currentProfileId = null;
    });
  }

  function setParentPasswordHash(hash) {
    update((s) => { s.parentPasswordHash = hash; });
  }

  function exportData() {
    flush();
    return JSON.stringify(state, null, 2);
  }

  function importData(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.profiles !== 'object') {
      throw new Error('This file does not look like saved progress.');
    }
    update((s) => {
      Object.assign(s, emptyState(), parsed);
    });
    flush();
    Object.keys(state.profiles).forEach((profileId) => onChange({ type: 'import', profileId }));
  }

  return {
    get state() { return state; },
    get key() { return storageKey; },
    update, flush, switchKey, profile, createProfile, updateProfile, selectProfile, deleteProfile, resetProgress,
    activityProgress, updateActivity, resetActivity,
    settings, updateSettings, exportData, importData,
    applyRemoteActivity, applyRemoteProfile, removeRemoteProfile, setParentPasswordHash,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

// Save immediately whenever the app is backgrounded or closed.
export function flushOnExit(store) {
  const flush = () => store.flush();
  addEventListener('pagehide', flush);
  addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  // Ask the browser not to evict saved progress when space runs low.
  navigator.storage?.persist?.().catch(() => {});
}
