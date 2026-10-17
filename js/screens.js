// Screens for activities that are not simple question cards: word cards,
// stories with a reading record, dialogues, pronunciation practice, writing,
// grown-up scoring and the Progress Check.

import { h, add, clear, img, picture, rich, stars, formatTime, toast } from './ui.js';
import { scorePronunciation, compareReading, withConfidence } from './scoring.js';

const SPEAKER_PITCH = { Sam: 1.15, Ben: 1.25, Lina: 1.35, Dina: 1.5, 'Mrs Green': 1.0, 'Mr Hill': 0.8, 'Ms Rose': 1.05, Adult: 0.95, You: 1.2 };
const pitchFor = (speaker) => SPEAKER_PITCH[speaker] ?? 1.05;

function speakBtn(env, text, labelText = '🔊', opts = {}) {
  return h('button', {
    type: 'button',
    class: 'speak-btn',
    'aria-label': `Listen: ${text}`,
    onclick: (e) => { e.stopPropagation(); env.speak(text, opts); },
  }, labelText);
}

function doneButton(env, act, text = "I'm done ✓") {
  return h('button', {
    type: 'button',
    class: 'btn primary',
    onclick: () => { env.complete(act, 0, 0); env.back(); },
  }, text);
}

// A word said in practice counts with one star: the browser's recognizer is
// made for adults, so children's words often come back slightly wrong.
const PRACTICE_PASS = 1;

// The microphone is really recording now: tell the child to speak.
function micReady(btn, status, text) {
  btn.classList.replace('starting', 'listening');
  status.textContent = text;
}

// Stars for a whole sentence read aloud.
function sentenceStars(ratio) {
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.3) return 1;
  return 0;
}

// ---------------------------------------------------------------- word cards
export function wordsScreen(root, act, env) {
  const rec = env.store.activityProgress(act.id);
  const heard = new Set(rec?.data?.heard || []);
  const best = { ...(rec?.data?.stars || {}) };
  const all = act.groups.flatMap((g) => g.words);

  const meter = h('div', { class: 'meter' });
  function updateMeter() {
    meter.textContent = `Words heard: ${all.filter((w) => heard.has(w.word)).length} / ${all.length}`;
  }
  function markHeard(word) {
    heard.add(word);
    env.store.updateActivity(act.id, (r) => { r.data.heard = [...heard]; });
    updateMeter();
  }

  add(root, h('p', { class: 'hint' }, 'Tap a card to hear the word. Tap 🎤 to say it — the app will listen!'), meter);
  for (const group of act.groups) {
    if (group.title) add(root, h('h3', { class: 'group-title' }, group.title));
    const grid = h('div', { class: 'word-grid' });
    for (const w of group.words) {
      const starBox = h('span', { class: 'word-stars' }, best[w.word] ? stars(best[w.word]) : null);
      const status = h('div', { class: 'word-status', role: 'status', 'aria-live': 'polite' });
      const card = h('div', { class: `word-card ${heard.has(w.word) ? 'heard' : ''}` },
        h('button', {
          type: 'button', class: 'word-main',
          onclick: async () => {
            card.classList.add('heard');
            markHeard(w.word);
            await env.speak(w.word);
            if (w.example) await env.speak(w.example);
          },
        },
        w.img ? img(w.img, { cls: 'pic-lg' }) : null,
        h('span', { class: 'word' }, w.word),
        w.hint ? h('span', { class: 'say-hint' }, w.hint) : null),
        w.meaning ? h('p', { class: 'meaning' }, w.meaning) : null,
        w.example ? h('p', { class: 'example' }, rich(w.example)) : null,
        h('div', { class: 'card-actions' },
          speakBtn(env, w.word, '🔊'),
          speakBtn(env, w.word, '🐢', { slow: true }),
          env.canListen ? h('button', {
            type: 'button', class: 'mic-btn small', 'aria-label': `Say ${w.word}`,
            onclick: async (e) => {
              const btn = e.currentTarget;
              btn.classList.add('starting');
              status.textContent = 'Wait…';
              try {
                const heardNow = await env.listen({ expected: all.map((x) => x.word), onReady: () => micReady(btn, status, 'Say the word now!') });
                const result = scorePronunciation(w.word, heardNow.alternatives, w.accept);
                result.stars = withConfidence(result.stars, heardNow.confidence);
                status.textContent = result.stars >= PRACTICE_PASS ? `✓ I heard "${result.heard}"` : `I heard "${result.heard}". Try again!`;
                if (result.stars > (best[w.word] || 0)) {
                  best[w.word] = result.stars;
                  env.store.updateActivity(act.id, (r) => { r.data.stars = { ...best }; });
                  clear(starBox).append(stars(result.stars));
                }
                env.sound(result.stars >= PRACTICE_PASS ? 'right' : 'wrong');
                markHeard(w.word);
              } catch (err) {
                status.textContent = err.message;
              } finally {
                btn.classList.remove('starting', 'listening');
              }
            },
          }, '🎤') : null,
          starBox),
        status);
      add(grid, card);
    }
    add(root, grid);
  }
  if (act.strip) add(root, stripRow(env, act.strip));
  updateMeter();
  add(root, h('div', { class: 'controls' }, doneButton(env, act, 'I know these words ✓')));
}

