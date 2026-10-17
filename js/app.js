import { BOOK } from './content/index.js';
import { createStore, flushOnExit } from './storage.js';
import * as speech from './speech.js';
import { starsForResult } from './scoring.js';
import { h, add, clear, img, stars, rich, toast, confetti } from './ui.js';
import { runActivity, isRunnerType } from './runner.js';
import { SCREENS, renderBlocks } from './screens.js';
import { activityPoints } from './points.js';
import * as P from './progress.js';
import { createFamily } from './family.js';
import { familyPages } from './family-pages.js';

const MODEL_MB = 40;
const AVATARS = ['sam', 'lina', 'ben', 'dina', 'max', 'mrs-green', 'mr-hill', 'ms-rose', 'gran-mona'];

// ------------------------------------------------------------ index content
const UNITS = BOOK.units;
const ACTS = new Map();
for (const unit of UNITS) {
  for (const section of unit.sections) {
    for (const act of section.activities) ACTS.set(act.id, { act, unit, section });
  }
}
const unitActivities = (unit) => unit.sections.flatMap((s) => s.activities);

// ------------------------------------------------------------------- state
const saveEl = h('span', { class: 'save-status', role: 'status', 'aria-live': 'polite' });
let family = null;
const store = createStore({
  onStatus: (s) => {
    if (s.pending) {
      saveEl.textContent = '…';
      saveEl.className = 'save-status pending';
    } else if (s.ok) {
      saveEl.textContent = '✓ Saved';
      saveEl.className = 'save-status ok';
      saveEl.title = `Progress saved at ${s.at.toLocaleTimeString()}`;
    } else {
      saveEl.textContent = '⚠ Not saved';
      saveEl.className = 'save-status bad';
      toast('Progress could not be saved on this device. Check that storage is allowed.', 'bad');
    }
  },
  onChange: (evt) => family?.handleChange(evt),
});
flushOnExit(store);

family = createFamily(store, { onUpdate: () => liveUpdate() });
addEventListener('pagehide', () => family.flush());

let adultMode = false;

// --------------------------------------------------------------- audio fx
let audioCtx;
function sound(kind) {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'right' ? [660, 880] : [300, 220];
    notes.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.12 + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(audioCtx.currentTime + i * 0.12);
      o.stop(audioCtx.currentTime + i * 0.12 + 0.2);
    });
  } catch { /* sound is optional */ }
}

// ------------------------------------------------------------- environment
function speak(text, opts = {}) {
  const settings = store.settings();
  if (opts.quiet && !settings.autoSpeak) return Promise.resolve();
  return speech.speak(text, settings, opts);
}

const env = {
  store,
  speak,
  stop: () => { speech.stopSpeaking(); speech.stopListening(); },
  listen: (opts = {}) => speech.listen({ settings: store.settings(), ...opts }),
  canListen: speech.canListen,
  sound,
  settings: () => store.settings(),
  isAdult: () => adultMode,
  unlockAdult,
  celebrate: confetti,
  back: () => history.back(),
  complete(act, earned, possible, { quiet = false, pending = false } = {}) {
    const wasDone = store.activityProgress(act.id)?.completed;
    store.updateActivity(act.id, (r) => {
      r.completed = true;
      r.earned = earned;
      r.possible = possible;
      r.pending = pending;
      r.stars = possible ? starsForResult(earned, possible) : 0;
      r.bestStars = Math.max(r.bestStars || 0, r.stars);
      r.bestEarned = Math.max(r.bestEarned || 0, earned);
      if (!quiet || !wasDone) r.timesCompleted = (r.timesCompleted || 0) + 1;
      r.completedAt = new Date().toISOString();
    });
    store.flush();
    if (!quiet && (!possible || earned / possible >= 0.6)) confetti();
  },
  resultPanel(act, earned, possible, retry, extra) {
    const s = possible ? starsForResult(earned, possible) : 3;
    const band = s === 3 ? 'Great! Go on.' : s === 2 ? 'Good. Look at the mistakes and fix them.' : 'Practise again with your grown-up.';
    const next = nextActivity(act.id);
    speak(possible ? `You scored ${fmt(earned)} out of ${possible}. ${band}` : 'Well done!', { quiet: true });
    return h('div', { class: 'result' },
      h('div', { class: 'big-stars' }, stars(s)),
      possible ? h('div', { class: 'score' }, `My score: ${fmt(earned)} / ${possible}`) : null,
      h('p', {}, extra || band),
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: retry }, '🔁 Try again'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => go(`#/unit/${ACTS.get(act.id).unit.id}`) }, '📖 Chapter'),
        next ? h('button', { type: 'button', class: 'btn primary', onclick: () => go(`#/act/${next.id}`) }, 'Next ➜') : null));
  },
};

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function nextActivity(id) {
  const { unit } = ACTS.get(id);
  const list = unitActivities(unit);
  return list[list.indexOf(ACTS.get(id).act) + 1] || null;
}

