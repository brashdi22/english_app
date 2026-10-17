// The family: children's logins, the parent password, and keeping every
// device in step.
//
// With Firebase set up (cloud-config.js), a family account is signed in once
// on each device. Progress is saved on the device straight away (so it works
// offline) and sent to the family's online data; changes from other devices
// come back and replace older ones, activity by activity.
//
// Without Firebase, the same logins work but everything stays on this device.

import * as cloud from './cloud.js';
import { computeSummary } from './progress.js';
import { checkParentPassword, hashParentPassword, hashPin, checkPin, DEFAULT_PARENT_PASSWORD } from './accounts.js';
import { LOCAL_KEY, newProfileId } from './storage.js';

const SEND_DELAY_MS = 800;
const SUMMARY_DELAY_MS = 2500;
const SIGNED_OUT_KEY = 'englishApp.signedOut';

export function createFamily(store, { onUpdate = () => {}, storage = globalThis.localStorage } = {}) {
  const mode = cloud.configured ? 'cloud' : 'local';
  let user = null;
  let familyData = null;
  let authKnown = mode === 'local';
  let childrenLoaded = mode === 'local';
  let familyUnsubs = [];
  const progressWatches = new Map();
  const outbox = new Map();
  let sendTimer = null;
  const summaryTimers = new Map();

  const familyId = () => user?.id;
  const update = () => onUpdate();
  const warn = (err) => console.warn('Family sync:', err);

  // ------------------------------------------------------------- startup
  async function start() {
    if (mode !== 'cloud') return;
    await cloud.onAuth((u) => {
      stopWatching();
      user = u;
      authKnown = true;
      familyData = null;
      childrenLoaded = false;
      store.switchKey(u ? `englishApp.family.${u.id}` : SIGNED_OUT_KEY);
      if (u) watchFamily();
      update();
    });
  }

  async function watchFamily() {
    const id = familyId();
    familyUnsubs.push(await cloud.watchFamily(id, (data) => { familyData = data; update(); }));
    familyUnsubs.push(await cloud.watchChildren(id, (changes) => {
      for (const { type, child } of changes) {
        if (type === 'removed') store.removeRemoteProfile(child.id);
        else store.applyRemoteProfile(child);
      }
      childrenLoaded = true;
      // Keep the logged-in child's progress up to date.
      const current = store.state.currentProfileId;
      if (current && store.state.profiles[current]) watchProgress(current);
      update();
    }));
  }

  function stopWatching() {
    familyUnsubs.forEach((u) => u());
    familyUnsubs = [];
    progressWatches.forEach((u) => u.then((fn) => fn && fn()));
    progressWatches.clear();
  }

  function watchProgress(childId) {
    if (mode !== 'cloud' || !familyId() || progressWatches.has(childId)) return;
    progressWatches.set(childId, cloud.watchProgress(familyId(), childId, (changes) => {
      let changed = false;
      for (const { activityId, record } of changes) {
        if (store.applyRemoteActivity(childId, activityId, record)) changed = true;
      }
      if (changed) update();
    }).catch(warn));
  }

  // The parent dashboard shows everyone, so it follows every child.
  function watchAllProgress() {
    Object.keys(store.state.profiles).forEach(watchProgress);
  }

  // ------------------------------------------------- changes on this device
  function handleChange(evt) {
    if (mode !== 'cloud' || !familyId()) return;
    const id = familyId();
    const profile = store.state.profiles[evt.profileId];
    switch (evt.type) {
      case 'activity':
        outbox.set(`${evt.profileId}/${evt.activityId}`, { childId: evt.profileId, activityId: evt.activityId, record: evt.record });
        clearTimeout(sendTimer);
        sendTimer = setTimeout(sendOutbox, SEND_DELAY_MS);
        scheduleSummary(evt.profileId);
        break;
      case 'profile':
        if (profile) cloud.saveChild(id, childRecord(profile)).catch(warn);
        break;
      case 'delete':
        cloud.deleteChild(id, evt.profileId).catch(warn);
        break;
      case 'reset':
        cloud.deleteProgress(id, evt.profileId, evt.activityIds).catch(warn);
        cloud.saveChild(id, { id: evt.profileId, summary: computeSummary({}), lastLocation: null }).catch(warn);
        break;
      case 'import':
        if (profile) uploadProfile(profile);
        break;
      default:
        break;
    }
  }

  function childRecord(p) {
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      pinHash: p.pinHash ?? null,
      settings: p.settings,
      lastLocation: p.lastLocation ?? null,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    };
  }

  function sendOutbox() {
    const id = familyId();
    if (!id) return;
    const byChild = new Map();
    for (const entry of outbox.values()) {
      if (!byChild.has(entry.childId)) byChild.set(entry.childId, []);
      byChild.get(entry.childId).push(entry);
    }
    outbox.clear();
    for (const [childId, entries] of byChild) cloud.saveProgress(id, childId, entries).catch(warn);
  }

  function scheduleSummary(childId) {
    clearTimeout(summaryTimers.get(childId));
    summaryTimers.set(childId, setTimeout(() => {
      const p = store.state.profiles[childId];
      if (!p || !familyId()) return;
      cloud.saveChild(familyId(), { id: childId, summary: computeSummary(p.progress), lastLocation: p.lastLocation ?? null }).catch(warn);
    }, SUMMARY_DELAY_MS));
  }

  // Sends everything still waiting (e.g. when the app is closed).
  function flush() {
    if (mode !== 'cloud') return;
    clearTimeout(sendTimer);
    sendOutbox();
    for (const [childId, timer] of summaryTimers) {
      clearTimeout(timer);
      const p = store.state.profiles[childId];
      if (p && familyId()) cloud.saveChild(familyId(), { id: childId, summary: computeSummary(p.progress), lastLocation: p.lastLocation ?? null }).catch(warn);
    }
    summaryTimers.clear();
  }

  function uploadProfile(p) {
    const id = familyId();
    if (!id) return;
    cloud.saveChild(id, { ...childRecord(p), summary: computeSummary(p.progress) }).catch(warn);
    const entries = Object.entries(p.progress).map(([activityId, record]) => ({ childId: p.id, activityId, record }));
    for (let i = 0; i < entries.length; i += 400) cloud.saveProgress(id, p.id, entries.slice(i, i + 400)).catch(warn);
  }

  // ----------------------------------------------------- family account
  async function signUp(email, password) {
    const u = await cloud.signUp(email, password);
    await cloud.saveFamily(u.id, { createdAt: new Date().toISOString(), parentPasswordHash: await hashParentPassword(DEFAULT_PARENT_PASSWORD) });
    return u;
  }

  async function signIn(email, password) {
    return cloud.signIn(email, password);
  }

  async function signOut() {
    flush();
    store.selectProfile(null);
    store.flush();
    await cloud.signOut();
  }

  // --------------------------------------------------------- parent password
  function parentHash() {
    return mode === 'cloud' ? familyData?.parentPasswordHash : store.state.parentPasswordHash;
  }

  const checkParent = (password) => checkParentPassword(password, parentHash());

  async function setParentPassword(password) {
    const hash = await hashParentPassword(password);
    if (mode === 'cloud') await cloud.saveFamily(familyId(), { parentPasswordHash: hash });
    else store.setParentPasswordHash(hash);
  }

  // ------------------------------------------------------------- children
  async function addChild(name, avatar, pin) {
    const id = newProfileId();
    const pinHash = pin ? await hashPin(pin, id) : null;
    store.createProfile(name, avatar, { id, pinHash, select: false });
    return id;
  }

  async function setPin(childId, pin) {
    const pinHash = pin ? await hashPin(pin, childId) : null;
    store.updateProfile(childId, (p) => { p.pinHash = pinHash; });
  }

  async function loginChild(childId, pin) {
    const child = store.state.profiles[childId];
    if (!child || !(await checkPin(pin, child))) return false;
    store.selectProfile(childId);
    watchProgress(childId);
    return true;
  }

  function logout() {
    flush();
    store.selectProfile(null);
  }

  // Learners saved on this device before the family account existed.
  function localLearners() {
    if (mode !== 'cloud') return [];
    try {
      const saved = JSON.parse(storage.getItem(LOCAL_KEY) || 'null');
      return Object.values(saved?.profiles || {}).filter((p) => !store.state.profiles[p.id]);
    } catch {
      return [];
    }
  }

  function importLocalLearners() {
    const learners = localLearners();
    for (const p of learners) {
      store.update((s) => { s.profiles[p.id] = { ...p, pinHash: p.pinHash ?? null, updatedAt: new Date().toISOString() }; });
      uploadProfile(store.state.profiles[p.id]);
    }
    return learners.length;
  }

  return {
    mode,
    start,
    handleChange,
    flush,
    get user() { return user; },
    get ready() { return authKnown && (!user || childrenLoaded || mode === 'local'); },
    signedIn: () => mode === 'local' || Boolean(user),
    signUp, signIn, signOut, resetPassword: (email) => cloud.resetPassword(email),
    errorMessage: cloud.errorMessage,
    checkParent, setParentPassword,
    addChild, setPin, loginChild, logout,
    watchAllProgress,
    localLearners, importLocalLearners,
  };
}