function stripRow(env, strip) {
  return h('div', { class: 'strip' }, strip.map((s) => h('button', {
    type: 'button', class: 'strip-item', onclick: () => env.speak(s.say || s.text),
  }, s.img ? img(s.img, { cls: 'pic' }) : null, h('span', {}, s.text))));
}

// ------------------------------------------------------------- info boxes
export function infoScreen(root, act, env) {
  add(root, renderBlocks(act.blocks, env));
  add(root, h('div', { class: 'controls' }, doneButton(env, act, act.doneLabel || 'Got it ✓')));
}

export function renderBlocks(blocks, env) {
  const box = h('div', { class: 'blocks' });
  for (const b of blocks || []) {
    switch (b.kind) {
      case 'p':
        add(box, h('p', { class: `say-line ${b.cls || ''}`, onclick: () => env.speak(plain(b.text)) }, rich(b.text)));
        break;
      case 'note':
        add(box, h('div', { class: 'note' }, h('span', { class: 'note-icon' }, b.icon || '💡'), h('div', {}, rich(b.text))));
        break;
      case 'adult':
        add(box, h('details', { class: 'adult-note' }, h('summary', {}, 'For the adult'), h('p', {}, rich(b.text))));
        break;
      case 'list':
        add(box, h('ul', { class: 'say-list' }, b.items.map((t) => h('li', { onclick: () => env.speak(plain(t)) }, rich(t)))));
        break;
      case 'words':
        add(box, h('div', { class: 'word-chips' }, b.title ? h('span', { class: 'chips-title' }, rich(b.title)) : null,
          b.words.map((w) => {
            const item = typeof w === 'string' ? { text: w } : w;
            return h('button', { type: 'button', class: 'chip big', onclick: () => env.speak(item.say || plain(item.text)) },
              item.img ? img(item.img, { cls: 'pic-small' }) : null, rich(item.text));
          })));
        break;
      case 'table':
        add(box, h('div', { class: 'table-wrap' }, h('table', {},
          b.head ? h('thead', {}, h('tr', {}, b.head.map((c) => h('th', {}, rich(c))))) : null,
          h('tbody', {}, b.rows.map((row) => h('tr', {}, row.map((c) => h('td', { onclick: () => env.speak(plain(c)) }, rich(c)))))))));
        break;
      case 'mistakes':
        add(box, h('div', { class: 'mistakes' }, b.pairs.map(([bad, good]) => h('div', { class: 'mistake-row' },
          h('span', { class: 'bad' }, '✗ ', bad),
          h('span', { class: 'good', onclick: () => env.speak(good) }, '✓ ', good)))));
        break;
      case 'img':
        add(box, h('figure', { class: 'figure' }, img(b.img, { cls: 'pic-xl', alt: b.caption || '' }), b.caption ? h('figcaption', {}, b.caption) : null));
        break;
      case 'pics':
        add(box, h('div', { class: 'pic-row' }, b.items.map((p) => h('button', {
          type: 'button', class: 'pic-tile', onclick: () => env.speak(p.say || p.text),
        }, picture(p.img, 'pic-lg'), h('span', {}, p.text)))));
        break;
      default:
        break;
    }
  }
  return box;
}

const plain = (t) => String(t).replace(/\*\*/g, '');