// --------------------------------------------------------- grown-up gate
// Grown-up mode (giving points, the parent area) needs the parent password.
// It stays on until the grown-up turns it off or the app is closed.
function setAdult(on) {
  adultMode = on;
}

function unlockAdult() {
  if (adultMode) return Promise.resolve(true);
  return new Promise((resolve) => {
    const input = h('input', { type: 'password', class: 'write-input', autocomplete: 'current-password', 'aria-label': 'Parent password', placeholder: 'Parent password' });
    const status = h('p', { class: 'form-status', role: 'status' });
    let ok = false;
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, '👪 Grown-ups only'),
      h('p', {}, 'To give points and see the answer notes, please enter the parent password.'),
      h('form', {
        onsubmit: async (e) => {
          e.preventDefault();
          if (await family.checkParent(input.value)) {
            ok = true;
            adultMode = true;
            dialog.close();
            renderHeader();
            toast('Grown-up mode is on.', 'good');
          } else {
            input.value = '';
            status.textContent = 'That password is not right.';
            input.focus();
          }
        },
      }, input, status,
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => dialog.close() }, 'Cancel'),
        h('button', { type: 'submit', class: 'btn primary' }, 'OK'))));
    dialog.addEventListener('close', () => { dialog.remove(); resolve(ok); });
    add(document.body, dialog);
    dialog.showModal();
    input.focus();
  });
}

// ------------------------------------------------------------------ layout
const app = document.getElementById('app');
const header = h('header', { class: 'topbar' });
const main = h('main', { id: 'main', tabindex: '-1' });
add(app, header, main);

const STORY_ACTS = [...ACTS.values()].filter(({ act }) => act.type === 'story' && act.record);
const pages = familyPages({
  store, family, main, go, renderHeader, AVATARS, fmt, STORY_ACTS, speak,
  isAdult: () => adultMode,
  setAdult,
});

function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

function totalStars() {
  const p = store.profile();
  if (!p) return 0;
  return Object.values(p.progress).reduce((s, r) => s + (r.bestStars || 0), 0);
}

function renderHeader(title) {
  clear(header);
  const p = store.profile();
  const atHome = !location.hash || location.hash === '#/' || location.hash === '#';
  const ready = family.ready && family.signedIn();
  add(header,
    atHome ? h('span', { class: 'brand' }, '📗') : h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Back', onclick: () => backFromHere() }, '⬅'),
    h('h1', { class: 'top-title' }, title || BOOK.title),
    p ? saveEl : null,
    p ? h('span', { class: 'star-count', title: 'My stars' }, `⭐ ${totalStars()}`) : null,
    adultMode && family.role() !== 'parent' ? h('button', { type: 'button', class: 'icon-btn adult-on', title: 'Grown-up mode on (tap to turn off)', onclick: () => { adultMode = false; route(); } }, '👪') : null,
    ready ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Scoreboard', title: 'Scoreboard', onclick: () => go('#/scoreboard') }, '🏆') : null,
    p ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'My progress', onclick: () => go('#/progress') }, '📊') : null,
    p ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Settings', onclick: () => go('#/settings') }, '⚙️') : null,
    p ? h('button', {
      type: 'button', class: 'icon-btn me-btn', title: `${p.name}: log out`, 'aria-label': `Log out ${p.name}`,
      onclick: async () => {
        if (!confirm(`Log out, ${p.name}?`)) return;
        adultMode = false;
        if (family.role() === 'kid') await family.signOut();
        else family.logout();
        go('#/');
      },
    }, img(p.avatar || 'sam', { cls: 'avatar-mini' }), '🚪') : null,
    !p && ready && family.role() === 'local' && !adultMode ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Parent area', title: 'Parent area', onclick: () => go('#/parent') }, '👪') : null,
    family.role() === 'parent' ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Log out', title: 'Log out', onclick: async () => { adultMode = false; await family.signOut(); go('#/'); } }, '🚪') : null,
  );
}

