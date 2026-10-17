import { BOOK } from './content/index.js';
import { createStore, flushOnExit } from './storage.js';
import * as speech from './speech.js';
import { starsForResult } from './scoring.js';
import { h, add, clear, img, stars, rich, toast, confetti, formatTime } from './ui.js';
import { runActivity, isRunnerType } from './runner.js';
import { SCREENS, renderBlocks } from './screens.js';
import { activityPoints } from './points.js';

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
});
flushOnExit(store);

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
  listen: (opts = {}) => speech.listen({ lang: store.settings().accent, ...opts }),
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
function unlockAdult() {
  if (adultMode) return Promise.resolve(true);
  return new Promise((resolve) => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 5 + Math.floor(Math.random() * 7);
    const input = h('input', { type: 'number', inputmode: 'numeric', class: 'write-input', 'aria-label': 'Answer' });
    const dialog = h('dialog', { class: 'modal' },
      h('h2', {}, '👪 Grown-ups only'),
      h('p', {}, `To give points and see answers, please answer: what is ${a} × ${b}?`),
      input,
      h('div', { class: 'controls' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { dialog.close(); resolve(false); } }, 'Cancel'),
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: () => {
            if (Number(input.value) === a * b) {
              adultMode = true;
              dialog.close();
              renderHeader();
              toast('Grown-up mode is on for this visit.', 'good');
              resolve(true);
            } else {
              input.value = '';
              toast('Not quite. Try again.', 'bad');
            }
          },
        }, 'OK')));
    dialog.addEventListener('close', () => dialog.remove());
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
  add(header, 
    atHome ? h('span', { class: 'brand' }, '📗') : h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Back', onclick: () => backFromHere() }, '⬅'),
    h('h1', { class: 'top-title' }, title || BOOK.title),
    saveEl,
    p ? h('span', { class: 'star-count', title: 'My stars' }, `⭐ ${totalStars()}`) : null,
    adultMode ? h('button', { type: 'button', class: 'icon-btn adult-on', title: 'Grown-up mode on (tap to turn off)', onclick: () => { adultMode = false; route(); } }, '👪') : null,
    p ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'My progress', onclick: () => go('#/progress') }, '📊') : null,
    p ? h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Settings', onclick: () => go('#/settings') }, '⚙️') : null,
  );
}

function backFromHere() {
  env.stop();
  const [, page, id] = location.hash.split('/');
  if (page === 'act' && ACTS.get(id)) go(`#/unit/${ACTS.get(id).unit.id}`);
  else go('#/');
}

// ------------------------------------------------------------------ router
function route() {
  env.stop();
  const [, page, id] = (location.hash || '#/').split('/');
  clear(main);
  if (!store.profile() && page !== 'profiles') return profilesPage();
  switch (page) {
    case 'unit': return unitPage(id);
    case 'act': return activityPage(id);
    case 'progress': return progressPage();
    case 'settings': return settingsPage();
    case 'profiles': return profilesPage();
    case 'certificate': return certificatePage();
    default: return homePage();
  }
}
addEventListener('hashchange', route);

// ------------------------------------------------------------------- pages
function unitProgress(unit) {
  const acts = unitActivities(unit);
  const done = acts.filter((a) => store.activityProgress(a.id)?.completed).length;
  return { done, total: acts.length };
}

function reviewScore(unit, filter = (a) => a.review) {
  const acts = unitActivities(unit).filter(filter);
  if (!acts.length) return null;
  let earned = 0;
  let possible = 0;
  let finished = 0;
  for (const a of acts) {
    const rec = store.activityProgress(a.id);
    possible += activityPoints(a);
    if (rec?.completed) {
      earned += rec.earned || 0;
      finished++;
    }
  }
  return { earned, possible, finished, count: acts.length };
}

function bandFor(unit, score) {
  const bands = unit.review?.bands;
  if (!bands) return { stars: starsForResult(score.earned, score.possible), text: '' };
  const i = bands.findIndex(([min]) => score.earned >= min);
  return { stars: Math.max(1, 3 - i), text: bands[i][1] };
}

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
  if (['words', 'speak', 'story', 'dialogue', 'ask'].includes(act.type)) speech.prepareMicrophone();
  if (isRunnerType(act.type)) runActivity(body, act, env);
  else SCREENS[act.type](body, act, env);
  if (store.settings().autoSpeak && !['story', 'speak'].includes(act.type)) setTimeout(() => speak(instruction), 300);
  scrollTo(0, 0);
}