// ------------------------------------------------------- pronunciation
export function speakScreen(root, act, env) {
  const items = act.items;
  const repeat = act.mode !== 'read';
  // Practice passes with one star; tests ask for a clearer two.
  const pass = act.review ? 2 : PRACTICE_PASS;
  let rec = env.store.activityProgress(act.id);
  let index = rec?.completed ? 0 : Math.min(rec?.index ?? 0, items.length - 1);
  let selfCheck = !env.canListen;

  const card = h('div', { class: 'card speak-card' });
  add(root, h('p', { class: 'hint' }, repeat
    ? 'Listen to the word. Then tap the microphone and say it.'
    : 'Read the word aloud. Tap the microphone first, then read.'), card);

  function saved() {
    return env.store.activityProgress(act.id)?.answers || [];
  }

  function show() {
    clear(card);
    const item = items[index];
    const prev = saved()[index];
    const text = item.text;
    const starBox = h('div', { class: 'big-stars' }, stars(prev?.stars || 0));
    const status = h('div', { class: 'speak-status', role: 'status', 'aria-live': 'polite' },
      prev?.heard ? `Best try: "${prev.heard}"` : '');
    const mic = h('button', { type: 'button', class: 'mic-btn', 'aria-label': 'Tap and speak' }, '🎤');
    const nextBtn = h('button', { type: 'button', class: 'btn primary' }, index === items.length - 1 ? 'Finish 🏁' : 'Next ➜');
    const backBtn = h('button', { type: 'button', class: 'btn ghost', disabled: index === 0 }, '⬅');

    add(card, 
      h('div', { class: 'item-count' }, `${index + 1} / ${items.length}`),
      item.img ? h('div', { class: 'item-pic' }, picture(item.img, 'pic-hero')) : null,
      h('div', { class: 'speak-word' }, text),
      item.hint ? h('div', { class: 'say-hint' }, item.hint) : null,
      h('div', { class: 'speak-tools' },
        h('button', { type: 'button', class: 'btn ghost', onclick: () => env.speak(item.say || text) }, '🔊 Listen'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => env.speak(item.say || text, { slow: true }) }, '🐢 Slowly')),
      selfCheck ? selfCheckRow() : mic,
      starBox, status,
      h('div', { class: 'controls' }, backBtn, nextBtn));

    function record(starsGot, heard) {
      const before = saved()[index];
      const bestStars = Math.max(before?.stars || 0, starsGot);
      env.store.updateActivity(act.id, (r) => {
        r.answers[index] = { stars: bestStars, heard: starsGot >= (before?.stars || 0) ? heard : before?.heard, tries: (before?.tries || 0) + 1, done: true };
        r.index = index;
      });
      clear(starBox).append(stars(bestStars));
    }

    function selfCheckRow() {
      return h('div', { class: 'self-check' },
        h('p', { class: 'muted' }, env.canListen
          ? 'The microphone is not working. A grown-up can listen and choose:'
          : 'This browser cannot listen. A grown-up can listen and choose:'),
        h('button', { type: 'button', class: 'btn good', onclick: () => { record(3, '(grown-up: well said)'); status.textContent = '✓ Well said!'; env.sound('right'); } }, '👍 Said it well'),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { record(1, '(grown-up: practise more)'); status.textContent = 'Keep practising!'; } }, '🔁 Needs practice'));
    }

    mic.addEventListener('click', async () => {
      mic.classList.add('starting');
      mic.disabled = true;
      status.textContent = 'Wait…';
      try {
        const heardNow = await env.listen({
          expected: items.flatMap((it) => [it.text, ...(it.accept || [])]),
          mode: text.trim().includes(' ') ? 'sentence' : 'word',
          onReady: () => micReady(mic, status, repeat ? 'Speak now!' : 'Read it now!'),
        });
        const { alternatives } = heardNow;
        const result = scorePronunciation(text, alternatives, item.accept);
        let got = result.stars;
        if (text.trim().includes(' ')) {
          // Phrases: count how many words were said.
          const cmp = compareReading(text, result.heard || alternatives[0]);
          got = Math.max(got, sentenceStars((cmp.words.length - cmp.mistakes) / cmp.words.length));
        }
        got = withConfidence(got, heardNow.confidence);
        record(got, result.heard);
        const msg = got >= pass
          ? ['', 'Good! Try again for more stars.', 'Very good!', 'Perfect!'][got]
          : ['Let’s try again. Listen first!', 'Good try! Say it again.'][got];
        status.textContent = `${msg}  I heard: "${result.heard}"`;
        env.sound(got >= pass ? 'right' : 'wrong');
        await env.speak(msg.replace(/[!.]/g, ''), { quiet: true });
        if (got < pass && repeat) await env.speak(item.say || text);
      } catch (err) {
        if (err.code === 'aborted') return;
        status.textContent = err.message;
        if (['not-allowed', 'service-not-allowed', 'audio-capture', 'unsupported'].includes(err.code)) {
          selfCheck = true;
          mic.replaceWith(selfCheckRow());
        }
      } finally {
        mic.classList.remove('starting', 'listening');
        mic.disabled = false;
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!saved()[index]?.done) {
        env.store.updateActivity(act.id, (r) => { r.answers[index] = { stars: 0, heard: '', tries: 0, done: true, skipped: true }; });
      }
      if (index < items.length - 1) {
        index++;
        env.store.updateActivity(act.id, (r) => { r.index = index; });
        show();
      } else {
        finish();
      }
    });
    backBtn.addEventListener('click', () => { index--; show(); });

    if (repeat && env.settings().autoSpeak) setTimeout(() => env.speak(item.say || text), 250);
  }

  function finish() {
    const list = saved();
    const good = items.filter((_, i) => (list[i]?.stars || 0) >= pass).length;
    let earned = good;
    let possible = items.length;
    if (act.pointsRule) {
      possible = act.points;
      earned = act.pointsRule.find((r) => good >= r.min)?.points ?? 0;
    }
    env.complete(act, earned, possible);
    clear(card);
    add(card, env.resultPanel(act, earned, possible, () => {
      env.store.resetActivity(act.id);
      index = 0;
      show();
    }, `You said ${good} of ${items.length} well.`));
  }

  show();
}