function backFromHere() {
  env.stop();
  const [, page, id] = location.hash.split('/');
  if (page === 'act' && ACTS.get(id)) go(`#/unit/${ACTS.get(id).unit.id}`);
  else if (page === 'parent' && id) go('#/parent');
  else go('#/');
}

// ------------------------------------------------------------------ router
function route() {
  env.stop();
  speech.releaseMicrophone();
  const [, page, id, sub] = (location.hash || '#/').split('/');
  clear(main);
  shownPage = page || 'home';
  if (!family.ready) { shownPage = 'loading'; return pages.loadingPage(); }
  if (family.accountProblem) { shownPage = 'accountfix'; return pages.accountProblemPage(); }
  if (!family.signedIn()) { shownPage = 'signin'; return pages.welcomePage(); }
  if (page === 'scoreboard') return pages.scoreboardPage();
  // A parent account only has the parent area.
  if (family.role() === 'parent') {
    adultMode = true;
    if (page === 'parent' && id === 'child') { shownPage = 'childprogress'; return pages.childProgressPage(sub); }
    shownPage = 'parentdash';
    return pages.parentPage();
  }
  if (family.role() === 'local') {
    if (page === 'parent' && id === 'child') { shownPage = 'childprogress'; return pages.childProgressPage(sub); }
    if (page === 'parent') return pages.parentPage();
    if (!store.profile()) { shownPage = 'picker'; return pages.pickerPage(); }
  }
  if (!store.profile()) { shownPage = 'loading'; return pages.loadingPage(); }
  switch (page) {
    case 'unit': return unitPage(id);
    case 'act': return activityPage(id);
    case 'progress': return progressPage();
    case 'settings': return settingsPage();
    case 'certificate': return certificatePage();
    default: return homePage();
  }
}
addEventListener('hashchange', route);

// Something changed (signed in, or progress arrived from another device):
// redraw pages that only show information. Pages where the child is working,
// or where a grown-up is typing, are left alone.
let shownPage = null;
let liveTimer = null;
const LIVE_PAGES = new Set(['loading', 'signin', 'picker', 'home', 'scoreboard', 'progress', 'childprogress', 'parentdash', 'settings']);
function liveUpdate() {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    const WAITING = ['loading', 'signin', 'accountfix'];
    const was = WAITING.includes(shownPage) ? shownPage : null;
    const now = !family.ready ? 'loading' : family.accountProblem ? 'accountfix' : !family.signedIn() ? 'signin'
      : (family.role() === 'kid' && !store.profile()) ? 'loading' : null;
    if (was !== now) return route();
    if (shownPage === 'signin') return;
    if (!LIVE_PAGES.has(shownPage) || document.querySelector('dialog[open]')) return;
    if (main.contains(document.activeElement) && document.activeElement.matches('input, textarea, select')) return;
    route();
  }, 250);
}

// ------------------------------------------------------------------- pages
const myProgress = () => store.profile()?.progress || {};
const unitProgress = (unit) => P.unitProgress(unit, myProgress());
const reviewScore = (unit, filter) => P.reviewScore(unit, myProgress(), filter);
const { bandFor } = P;

