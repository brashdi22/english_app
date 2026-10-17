// Auto-saving progress store. Every change goes through `update()`, which
// schedules a write to localStorage; pending writes are flushed when the page
// is hidden or closed so nothing is lost if the tab is shut mid-lesson.

const STORAGE_KEY = 'englishApp.v1';
const SAVE_DELAY_MS = 300;

export const DEFAULT_SETTINGS = {
  rate: 0.85,
  accent: 'en-US',
  voiceName: '',
  autoSpeak: true,
  listenEngine: 'offline',
};

function emptyState() {
  return { version: 1, currentProfileId: null, profiles: {} };
}

export function createStore({ storage = globalThis.localStorage, onStatus = () => {} } = {}) {
  let state = load();
  let timer = null;
  let dirty = false;
  const listeners = new Set();

  function load() {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.profiles) return emptyState();
      return parsed;
    } catch {
      return emptyState();
    }
  }

  function flush() {
    clearTimeout(timer);
    timer = null;
    if (!dirty) return true;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function profile() {
    return state.profiles[state.currentProfileId] || null;
  }

  function createProfile(name, avatar) {
    const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    update((s) => {
      s.profiles[id] = {
        id,
        name: name.trim() || 'Friend',
        avatar,
        createdAt: new Date().toISOString(),
        settings: { ...DEFAULT_SETTINGS },
        progress: {},
        lastLocation: null,
      };
      s.currentProfileId = id;
    });
    return id;
  }

  function selectProfile(id) {
    update((s) => { s.currentProfileId = id; });
  }

  function deleteProfile(id) {
    update((s) => {
      delete s.profiles[id];
      if (s.currentProfileId === id) s.currentProfileId = null;
    });
  }

  function activityProgress(activityId) {
    return profile()?.progress[activityId] || null;
  }

  function updateActivity(activityId, mutator) {
    update((s) => {
      const p = s.profiles[s.currentProfileId];
      if (!p) return;
      const rec = p.progress[activityId] || {
        index: 0, answers: [], data: {}, earned: 0, possible: 0,
        stars: 0, bestStars: 0, bestEarned: 0, completed: false, timesCompleted: 0,
      };
      rec.data ||= {};
      mutator(rec);
      rec.updatedAt = new Date().toISOString();
      p.progress[activityId] = rec;
      p.lastLocation = activityId;
    });
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
    update((s) => {
      const p = s.profiles[s.currentProfileId];
      if (p) p.settings = { ...DEFAULT_SETTINGS, ...p.settings, ...patch };
    });
  }

  function settings() {
    return { ...DEFAULT_SETTINGS, ...(profile()?.settings || {}) };
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
  }

  return {
    get state() { return state; },
    update, flush, profile, createProfile, selectProfile, deleteProfile,
    activityProgress, updateActivity, resetActivity,
    settings, updateSettings, exportData, importData,
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