// ------------------------------------------------------------- stories
export function storyScreen(root, act, env) {
  const rec = env.store.activityProgress(act.id);
  const records = rec?.data?.keep?.records || [];
  const lineEls = [];
  let stopFlag = false;

  if (act.helpers) add(root, h('div', { class: 'note helpers' }, h('span', { class: 'note-icon' }, '🧩'), h('div', {}, h('strong', {}, 'Story helpers: '), rich(act.helpers))));
  if (act.adult) add(root, h('details', { class: 'adult-note' }, h('summary', {}, 'For the adult'), h('p', {}, rich(act.adult))));

  const story = h('div', { class: 'story' }, h('h3', { class: 'story-title' }, act.storyTitle || act.title));
  act.lines.forEach((line) => {
    if (line.img) {
      add(story, h('figure', { class: 'figure' }, img(line.img, { cls: 'pic-xl', alt: line.caption || '' }), line.caption ? h('figcaption', {}, line.caption) : null));
      return;
    }
    const words = h('span', { class: 'line-words' }, line.text.split(' ').map((w) => h('span', { class: 'w' }, `${w} `)));
    const el = h('p', {
      class: `story-line ${line.speaker ? 'dialogue' : ''} ${line.cls || ''}`,
      onclick: () => env.speak(line.text, { pitch: pitchFor(line.speaker) }),
    }, line.speaker ? h('span', { class: 'speaker' }, `${line.speaker}:`) : null, words);
    lineEls.push({ el, line, words });
    add(story, el);
  });

  const status = h('div', { class: 'speak-status', role: 'status', 'aria-live': 'polite' });
  const listenBtn = h('button', { type: 'button', class: 'btn primary' }, '▶ Listen to the story');
  const readBtn = h('button', { type: 'button', class: 'btn good' }, '🎤 I read it aloud');
  const stopBtn = h('button', { type: 'button', class: 'btn ghost hidden' }, '⏹ Stop');
  const recordBox = h('div', { class: 'records' });

  add(root, h('div', { class: 'controls sticky' }, listenBtn, readBtn, stopBtn), status, story, recordBox);
  drawRecords();

  function drawRecords() {
    clear(recordBox);
    const list = env.store.activityProgress(act.id)?.data?.keep?.records || records;
    if (!list.length) return;
    add(recordBox, h('h3', {}, '📒 My reading record'));
    const table = h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Date'), h('th', {}, 'Time'), h('th', {}, 'Mistakes'))));
    const body = h('tbody');
    list.slice(-6).reverse().forEach((r) => add(body, h('tr', {},
      h('td', {}, new Date(r.date).toLocaleDateString()), h('td', {}, formatTime(r.seconds)), h('td', {}, String(r.mistakes)))));
    add(table, body);
    add(recordBox, table);
  }

  function setBusy(busy) {
    listenBtn.classList.toggle('hidden', busy);
    readBtn.classList.toggle('hidden', busy);
    stopBtn.classList.toggle('hidden', !busy);
  }

  stopBtn.addEventListener('click', () => {
    stopFlag = true;
    env.stop();
    setBusy(false);
    lineEls.forEach(({ el }) => el.classList.remove('current'));
    status.textContent = '';
  });

  listenBtn.addEventListener('click', async () => {
    stopFlag = false;
    setBusy(true);
    for (const { el, line } of lineEls) {
      if (stopFlag) break;
      el.classList.add('current');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await env.speak(line.text, { pitch: pitchFor(line.speaker) });
      el.classList.remove('current');
    }
    if (!stopFlag) {
      env.store.updateActivity(act.id, (r) => { r.data.listened = true; });
      if (!env.store.activityProgress(act.id)?.completed) env.complete(act, 0, 0, { quiet: true });
      status.textContent = 'Now you read it! Tap "I read it aloud".';
    }
    setBusy(false);
  });

  readBtn.addEventListener('click', async () => {
    if (!env.canListen) {
      toast('This browser cannot listen. Try Chrome, Edge or Safari.', 'bad');
      return;
    }
    stopFlag = false;
    setBusy(true);
    lineEls.forEach(({ words }) => words.querySelectorAll('.w').forEach((w) => w.classList.remove('ok', 'miss')));
    const started = Date.now();
    let mistakes = 0;
    let total = 0;
    for (let i = 0; i < lineEls.length && !stopFlag; i++) {
      const { el, line, words } = lineEls[i];
      el.classList.add('current');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      let result = null;
      for (let attempt = 0; attempt < 3 && !result && !stopFlag; attempt++) {
        status.textContent = 'Wait…';
        try {
          const { alternatives } = await env.listen({
            expected: lineEls.map((l) => l.line.text),
            mode: 'sentence',
            timeoutMs: 6000 + line.text.length * 120,
            onReady: () => { status.textContent = '🎤 Read this line aloud now!'; },
          });
          const best = alternatives
            .map((alt) => compareReading(line.text, alt))
            .sort((a, b) => a.mistakes - b.mistakes)[0];
          result = best;
        } catch (err) {
          if (err.code === 'aborted' || stopFlag) break;
          status.textContent = `${err.message}`;
          if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network'].includes(err.code)) { stopFlag = true; break; }
        }
      }
      el.classList.remove('current');
      if (!result) {
        if (stopFlag) break;
        result = compareReading(line.text, '');
      }
      const spans = words.querySelectorAll('.w');
      // Words with only punctuation don't count, so map by normalised index.
      let k = 0;
      spans.forEach((span) => {
        if (!/[a-z0-9]/i.test(span.textContent)) return;
        span.classList.add(result.matched[k] ? 'ok' : 'miss');
        k++;
      });
      mistakes += result.mistakes;
      total += result.words.length;
    }
    setBusy(false);
    if (stopFlag) {
      status.textContent = 'Stopped. Try again when you are ready!';
      return;
    }
    const seconds = Math.round((Date.now() - started) / 1000);
    const entry = { date: new Date().toISOString(), seconds, mistakes, words: total };
    env.store.updateActivity(act.id, (r) => {
      r.data.keep ||= {};
      r.data.keep.records = [...(r.data.keep.records || []), entry];
    });
    if (act.points && act.mistakeBands) {
      // Scored reading (Final Assessment): points from the number of mistakes.
      const points = act.mistakeBands.find(([max]) => mistakes <= max)?.[1] ?? 1;
      env.complete(act, points, act.points);
    } else {
      env.complete(act, 0, 0, { quiet: true });
    }
    status.textContent = `I read "${act.storyTitle || act.title}" aloud in ${formatTime(seconds)} with ${mistakes} mistake${mistakes === 1 ? '' : 's'}.`;
    env.sound('right');
    env.celebrate();
    drawRecords();
  });
}