function homePage() {
  renderHeader();
  const p = store.profile();
  const last = p.lastLocation && ACTS.get(p.lastLocation);
  add(main, 
    h('section', { class: 'hero' },
      img('cover', { cls: 'cover', alt: 'Greenhill town' }),
      h('div', { class: 'hero-text' },
        h('h2', {}, `Hello, ${p.name}! `, img(p.avatar, { cls: 'avatar' })),
        h('p', {}, BOOK.subtitle),
        last ? h('button', { type: 'button', class: 'btn primary big', onclick: () => go(`#/act/${last.act.id}`) },
          `▶ Continue: ${last.unit.label} – ${last.act.title}`) : h('button', { type: 'button', class: 'btn primary big', onclick: () => go(`#/unit/${UNITS[0].id}`) }, '▶ Start here'),
        speech.canListen ? null : h('p', { class: 'warn' }, '🎤 This browser cannot listen to speech. For the speaking tasks, use Chrome, Edge or Safari.'))),
  );
  const grid = h('div', { class: 'unit-grid' });
  for (const unit of UNITS) {
    const { done, total } = unitProgress(unit);
    const score = reviewScore(unit);
    const complete = score && score.finished === score.count;
    add(grid, h('button', {
      type: 'button', class: `unit-tile ${unit.kind}`, style: { '--unit-color': unit.color },
      onclick: () => go(`#/unit/${unit.id}`),
    },
    img(unit.icon, { cls: 'unit-icon' }),
    h('span', { class: 'unit-label' }, unit.label),
    h('span', { class: 'unit-title' }, unit.title),
    unit.week ? h('span', { class: 'unit-week' }, `Week ${unit.week}`) : null,
    h('span', { class: 'bar' }, h('span', { style: { width: `${(done / total) * 100}%` } })),
    complete ? stars(bandFor(unit, score).stars) : h('span', { class: 'muted small' }, `${done} / ${total} done`)));
  }
  add(main, h('h2', { class: 'section-title' }, 'My book'), grid);
  const final = UNITS.find((u) => u.id === 'final');
  if (final && unitProgress(final).done === unitProgress(final).total) {
    add(main, h('div', { class: 'controls' }, h('button', { type: 'button', class: 'btn good big', onclick: () => go('#/certificate') }, '🏆 My certificate')));
  }
}

function unitPage(id) {
  const unit = UNITS.find((u) => u.id === id);
  if (!unit) return go('#/');
  renderHeader(`${unit.label}: ${unit.title}`);
  const head = h('section', { class: 'unit-head', style: { '--unit-color': unit.color } },
    h('div', { class: 'unit-head-top' }, img(unit.icon, { cls: 'unit-icon' }),
      h('div', {}, h('div', { class: 'unit-label' }, unit.label + (unit.week ? ` · Week ${unit.week}` : '')), h('h2', {}, unit.title))),
    unit.intro ? h('p', { class: 'say-line', onclick: () => speak(unit.intro) }, rich(unit.intro)) : null);
  if (unit.goals) {
    add(head, h('div', { class: 'goals' }, h('h3', {}, '🎯 My goals'),
      h('ul', {}, unit.goals.map((g) => h('li', { onclick: () => speak(g) }, '✓ ', rich(g))))));
  }
  if (unit.endGoal) add(head, h('p', { class: 'end-goal' }, '🏁 ', rich(unit.endGoal)));
  if (unit.adult) add(head, h('details', { class: 'adult-note' }, h('summary', {}, 'For the adult'), h('p', {}, rich(unit.adult))));
  add(main, head);

  for (const section of unit.sections) {
    const sec = h('section', { class: 'unit-section' }, h('h3', { class: 'section-title' }, section.icon ? img(section.icon, { cls: 'sec-icon' }) : null, section.title));
    if (section.blocks) add(sec, renderBlocks(section.blocks, env));
    const list = h('div', { class: 'act-list' });
    for (const act of section.activities) {
      const rec = store.activityProgress(act.id);
      const possible = activityPoints(act);
      add(list, h('button', {
        type: 'button', class: `act-row ${rec?.completed ? 'done' : ''}`, onclick: () => go(`#/act/${act.id}`),
      },
      h('span', { class: 'act-num' }, act.n ? String(act.n) : typeIcon(act.type)),
      h('span', { class: 'act-title' }, act.title, act.review && possible ? h('span', { class: 'pts' }, ` (${possible} points)`) : null),
      h('span', { class: 'act-status' },
        rec?.completed ? (rec.possible ? [stars(rec.stars), h('span', { class: 'small' }, ` ${fmt(rec.earned)}/${rec.possible}`)] : '✅') : '',
        rec?.pending ? h('span', { class: 'small muted' }, ' (grown-up to score)') : null)));
    }
    add(sec, list);
    const partScore = section.activities.some((a) => a.review) ? reviewScore(unit, (a) => a.review && section.activities.includes(a)) : null;
    if (partScore && unit.kind === 'final') add(sec, h('p', { class: 'part-score' }, `Part score: ${fmt(partScore.earned)} / ${partScore.possible}`));
    add(main, sec);
  }

  const score = reviewScore(unit);
  if (score) {
    const band = bandFor(unit, score);
    const box = h('section', { class: 'review-box' },
      h('h3', {}, `📝 ${unit.review?.title || 'Review'} score`),
      h('div', { class: 'score' }, `My score: ${fmt(score.earned)} / ${score.possible}`),
      score.finished === score.count ? [stars(band.stars), h('p', {}, band.text)] : h('p', { class: 'muted' }, `Finish all the review exercises to see your stars (${score.finished} / ${score.count} done).`));
    if (unit.review?.bands) {
      add(box, h('p', { class: 'small muted' }, unit.review.bands.map(([min, text], i) => `${'★'.repeat(3 - i)} ${min}+: ${text}`).join('  ·  ')));
    }
    if (unit.review?.next) add(box, h('div', { class: 'note' }, h('div', {}, rich(unit.review.next))));
    add(main, box);
  }
  main.focus({ preventScroll: true });
  scrollTo(0, 0);
}