function progressPage() {
  renderHeader('My Progress');
  const p = store.profile();
  add(main, h('h2', { class: 'section-title' }, `📊 ${p.name}'s Progress Tracker`));
  const table = h('table', { class: 'tracker' }, h('thead', {}, h('tr', {}, ['Week', 'My work', 'Done', 'Score', 'Stars'].map((t) => h('th', {}, t)))));
  const body = h('tbody');
  for (const unit of UNITS) {
    const { done, total } = unitProgress(unit);
    const score = reviewScore(unit);
    const finished = score && score.finished === score.count;
    add(body, h('tr', { onclick: () => go(`#/unit/${unit.id}`) },
      h('td', {}, unit.week ? String(unit.week) : ''),
      h('td', {}, `${unit.label}${unit.kind === 'chapter' ? `: ${unit.title}` : ''}`),
      h('td', {}, `${done} / ${total}`),
      h('td', {}, score ? `${fmt(score.earned)} / ${score.possible}` : '—'),
      h('td', {}, finished ? stars(bandFor(unit, score).stars) : '')));
  }
  add(table, body);
  add(main, h('div', { class: 'table-wrap' }, table));

  // Reading records
  const stories = [...ACTS.values()].filter(({ act }) => act.type === 'story' && act.record);
  const rt = h('table', { class: 'tracker' }, h('thead', {}, h('tr', {}, ['Story', 'Words', 'My time', 'Mistakes', 'Times read'].map((t) => h('th', {}, t)))));
  const rb = h('tbody');
  for (const { act } of stories) {
    const records = store.activityProgress(act.id)?.data?.keep?.records || [];
    const lastRec = records[records.length - 1];
    add(rb, h('tr', { onclick: () => go(`#/act/${act.id}`) },
      h('td', {}, act.storyTitle),
      h('td', {}, String(act.words || '')),
      h('td', {}, lastRec ? formatTime(lastRec.seconds) : ''),
      h('td', {}, lastRec ? String(lastRec.mistakes) : ''),
      h('td', {}, String(records.length || ''))));
  }
  add(rt, rb);
  add(main, h('h2', { class: 'section-title' }, '📒 My reading records'),
    h('p', { class: 'muted' }, 'The stories get longer, but you get faster!'),
    h('div', { class: 'table-wrap' }, rt));

  // Not yet items from Progress Checks
  const notYet = [];
  for (const { act, unit } of ACTS.values()) {
    if (act.type !== 'check') continue;
    const marks = store.activityProgress(act.id)?.data?.marks || {};
    act.items.forEach((t, i) => { if (marks[i] && marks[i] !== 'yes') notYet.push({ unit, text: t, mark: marks[i] }); });
  }
  if (notYet.length) {
    add(main, h('h2', { class: 'section-title' }, '🤔 Things to practise more'),
      h('ul', { class: 'say-list' }, notYet.map((n) => h('li', {}, `${n.unit.label}: I can ${n.text} — `, h('em', {}, n.mark === 'almost' ? 'Almost' : 'Not yet')))));
  }
  const lb = UNITS.find((u) => u.id === 'begin');
  if (lb?.placement) add(main, placementBox(lb));
}

function placementBox(unit) {
  const part = (key) => {
    const acts = unitActivities(unit).filter((a) => a.part === key);
    const rec = acts.map((a) => store.activityProgress(a.id));
    if (!rec.every((r) => r?.completed)) return null;
    return rec.reduce((s, r) => s + (r.earned || 0), 0);
  };
  const scores = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F'].map((k) => [k, part(k)]));
  const box = h('section', { class: 'review-box' }, h('h3', {}, "🧭 Let's Begin: where to start"));
  add(box, h('p', {}, ['A', 'B', 'C', 'D', 'E', 'F'].map((k) => `Part ${k}: ${scores[k] ?? '–'}`).join(' · ')));
  const advice = unit.placement(scores);
  add(box, h('p', {}, advice || 'Finish the Let’s Begin parts to get advice.'));
  return box;
}