// ------------------------------------------------------------ dialogues
export function dialogueScreen(root, act, env) {
  const roles = act.roles || [...new Set(act.lines.map((l) => l.speaker))];
  let stopFlag = false;
  const lineEls = act.lines.map((line) => {
    const el = h('p', { class: 'story-line dialogue', onclick: () => env.speak(line.text, { pitch: pitchFor(line.speaker) }) },
      h('span', { class: 'speaker' }, `${line.speaker}:`), h('span', { class: 'line-words' }, line.text), h('span', { class: 'line-stars' }));
    return { el, line };
  });
  const status = h('div', { class: 'speak-status', role: 'status', 'aria-live': 'polite' });
  const listenBtn = h('button', { type: 'button', class: 'btn primary' }, '▶ Listen');
  const stopBtn = h('button', { type: 'button', class: 'btn ghost hidden' }, '⏹ Stop');
  const roleBtns = roles.map((role) => h('button', { type: 'button', class: 'btn good', onclick: () => play(role) }, `🎭 I am ${role}`));

  if (act.text) add(root, h('p', { class: 'hint' }, rich(act.text)));
  add(root, h('div', { class: 'controls sticky' }, listenBtn, ...roleBtns, stopBtn), status,
    h('div', { class: 'story' }, lineEls.map((l) => l.el)));
  if (act.talk) add(root, h('div', { class: 'note' }, h('span', { class: 'note-icon' }, '🗣️'), h('div', {}, rich(act.talk))));
  add(root, h('div', { class: 'controls' }, doneButton(env, act)));

  function busy(on) {
    [listenBtn, ...roleBtns].forEach((b) => b.classList.toggle('hidden', on));
    stopBtn.classList.toggle('hidden', !on);
  }
  stopBtn.addEventListener('click', () => { stopFlag = true; env.stop(); busy(false); status.textContent = ''; });

  listenBtn.addEventListener('click', async () => {
    stopFlag = false;
    busy(true);
    for (const { el, line } of lineEls) {
      if (stopFlag) break;
      el.classList.add('current');
      await env.speak(line.text, { pitch: pitchFor(line.speaker) });
      el.classList.remove('current');
    }
    busy(false);
  });

  async function play(role) {
    if (!env.canListen) {
      toast('This browser cannot listen, so read your lines to your grown-up.', 'bad');
    }
    stopFlag = false;
    busy(true);
    const results = [];
    for (const { el, line } of lineEls) {
      if (stopFlag) break;
      el.classList.add('current');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (line.speaker !== role) {
        await env.speak(line.text, { pitch: pitchFor(line.speaker) });
      } else if (env.canListen) {
        status.textContent = `Your turn, ${role}! Wait…`;
        try {
          const { alternatives } = await env.listen({
            expected: act.lines.map((l) => l.text),
            mode: 'sentence',
            timeoutMs: 6000 + line.text.length * 120,
            onReady: () => { status.textContent = `🎤 Say your line now, ${role}!`; },
          });
          const cmp = alternatives.map((a) => compareReading(line.text, a)).sort((a, b) => a.mistakes - b.mistakes)[0];
          const got = sentenceStars((cmp.words.length - cmp.mistakes) / cmp.words.length);
          results.push(got);
          clear(el.querySelector('.line-stars')).append(stars(got));
          status.textContent = got >= 2 ? 'Great!' : 'Good try!';
        } catch (err) {
          if (err.code === 'aborted' || stopFlag) break;
          status.textContent = err.message;
        }
      } else {
        status.textContent = `Your turn, ${role}! Say your line, then wait.`;
        await new Promise((r) => setTimeout(r, 2500 + line.text.length * 60));
      }
      el.classList.remove('current');
    }
    busy(false);
    if (!stopFlag) {
      const avg = results.length ? results.reduce((a, b) => a + b, 0) / results.length : 0;
      env.store.updateActivity(act.id, (r) => { r.data.best = Math.max(r.data.best || 0, avg); });
      status.textContent = 'Well done! Now try the other part.';
      env.celebrate();
    }
  }
}