// Shows the one-time download of the offline listening helper.
function offlineBanner() {
  const bar = h('span', { class: 'bar' }, h('span'));
  const text = h('span');
  const el = h('div', { class: 'note offline-banner hidden', role: 'status' }, h('span', { class: 'note-icon' }, '🎧'), h('div', {}, text, bar));
  const draw = (st) => {
    if (!el.isConnected && el.dataset.drawn) { stopWatching(); return; }
    el.dataset.drawn = '1';
    const pct = Math.min(100, Math.round((st.loaded / st.total) * 100));
    el.classList.toggle('hidden', st.state === 'ready' || st.state === 'idle');
    bar.classList.toggle('hidden', st.cached || st.state !== 'loading');
    bar.firstChild.style.width = `${pct}%`;
    if (st.state === 'loading') {
      text.textContent = st.cached
        ? 'Getting listening ready…'
        : `Getting offline listening ready (first time only, about ${MODEL_MB} MB)… ${pct}%`;
    } else if (st.state === 'failed') {
      text.textContent = speech.canListenOnline
        ? 'Offline listening could not start on this device, so the browser\u2019s listening is used instead.'
        : 'Offline listening could not start on this device. A grown-up can mark the speaking instead.';
    }
  };
  const stopWatching = speech.onOfflineStatus(draw);
  draw(speech.offlineStatus());
  return el;
}

function typeIcon(type) {
  return { words: '🔤', info: '💡', speak: '🎤', story: '📖', dialogue: '🎭', open: '✏️', adult: '👪', ask: '💬', check: '✅' }[type] || '•';
}