function settingsPage() {
  renderHeader('Settings');
  const p = store.profile();
  const s = store.settings();

  const nameInput = h('input', { type: 'text', class: 'write-input', value: p.name, 'aria-label': 'Name' });
  nameInput.addEventListener('change', () => store.update((st) => { st.profiles[p.id].name = nameInput.value.trim() || p.name; }));

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
  const fileInput = h('input', { type: 'file', accept: 'application/json', class: 'hidden' });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      store.importData(await file.text());
      toast('Progress restored!', 'good');
      go('#/');
    } catch (err) {
      toast(err.message, 'bad');
    }
  });

  add(main, h('section', { class: 'card settings' },
    h('h2', {}, '🙂 Me'),
    h('label', {}, 'My name ', nameInput),
    h('div', { class: 'avatar-row' }, AVATARS.map((a) => h('button', {
      type: 'button', class: `avatar-pick ${p.avatar === a ? 'selected' : ''}`, 'aria-label': a,
      onclick: () => { store.update((st) => { st.profiles[p.id].avatar = a; }); settingsPage(); },
    }, img(a, { cls: 'avatar' })))),
    h('button', { type: 'button', class: 'btn ghost', onclick: () => go('#/profiles') }, '👥 Change child'),

    h('h2', {}, '🔊 Voice'),
    h('label', {}, 'Voice ', voiceSelect),
    h('label', {}, 'Accent ', accent),
    h('label', {}, 'Speed ', rate),
    h('label', { class: 'check' }, auto, ' Read instructions and praise aloud automatically'),
    h('button', { type: 'button', class: 'btn ghost', onclick: () => speak('Hello! I am Sam. Welcome to Greenhill!') }, '▶ Test voice'),

    h('h2', {}, '🎤 Microphone'),
    h('p', { class: 'muted' }, speech.canListen
      ? 'The app listens when the child taps 🎤. Speech is processed by the browser’s speech service, which needs an internet connection.'
      : 'This browser cannot listen. Use Chrome, Edge or Safari for the speaking tasks.'),
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
    h('p', { class: 'muted' }, 'Progress and scores are saved automatically on this device after every answer. Make a backup to move progress to another device.'),
    h('div', { class: 'controls left' },
      h('button', {
        type: 'button', class: 'btn ghost',
        onclick: () => {
          const blob = new Blob([store.exportData()], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: `english-adventures-backup-${new Date().toISOString().slice(0, 10)}.json` });
          add(document.body, a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        },
      }, '⬇ Download backup'),
      h('button', { type: 'button', class: 'btn ghost', onclick: () => fileInput.click() }, '⬆ Restore backup'),
      fileInput),

    h('h2', {}, '👪 Grown-ups'),
    h('p', { class: 'muted' }, 'Grown-up mode lets you give points for writing, speaking and reading tasks, and see the answer notes.'),
    h('div', { class: 'controls left' },
      adultMode
        ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { adultMode = false; settingsPage(); } }, 'Turn off grown-up mode')
        : h('button', { type: 'button', class: 'btn ghost', onclick: async () => { if (await unlockAdult()) settingsPage(); } }, '🔒 Turn on grown-up mode'),
      h('button', {
        type: 'button', class: 'btn danger',
        onclick: async () => {
          if (!(await unlockAdult())) return;
          if (!confirm(`Delete all progress for ${p.name}? This cannot be undone.`)) return;
          store.update((st) => { st.profiles[p.id].progress = {}; st.profiles[p.id].lastLocation = null; });
          toast('Progress reset.', 'good');
          go('#/');
        },
      }, '🗑 Reset progress')),

    h('h2', {}, 'ℹ️ About'),
    h('p', { class: 'small muted' }, BOOK.credits)));
}

function profilesPage() {
  renderHeader('Who is learning?');
  const list = h('div', { class: 'profile-list' });
  for (const prof of Object.values(store.state.profiles)) {
    add(list, h('div', { class: 'profile' },
      h('button', { type: 'button', class: 'profile-pick', onclick: () => { store.selectProfile(prof.id); go('#/'); } },
        img(prof.avatar, { cls: 'avatar big' }), h('span', {}, prof.name)),
      h('button', {
        type: 'button', class: 'icon-btn', 'aria-label': `Delete ${prof.name}`,
        onclick: async () => {
          if (!(await unlockAdult())) return;
          if (confirm(`Delete ${prof.name} and all their progress?`)) { store.deleteProfile(prof.id); profilesPage(); }
        },
      }, '🗑')));
  }
  let avatar = AVATARS[Object.keys(store.state.profiles).length % AVATARS.length];
  const nameInput = h('input', { type: 'text', class: 'write-input', placeholder: 'Your name', 'aria-label': 'Your name', maxlength: '30' });
  const avatars = h('div', { class: 'avatar-row' });
  const drawAvatars = () => {
    clear(avatars);
    AVATARS.forEach((a) => add(avatars, h('button', {
      type: 'button', class: `avatar-pick ${a === avatar ? 'selected' : ''}`, 'aria-label': a,
      onclick: () => { avatar = a; drawAvatars(); },
    }, img(a, { cls: 'avatar' }))));
  };
  drawAvatars();
  clear(main);
  add(main, 
    h('section', { class: 'hero small' }, img('cover', { cls: 'cover', alt: '' }),
      h('div', { class: 'hero-text' }, h('h2', {}, BOOK.title), h('p', {}, BOOK.subtitle))),
    list.childElementCount ? h('section', { class: 'card' }, h('h2', {}, 'Choose your name'), list) : null,
    h('section', { class: 'card' },
      h('h2', {}, list.childElementCount ? 'Add a new learner' : 'What is your name?'),
      nameInput, h('p', {}, 'Choose a picture:'), avatars,
      h('div', { class: 'controls' }, h('button', {
        type: 'button', class: 'btn primary big',
        onclick: () => {
          if (!nameInput.value.trim()) { toast('Write your name first!', 'bad'); nameInput.focus(); return; }
          store.createProfile(nameInput.value, avatar);
          store.flush();
          speak(`Hello, ${nameInput.value.trim()}! Let's begin!`);
          go('#/');
        },
      }, "Let's go! ➜"))));
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
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