// ------------------------------------------------------------- writing
export function openScreen(root, act, env) {
  const rec = env.store.activityProgress(act.id);
  const values = [...(rec?.data?.text || [])];
  const fields = [];

  if (act.img) add(root, h('div', { class: 'item-pic' }, picture(act.img, 'pic-xl')));
  if (act.text) add(root, h('div', { class: 'reading-box' }, rich(act.text)));
  const form = h('div', { class: 'open-form' });
  const save = () => env.store.updateActivity(act.id, (r) => { r.data.text = [...values]; });

  if (act.frames) {
    act.frames.forEach((f, i) => {
      const input = h('input', {
        type: 'text', class: 'gap-input wide', placeholder: f.hint || '', 'aria-label': f.before || `Line ${i + 1}`,
        oninput: (e) => { values[i] = e.target.value; save(); },
      });
      input.value = values[i] || '';
      fields.push(input);
      add(form, h('div', { class: 'frame' }, f.before ? h('span', {}, rich(f.before)) : null, input, f.after ? h('span', {}, rich(f.after)) : null));
    });
  } else {
    const count = act.lines || 3;
    for (let i = 0; i < count; i++) {
      const input = h('input', {
        type: 'text', class: 'write-input', placeholder: `Sentence ${i + 1}`,
        oninput: (e) => { values[i] = e.target.value; save(); },
      });
      input.value = values[i] || '';
      fields.push(input);
      add(form, input);
    }
  }
  add(root, form);

  add(root, h('div', { class: 'controls' },
    h('button', {
      type: 'button', class: 'btn ghost',
      onclick: () => {
        const textOut = act.frames
          ? act.frames.map((f, i) => [f.before, values[i], f.after].filter(Boolean).join(' ')).join('. ')
          : values.filter(Boolean).join(' ');
        env.speak(textOut || 'Write something first!');
      },
    }, '🔊 Hear my writing')));

  if (act.talk) add(root, h('div', { class: 'note' }, h('span', { class: 'note-icon' }, '🗣️'), h('div', {}, h('strong', {}, 'Talk: '), rich(act.talk))));
  if (act.model) {
    add(root, h('details', { class: 'model' }, h('summary', {}, '💡 See an example answer'),
      h('p', { onclick: () => env.speak(act.model) }, act.model)));
  }

  const possible = act.points || (act.rubric ? act.rubric.reduce((s, r) => s + r.max, 0) : 0);
  if (possible) add(root, adultScorePanel(act, env, possible));

  add(root, h('div', { class: 'controls' }, h('button', {
    type: 'button', class: 'btn primary',
    onclick: () => {
      if (!values.some((v) => v && v.trim())) {
        toast('Write your answer first!', 'bad');
        return;
      }
      const score = env.store.activityProgress(act.id)?.data?.adultScore;
      env.complete(act, score ?? 0, possible, { pending: possible > 0 && score == null });
      env.back();
    },
  }, "I'm done ✓")));
}

