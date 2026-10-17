// Accounts, families, the parent password, and keeping devices in step.
//
// With Firebase set up (cloud-config.js), every child has their own account
// (username + PIN) and can log in on any device. A parent has an account
// (email + password) with a family ID. Children ask to join a family with
// that ID; the parent accepts or rejects. The parent then sees each member's
// progress, and members see each other on the scoreboard. A child's work is
// saved on the device straight away (so it works offline) and synced to
// their account, activity by activity; the newest change wins.
//
// Without Firebase, children are added by the parent on this device and log
// in with a PIN; everything stays on this device.

import * as cloud from './cloud.js';
import { computeSummary, summaryFor } from './progress.js';
import { checkParentPassword, hashParentPassword, hashPin, checkPin, DEFAULT_PARENT_PASSWORD } from './accounts.js';
import { newProfileId, DEFAULT_SETTINGS } from './storage.js';

const SEND_DELAY_MS = 800;
const SUMMARY_DELAY_MS = 2500;
const SIGNED_OUT_KEY = 'englishApp.signedOut';
const RECENT_KEY = 'englishApp.recentKids';

export function createFamily(store, { onUpdate = () => {}, storage = globalThis.localStorage, mode = cloud.configured ? 'cloud' : 'local' } = {}) {
  const update = () => onUpdate();
  const warn = (err) => console.warn('Sync:', err);

  // Cloud state.
  let account = null; // { uid, role, username | email, avatar, familyCode, ... }
  let authKnown = mode === 'local';
  let accountLoaded = mode === 'local';
  let unsubs = [];
  let familyUnsubs = [];
  let familySettings = null;
  let members = [];
  let requests = [];
  let myRequest = null;
  let myMember = null;
  let membershipKnown = false;
  const progressWatches = new Map();
  const outbox = new Map();
  let sendTimer = null;
  let summaryTimer = null;

  const role = () => (mode === 'local' ? 'local' : account?.role || null);
  const familyCode = () => account?.familyCode || null;

  // ------------------------------------------------------------- startup
  async function start() {
    if (mode !== 'cloud') return;
    await cloud.onAuth(async (user) => {
      stopAll();
      account = null;
      accountLoaded = false;
      authKnown = true;
      if (!user) {
        store.switchKey(SIGNED_OUT_KEY);
        accountLoaded = true;
        update();
        return;
      }
      update();
      unsubs.push(await cloud.watchUser(user.uid, (u) => {
        if (!u) return; // being created right now
        const familyChanged = account?.familyCode !== u.familyCode || !account;
        account = { ...u, email: user.email };
        if (!accountLoaded) {
          accountLoaded = true;
          openLocalCopy();
        }
        if (familyChanged) watchFamily();
        if (u.role === 'kid') applyKidAccount(u);
        update();
      }));
    });
  }

  function stopAll() {
    unsubs.forEach((u) => u());
    unsubs = [];
    stopFamily();
    progressWatches.forEach((p) => p.then((fn) => fn && fn()));
    progressWatches.clear();
  }

  function stopFamily() {
    familyUnsubs.forEach((u) => u());
    familyUnsubs = [];
    familySettings = null;
    members = [];
    requests = [];
    myRequest = null;
    myMember = null;
    membershipKnown = false;
  }

  // Each account keeps its own saved copy on the device.
  function openLocalCopy() {
    if (account.role === 'kid') {
      store.switchKey(`englishApp.kid.${account.uid}`);
      if (!store.state.profiles[account.uid]) {
        store.update((s) => {
          s.profiles[account.uid] = {
            id: account.uid, name: account.username, avatar: account.avatar, pinHash: null,
            settings: { ...DEFAULT_SETTINGS, ...account.settings }, progress: {}, lastLocation: null,
            createdAt: account.createdAt, updatedAt: account.updatedAt,
          };
        });
      }
      store.selectProfile(account.uid);
      watchProgress(account.uid);
    } else {
      store.switchKey(`englishApp.parent.${account.uid}`);
      store.selectProfile(null);
    }
  }

  function applyKidAccount(u) {
    const p = store.state.profiles[u.uid];
    if (!p) return;
    store.applyRemoteProfile({
      id: u.uid, name: u.username, avatar: u.avatar, pinHash: null,
      settings: u.settings, updatedAt: u.updatedAt, summary: p.summary,
    });
  }

  async function watchFamily() {
    stopFamily();
    const code = familyCode();
    if (!code) { membershipKnown = true; update(); return; }
    const uid = account.uid;
    if (account.role === 'parent') {
      familyUnsubs.push(await cloud.watchFamilySettings(code, (s) => { familySettings = s; update(); }));
      familyUnsubs.push(await cloud.watchRequests(code, (list) => { requests = list; update(); }));
      familyUnsubs.push(await cloud.watchMembers(code, (list) => {
        members = list;
        syncMemberProfiles();
        membershipKnown = true;
        update();
      }));
    } else {
      familyUnsubs.push(await cloud.watchMyRequest(code, uid, (r) => { myRequest = r; update(); }));
      familyUnsubs.push(await cloud.watchMember(code, uid, (m) => {
        const joinedNow = !myMember && m;
        myMember = m;
        membershipKnown = true;
        if (m) watchAsMember(code);
        if (joinedNow) sendSummary();
        update();
      }));
    }
  }

  // Once accepted, a child can read the family's members (scoreboard) and the
  // grown-up password; before that the rules don't allow it.
  let memberWatch = null;
  async function watchAsMember(code) {
    if (memberWatch === code) return;
    memberWatch = code;
    familyUnsubs.push(() => { memberWatch = null; });
    familyUnsubs.push(await cloud.watchFamilySettings(code, (s) => { familySettings = s; update(); }));
    familyUnsubs.push(await cloud.watchMembers(code, (list) => { members = list; update(); }));
  }

  // The parent's copy holds one profile per member, for the dashboard.
  function syncMemberProfiles() {
    const ids = new Set(members.map((m) => m.uid));
    for (const id of Object.keys(store.state.profiles)) {
      if (!ids.has(id)) store.removeRemoteProfile(id);
    }
    for (const m of members) {
      store.applyRemoteProfile({ id: m.uid, name: m.username, avatar: m.avatar, summary: m.summary, updatedAt: m.joinedAt });
    }
  }

  function watchProgress(uid) {
    if (mode !== 'cloud' || progressWatches.has(uid)) return;
    progressWatches.set(uid, cloud.watchProgress(uid, (changes) => {
      let changed = false;
      for (const { activityId, record } of changes) {
        if (store.applyRemoteActivity(uid, activityId, record)) changed = true;
      }
      if (changed) update();
    }).catch(warn));
  }

  // ------------------------------------------------- changes on this device
  function handleChange(evt) {
    if (mode !== 'cloud' || account?.role !== 'kid' || evt.profileId !== account.uid) return;
    const p = store.state.profiles[account.uid];
    switch (evt.type) {
      case 'activity':
        outbox.set(evt.activityId, { activityId: evt.activityId, record: evt.record });
        clearTimeout(sendTimer);
        sendTimer = setTimeout(sendOutbox, SEND_DELAY_MS);
        clearTimeout(summaryTimer);
        summaryTimer = setTimeout(sendSummary, SUMMARY_DELAY_MS);
        break;
      case 'profile':
        if (p) cloud.saveUser(account.uid, { avatar: p.avatar, settings: p.settings, updatedAt: p.updatedAt }).catch(warn);
        sendSummary();
        break;
      case 'reset':
        cloud.deleteProgress(account.uid, evt.activityIds).catch(warn);
        sendSummary();
        break;
      default:
        break;
    }
  }

  function sendOutbox() {
    if (!account) return;
    const entries = [...outbox.values()];
    outbox.clear();
    if (entries.length) cloud.saveProgress(account.uid, entries).catch(warn);
  }

  function sendSummary() {
    clearTimeout(summaryTimer);
    if (!account || account.role !== 'kid' || !myMember || !familyCode()) return;
    const p = store.state.profiles[account.uid];
    if (!p) return;
    cloud.saveMemberSummary(familyCode(), account.uid, { summary: computeSummary(p.progress), username: account.username, avatar: p.avatar }).catch(warn);
  }

  // Sends everything still waiting (e.g. when the app is closed).
  function flush() {
    if (mode !== 'cloud') return;
    clearTimeout(sendTimer);
    sendOutbox();
    if (summaryTimer) sendSummary();
  }

  // --------------------------------------------------------- child accounts
  function recentKids() {
    try { return JSON.parse(storage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  }

  function rememberKid(username, avatar) {
    const list = recentKids().filter((k) => k.username !== username);
    list.unshift({ username, avatar });
    try { storage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8))); } catch { /* optional */ }
  }

  function forgetKid(username) {
    try { storage.setItem(RECENT_KEY, JSON.stringify(recentKids().filter((k) => k.username !== username))); } catch { /* optional */ }
  }

  async function signUpKid({ username, pin, avatar, code }) {
    const name = cloud.normalizeUsername(username);
    const wanted = code ? cloud.normalizeCode(code) : null;
    const uid = await cloud.signUpKid(name, pin);
    const now = new Date().toISOString();
    await cloud.saveUser(uid, { role: 'kid', username: name, avatar, familyCode: null, settings: { ...DEFAULT_SETTINGS }, createdAt: now, updatedAt: now });
    rememberKid(name, avatar);
    if (wanted) {
      try {
        await joinFamily(wanted, { uid, username: name, avatar });
      } catch (err) {
        return { joinError: err.message };
      }
    }
    return {};
  }

  async function signInKid(username, pin) {
    const name = cloud.normalizeUsername(username);
    await cloud.signInKid(name, pin);
    const known = recentKids().find((k) => k.username === name);
    rememberKid(name, known?.avatar || null);
  }

  // Asks to join a family; the parent then accepts or rejects.
  async function joinFamily(code, kid = account) {
    const wanted = cloud.normalizeCode(code);
    if (!(await cloud.familyExists(wanted))) throw new Error('There is no family with that ID. Please check it with your parent.');
    // Asking to join a new family leaves the old one (or withdraws that request).
    if (account?.familyCode && account.familyCode !== wanted) {
      await cloud.removeMember(account.familyCode, kid.uid).catch(() => {});
      await cloud.cancelRequest(account.familyCode, kid.uid).catch(() => {});
    }
    await cloud.saveUser(kid.uid, { familyCode: wanted });
    await cloud.requestToJoin(wanted, kid);
  }

  async function cancelJoin() {
    if (!familyCode()) return;
    await cloud.cancelRequest(familyCode(), account.uid).catch(() => {});
    await cloud.saveUser(account.uid, { familyCode: null });
  }

  async function leaveFamily() {
    if (!familyCode()) return;
    await cloud.removeMember(familyCode(), account.uid).catch(() => {});
    await cloud.saveUser(account.uid, { familyCode: null });
  }

  // 'none' | 'pending' | 'rejected' | 'member' | 'removed'
  function membership() {
    if (!familyCode()) return 'none';
    if (myMember) return 'member';
    if (myRequest?.status === 'pending') return 'pending';
    if (myRequest?.status === 'rejected') return 'rejected';
    return membershipKnown ? 'removed' : 'pending';
  }

  // -------------------------------------------------------- parent accounts
  async function signUpParent(email, password) {
    const uid = await cloud.signUpParent(email, password);
    const now = new Date().toISOString();
    await cloud.saveUser(uid, { role: 'parent', email: email.trim(), familyCode: null, createdAt: now, updatedAt: now });
    const code = await cloud.createFamily(uid, await hashParentPassword(DEFAULT_PARENT_PASSWORD));
    await cloud.saveUser(uid, { familyCode: code });
    return code;
  }

  const signInParent = (email, password) => cloud.signInParent(email, password);

  async function acceptRequest(kidUid) {
    const r = requests.find((x) => x.uid === kidUid);
    if (r) await cloud.acceptRequest(familyCode(), kidUid, r);
  }

  const rejectRequest = (kidUid) => cloud.rejectRequest(familyCode(), kidUid);
  const removeMember = (kidUid) => cloud.removeMember(familyCode(), kidUid);

  async function signOut() {
    flush();
    store.selectProfile(null);
    store.flush();
    await cloud.signOut();
  }

  // ------------------------------------------------------ parent password
  function parentHash() {
    return mode === 'cloud' ? familySettings?.parentPasswordHash : store.state.parentPasswordHash;
  }

  const checkParent = (password) => checkParentPassword(password, parentHash());

  async function setParentPassword(password) {
    const hash = await hashParentPassword(password);
    if (mode === 'cloud') await cloud.saveFamilySettings(familyCode(), { parentPasswordHash: hash });
    else store.setParentPasswordHash(hash);
  }

  // ------------------------------------------------ children on this device
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
    return true;
  }

  function logout() {
    flush();
    store.selectProfile(null);
  }

  // ---------------------------------------------------------------- views
  // Children to compare on the scoreboard: { id, name, avatar, summary, me }.
  function scoreboard() {
    if (mode === 'local') {
      return Object.values(store.state.profiles).map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, summary: summaryFor(p), me: p.id === store.state.currentProfileId }));
    }
    const mine = account?.role === 'kid' ? store.state.profiles[account.uid] : null;
    const list = members.map((m) => {
      if (mine && m.uid === mine.id) return { id: m.uid, name: m.username, avatar: mine.avatar, summary: computeSummary(mine.progress), me: true };
      return { id: m.uid, name: m.username, avatar: m.avatar, summary: m.summary || computeSummary({}), me: false };
    });
    if (mine && !list.some((e) => e.me)) list.push({ id: mine.id, name: mine.name, avatar: mine.avatar, summary: computeSummary(mine.progress), me: true });
    return list;
  }

  // Children the parent area shows.
  function children() {
    return Object.values(store.state.profiles).sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    mode,
    start,
    handleChange,
    flush,
    role,
    get account() { return account; },
    get ready() { return authKnown && accountLoaded && (mode === 'local' || !account || Boolean(account.role)); },
    signedIn: () => mode === 'local' || Boolean(account),
    familyCode,
    membership,
    get requests() { return requests.filter((r) => r.status === 'pending'); },
    // child accounts
    recentKids, forgetKid, signUpKid, signInKid, joinFamily, cancelJoin, leaveFamily,
    // parent accounts
    signUpParent, signInParent, acceptRequest, rejectRequest, removeMember, watchProgress,
    signOut, resetPassword: (email) => cloud.resetPassword(email),
    errorMessage: cloud.errorMessage,
    validUsername: cloud.validUsername,
    // parent password
    checkParent, setParentPassword,
    // this-device children
    addChild, setPin, loginChild, logout,
    // views
    scoreboard, children,
  };
}