function activityPage(id) {
  const entry = ACTS.get(id);
  if (!entry) return go('#/');
  const { act, unit, section } = entry;
  renderHeader(`${unit.label} · ${section.title}`);
  store.update((s) => { s.profiles[s.currentProfileId].lastLocation = id; });
  const wrap = h('section', { class: 'activity' });
  const instruction = act.instruction || act.title;
  add(wrap, h('div', { class: 'act-head' },
    act.n ? h('span', { class: 'act-num big' }, String(act.n)) : h('span', { class: 'act-num big' }, typeIcon(act.type)),
    h('h2', { class: 'say-line', onclick: () => speak(instruction) }, rich(act.title)),
    h('button', { type: 'button', class: 'speak-btn', 'aria-label': 'Read the instructions', onclick: () => speak(instruction) }, '🔊')));
  if (act.review && activityPoints(act)) add(wrap, h('p', { class: 'muted small' }, `Review: ${activityPoints(act)} points. Only your first try counts!`));
  if (act.adultNote) add(wrap, h('details', { class: 'adult-note' }, h('summary', {}, 'For the adult'), h('p', {}, rich(act.adultNote))));
  if (act.context) add(wrap, renderBlocks(act.context, env));
  const body = h('div', { class: 'act-body' });
  add(wrap, body);
  add(main, wrap);
  const usesOffline = ['words', 'speak', 'story', 'dialogue'].includes(act.type) || (act.type === 'ask' && !speech.canListenOnline);
  if (usesOffline) {
    speech.prepareMicrophone(store.settings());
    if (speech.engine(store.settings()) === 'offline') wrap.insertBefore(offlineBanner(), body);
  }
  if (isRunnerType(act.type)) runActivity(body, act, env);
  else SCREENS[act.type](body, act, env);
  if (store.settings().autoSpeak && !['story', 'speak'].includes(act.type)) setTimeout(() => speak(instruction), 300);
  scrollTo(0, 0);
}

function progressPage() {
  renderHeader('My Progress');
  const p = store.profile();
  add(main, h('h2', { class: 'section-title' }, `📊 ${p.name}'s Progress Tracker`), pages.tracker(p, { link: true }));
}

function settingsPage() {
  renderHeader('Settings');
  const s = store.settings();

  const voiceSelect = h('select', { class: 'select', 'aria-label': 'Voice' }, h('option', { value: '' }, 'Best available voice'));
  const fillVoices = () => {
    const current = store.settings().voiceName;
    while (voiceSelect.options.length > 1) voiceSelect.remove(1);
    speech.englishVoices().forEach((v) => add(voiceSelect, h('option', { value: v.name, selected: v.name === current }, `${v.name} (${v.lang})`)));
  };
  fillVoices();
  if (speech.canSpeak) speechSynthesis.addEventListener?.('voiceschanged', fillVoices, { once: true });
  voiceSelect.addEventListener('change', () => store.updateSettings({ voiceName: voiceSelect.value }));

  const rate = h('input', { type: 'range', min: '0.5', max: '1.2', step: '0.05', value: s.rate, 'aria-label': 'Speed' });
  rate.addEventListener('change', () => { store.updateSettings({ rate: Number(rate.value) }); speak('This is my speaking speed.'); });

  const accent = h('select', { class: 'select', 'aria-label': 'Accent' },
    h('option', { value: 'en-US', selected: s.accent === 'en-US' }, 'American English'),
    h('option', { value: 'en-GB', selected: s.accent === 'en-GB' }, 'British English'));
  accent.addEventListener('change', () => store.updateSettings({ accent: accent.value, voiceName: '' }));

  const auto = h('input', { type: 'checkbox', checked: s.autoSpeak });
  auto.addEventListener('change', () => store.updateSettings({ autoSpeak: auto.checked }));

  const micStatus = h('span', { class: 'muted' });
  const engineName = speech.engine(s);
  const engineOffline = h('input', { type: 'radio', name: 'engine', checked: engineName === 'offline' });
  const engineBrowser = h('input', { type: 'radio', name: 'engine', checked: engineName === 'browser' });
  engineOffline.addEventListener('change', () => { store.updateSettings({ listenEngine: 'offline' }); settingsPage(); });
  engineBrowser.addEventListener('change', () => { store.updateSettings({ listenEngine: 'browser' }); settingsPage(); });
  const offlineState = h('p', { class: 'muted' });
  const drawOffline = (st) => {
    clear(offlineState);
    if (st.state === 'ready') add(offlineState, '✓ Offline listening is ready on this device.');
    else if (st.state === 'loading') add(offlineState, `Downloading… ${Math.round((st.loaded / st.total) * 100)}%`);
    else if (st.state === 'failed') add(offlineState, 'Offline listening could not start on this device.');
    else if (engineName === 'offline') {
      add(offlineState, st.cached ? 'Downloaded. It starts when a speaking exercise opens. ' : 'Not downloaded yet. ',
        h('button', { type: 'button', class: 'btn small ghost', onclick: () => speech.prepareMicrophone(store.settings()) }, st.cached ? 'Start now' : 'Download now'));
    }
  };
  const stopWatching = speech.onOfflineStatus((st) => {
    if (!offlineState.isConnected) return stopWatching();
    return drawOffline(st);
  });
  drawOffline(speech.offlineStatus());
  if (family.role() === 'kid') {
    shownPage = 'settings';
    add(main, pages.kidPictureCard(), pages.kidFamilyCard());
  }
  add(main, h('section', { class: 'card settings' },
    h('h2', {}, '🔊 Voice'),
    h('label', {}, 'Voice ', voiceSelect),
    h('label', {}, 'Accent ', accent),
    h('label', {}, 'Speed ', rate),
    h('label', { class: 'check' }, auto, ' Read instructions and praise aloud automatically'),
    h('button', { type: 'button', class: 'btn ghost', onclick: () => speak('Hello! I am Sam. Welcome to Greenhill!') }, '▶ Test voice'),

    h('h2', {}, '🎤 Listening'),
    speech.canListenOffline ? h('label', { class: 'check' }, engineOffline, ' On this device (recommended). Works offline and is made to listen for the book\u2019s words. Downloads about ' + MODEL_MB + ' MB the first time.') : null,
    speech.canListenOnline ? h('label', { class: 'check' }, engineBrowser, ' The browser\u2019s listening (needs internet).') : null,
    speech.canListenOffline ? offlineState : null,
    speech.canListen ? null : h('p', { class: 'muted' }, 'This browser cannot listen. A grown-up can mark the speaking tasks instead.'),
    speech.canListen ? h('button', {
      type: 'button', class: 'btn ghost',
      onclick: async () => {
        micStatus.textContent = 'Wait…';
        try {
          const { alternatives } = await env.listen({ onReady: () => { micStatus.textContent = 'Say "hello" now!'; } });
          micStatus.textContent = `✓ I heard: "${alternatives[0]}"`;
        } catch (err) {
          micStatus.textContent = err.message;
        }
      },
    }, '🎤 Test microphone') : null, micStatus,

    h('h2', {}, '💾 Saving'),
    h('p', { class: 'muted' }, family.mode === 'cloud'
      ? 'Progress and scores are saved after every answer, on this device and in your account, so you can carry on from any device.'
      : 'Progress and scores are saved on this device after every answer.'),

    family.role() === 'local' ? [
      h('h2', {}, '👪 Grown-ups'),
      h('p', { class: 'muted' }, 'Children, PINs, progress, backups and the parent password are in the parent area.'),
      h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/parent') }, '👪 Parent area'),
    ] : null,

    h('h2', {}, 'ℹ️ About'),
    h('p', { class: 'small muted' }, BOOK.credits)));
}