// Points given by a grown-up (writing, talking, letter sounds).
function adultScorePanel(act, env, possible) {
  const panel = h('div', { class: 'adult-panel' });
  function draw() {
    clear(panel);
    const rec = env.store.activityProgress(act.id);
    const parts = rec?.data?.rubric || {};
    add(panel, h('h3', {}, `👪 Grown-up score (${possible} points)`));
    if (!env.isAdult()) {
      add(panel, h('p', { class: 'muted' }, rec?.data?.adultScore != null
        ? `Score: ${rec.data.adultScore} / ${possible}`
        : 'A grown-up gives the points for this task.'),
      h('button', { type: 'button', class: 'btn ghost', onclick: async () => { if (await env.unlockAdult()) draw(); } }, '🔒 Grown-up: give points'));
      return;
    }
    if (act.guide) add(panel, h('p', { class: 'muted' }, rich(act.guide)));
    const rubric = act.rubric || [{ label: 'Points', max: possible }];
    rubric.forEach((r, ri) => {
      const row = h('div', { class: 'points-row' }, h('span', {}, r.label));
      for (let p = 0; p <= r.max; p++) {
        add(row, h('button', {
          type: 'button', class: `letter ${parts[ri] === p ? 'selected' : ''}`,
          onclick: () => {
            env.store.updateActivity(act.id, (rr) => {
              rr.data.rubric = { ...(rr.data.rubric || {}), [ri]: p };
              const all = rubric.map((_, k) => rr.data.rubric[k]);
              if (all.every((v) => v != null)) {
                rr.data.adultScore = all.reduce((a, b) => a + b, 0);
                rr.earned = rr.data.adultScore;
                rr.possible = possible;
                rr.pending = false;
              }
            });
            const updated = env.store.activityProgress(act.id);
            if (updated.completed && updated.data.adultScore != null) env.complete(act, updated.data.adultScore, possible, { quiet: true });
            draw();
          },
        }, String(p)));
      }
      add(panel, row);
    });
    const s = env.store.activityProgress(act.id)?.data?.adultScore;
    if (s != null) add(panel, h('p', {}, h('strong', {}, `Score: ${s} / ${possible}`)));
  }
  draw();
  return panel;
}

// Grown-up scored checklists (letter sounds, read aloud, talking).
export function adultScreen(root, act, env) {
  if (act.text) add(root, h('div', { class: 'reading-box' }, rich(act.text)));
  if (act.guide) add(root, h('details', { class: 'adult-note', open: true }, h('summary', {}, 'For the adult'), h('p', {}, rich(act.guide))));
  const box = h('div', {});
  add(root, box);
  const possible = act.items.reduce((s, it) => s + (it.max ?? 1), 0);

  function draw() {
    clear(box);
    const rec = env.store.activityProgress(act.id);
    const pts = rec?.data?.points || {};
    if (!env.isAdult()) {
      add(box, h('p', {}, rich(act.childText || 'Do this with your grown-up. They will give the points.')),
        act.items.some((it) => it.say) ? h('div', { class: 'word-chips' }, act.items.map((it) => h('span', { class: 'chip big' }, it.label))) : null,
        h('button', { type: 'button', class: 'btn primary', onclick: async () => { if (await env.unlockAdult()) draw(); } }, '🔒 Grown-up: start scoring'));
      if (rec?.completed) add(box, h('p', {}, `Score: ${rec.earned} / ${possible}`));
      return;
    }
    const grid = h('div', { class: act.compact ? 'adult-grid compact' : 'adult-grid' });
    act.items.forEach((it, i) => {
      const max = it.max ?? 1;
      const row = h('div', { class: 'points-row' }, h('span', { class: 'big-label' }, it.label));
      for (let p = 0; p <= max; p++) {
        add(row, h('button', {
          type: 'button', class: `letter ${pts[i] === p ? 'selected' : ''}`,
          onclick: () => { env.store.updateActivity(act.id, (r) => { r.data.points = { ...(r.data.points || {}), [i]: p }; }); draw(); },
        }, max === 1 ? (p ? '✓' : '✗') : String(p)));
      }
      add(grid, row);
    });
    const earned = Object.values(pts).reduce((a, b) => a + b, 0);
    add(box, grid, h('p', {}, h('strong', {}, `Score: ${earned} / ${possible}`)),
      h('div', { class: 'controls' }, h('button', {
        type: 'button', class: 'btn primary',
        onclick: () => {
          if (Object.keys(pts).length < act.items.length && !confirm('Some items have no score yet. They will count as 0. Finish?')) return;
          env.complete(act, earned, possible);
          env.back();
        },
      }, 'Save score ✓')));
  }
  draw();
}

// The app asks a question aloud; the child answers by voice.
export function askScreen(root, act, env) {
  const rec = env.store.activityProgress(act.id);
  const answers = [...(rec?.data?.answers || [])];
  const scoring = act.scoring || { sentence: 1, word: 0 };
  const possible = act.items.length * scoring.sentence;
  const list = h('div', { class: 'ask-list' });
  add(root, h('p', { class: 'hint' }, 'Tap 🔊 to hear the question. Then tap 🎤 and answer in a sentence.'), list);

  function suggest(text) {
    const n = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    if (n >= 3) return scoring.sentence;
    if (n >= 1) return scoring.word;
    return 0;
  }
  function save() {
    env.store.updateActivity(act.id, (r) => { r.data.answers = answers.map((a) => (a ? { ...a } : a)); });
  }

  function draw() {
    clear(list);
    act.items.forEach((it, i) => {
      const a = answers[i] || {};
      const heard = h('div', { class: 'heard' }, a.text ? `“${a.text}”` : '');
      const mic = h('button', { type: 'button', class: 'mic-btn small', 'aria-label': 'Answer' }, '🎤');
      mic.addEventListener('click', async () => {
        mic.classList.add('starting');
        heard.textContent = 'Wait…';
        try {
          const { alternatives } = await env.listen({ mode: 'sentence', timeoutMs: 9000, onReady: () => micReady(mic, heard, 'Answer now!') });
          answers[i] = { text: alternatives[0], points: suggest(alternatives[0]) };
          save();
          draw();
        } catch (err) {
          heard.textContent = err.message;
        } finally {
          mic.classList.remove('starting', 'listening');
        }
      });
      const typed = h('input', { type: 'text', class: 'write-input', placeholder: 'Or type the answer', value: a.text || '' });
      typed.addEventListener('change', () => { answers[i] = { text: typed.value, points: suggest(typed.value) }; save(); draw(); });
      const ptsRow = h('div', { class: 'points-row' }, h('span', { class: 'muted' }, 'Points:'));
      for (let p = 0; p <= scoring.sentence; p++) {
        add(ptsRow, h('button', {
          type: 'button', class: `letter ${a.points === p ? 'selected' : ''}`, disabled: !env.isAdult(),
          onclick: () => { answers[i] = { ...(answers[i] || {}), points: p }; save(); draw(); },
        }, String(p)));
      }
      add(list, h('div', { class: 'card ask-card' },
        it.img ? h('div', { class: 'item-pic' }, img(it.img, { cls: 'pic-lg' })) : null,
        h('div', { class: 'question big' }, speakBtn(env, it.q), h('span', {}, it.q)),
        h('div', { class: 'ask-tools' }, env.canListen ? mic : null, typed),
        heard,
        it.model ? h('p', { class: 'muted' }, `Example: ${it.model}`) : null,
        ptsRow));
    });
    if (!env.isAdult()) {
      add(list, h('button', { type: 'button', class: 'btn ghost', onclick: async () => { if (await env.unlockAdult()) draw(); } }, '🔒 Grown-up: check the points'));
    }
  }
  draw();
  add(root, h('div', { class: 'controls' }, h('button', {
    type: 'button', class: 'btn primary',
    onclick: () => {
      const earned = answers.reduce((s, a) => s + (a?.points || 0), 0);
      env.complete(act, earned, possible);
      env.back();
    },
  }, "I'm done ✓")));
}

// ---------------------------------------------------------- progress check
export function checkScreen(root, act, env) {
  const rec = env.store.activityProgress(act.id);
  const marks = { ...(rec?.data?.marks || {}) };
  const CHOICES = [['yes', '😀', 'Yes!'], ['almost', '🙂', 'Almost'], ['notyet', '🤔', 'Not yet']];
  add(root, h('p', { class: 'hint' }, 'How do you feel? Be honest — it helps your grown-up plan more practice.'));
  const list = h('div', { class: 'check-list' });
  act.items.forEach((text, i) => {
    const row = h('div', { class: 'check-row' }, h('span', { class: 'say-line', onclick: () => env.speak(`I can ${text}`) }, `I can ${text}`));
    const btns = h('div', { class: 'check-btns' });
    CHOICES.forEach(([key, icon, labelText]) => add(btns, h('button', {
      type: 'button', class: `check-btn ${marks[i] === key ? 'selected' : ''}`,
      onclick: () => {
        marks[i] = key;
        env.store.updateActivity(act.id, (r) => { r.data.marks = { ...marks }; });
        btns.querySelectorAll('.check-btn').forEach((b) => b.classList.remove('selected'));
        btns.children[CHOICES.findIndex((c) => c[0] === key)].classList.add('selected');
      },
    }, h('span', { class: 'emoji' }, icon), labelText)));
    add(row, btns);
    add(list, row);
  });
  add(root, list, h('div', { class: 'controls' }, h('button', {
    type: 'button', class: 'btn primary',
    onclick: () => {
      if (Object.keys(marks).length < act.items.length) {
        toast('Choose an answer for every line.', 'bad');
        return;
      }
      env.complete(act, 0, 0);
      env.back();
    },
  }, 'Save ✓')));
}

export const SCREENS = {
  words: wordsScreen,
  info: infoScreen,
  speak: speakScreen,
  story: storyScreen,
  dialogue: dialogueScreen,
  open: openScreen,
  adult: adultScreen,
  ask: askScreen,
  check: checkScreen,
};