function certificatePage() {
  renderHeader('Certificate');
  const p = store.profile();
  const final = UNITS.find((u) => u.id === 'final');
  const score = final ? reviewScore(final) : null;
  add(main, h('section', { class: 'certificate' },
    img('trophy', { cls: 'trophy' }),
    h('h2', {}, 'Certificate'),
    h('p', { class: 'cert-sub' }, 'of English Adventures'),
    h('p', {}, 'This certificate is for'),
    h('p', { class: 'cert-name' }, p.name),
    h('p', {}, 'for finishing the 12-week course'),
    h('p', { class: 'cert-book' }, BOOK.title),
    h('p', {}, 'You can read stories, write letters and talk in English.'),
    h('p', { class: 'cert-stars' }, 'Well done! ★ ★ ★'),
    score ? h('p', { class: 'muted' }, `Final Assessment: ${fmt(score.earned)} / ${score.possible}`) : null,
    h('p', {}, `Date: ${new Date().toLocaleDateString()}`),
    img('town-scene', { cls: 'cert-town' })),
  h('div', { class: 'controls' }, h('button', { type: 'button', class: 'btn primary', onclick: () => print() }, '🖨 Print')));
  confetti();
}

// --------------------------------------------------------------------- boot
route();
family.start().catch((err) => toast(family.errorMessage(err), 'bad'));
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
