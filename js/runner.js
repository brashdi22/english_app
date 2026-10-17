// Runs the book's written exercises one card at a time: the child answers,
// taps Check, gets feedback, and every answer is saved straight away.
//
// Practice exercises allow two tries; Review / Checkpoint / Assessment
// exercises count the first try only, like a test in the book.

import { h, add, clear, picture, rich, shuffle, hashString, LETTERS, img } from './ui.js';
import { answersMatch, normalize } from './scoring.js';

const PRAISE = ['Great job!', 'Well done!', 'Super!', 'Excellent!', 'Fantastic!', 'You got it!'];
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

const asList = (v) => (Array.isArray(v) ? v : [v]);
const first = (v) => asList(v)[0];
const label = (opt) => (typeof opt === 'string' ? opt : opt.label || opt.text || '');

// Each item type: render(el, item, ctx) → returns a getter for the answer,
// grade(item, value) → { earned, possible, reveal }.
export const ITEM_TYPES = {
  choice: {
    items: (act) => act.items,
    render(el, item, ctx, act, state) {
      const options = act.tf ? ['True', 'False'] : item.options;
      let value = state.value ?? null;
      if (item.img) add(el, h('div', { class: 'item-pic' }, picture(item.img, 'pic-lg')));
      if (item.text) add(el, h('div', { class: 'reading-box' }, rich(item.text)));
      if (item.q) add(el, questionLine(item.q, ctx));
      const row = h('div', { class: `options ${options.some((o) => o.img) ? 'options-pics' : ''}` });
      options.forEach((opt, i) => {
        const btn = h('button', {
          class: `option ${value === i ? 'selected' : ''}`,
          type: 'button',
          onclick: () => {
            value = i;
            row.querySelectorAll('.option').forEach((b, j) => b.classList.toggle('selected', j === i));
            if (typeof opt === 'string' && !act.tf) ctx.speakQuiet(opt);
            ctx.changed(i);
          },
        },
        act.abc ? h('span', { class: 'opt-letter' }, `${LETTERS[i]})`) : null,
        typeof opt === 'string' ? opt : [opt.img ? img(opt.img, { cls: 'pic' }) : null, opt.label ? h('span', {}, opt.label) : null]);
        add(row, btn);
      });
      add(el, row);
      return () => value;
    },
    grade(item, value, act) {
      const options = act.tf ? ['True', 'False'] : item.options;
      let correctIndex;
      if (act.tf) correctIndex = item.answer ? 0 : 1;
      else if (typeof item.answer === 'number') correctIndex = item.answer;
      else correctIndex = options.findIndex((o) => answersMatch(label(o), item.answer));
      const ok = value === correctIndex;
      return { earned: ok ? item.points ?? 1 : 0, possible: item.points ?? 1, reveal: act.abc ? `${LETTERS[correctIndex]}) ${label(options[correctIndex])}` : label(options[correctIndex]) + (item.why ? ` (${item.why})` : '') };
    },
  },

  gap: {
    items: (act) => act.items,
    render(el, item, ctx, act, state) {
      const blanks = blankAnswers(item);
      const values = state.value ? [...state.value] : blanks.map(() => '');
      let active = values.findIndex((v) => !v);
      if (active < 0) active = 0;
      if (item.img) add(el, h('div', { class: 'item-pic' }, picture(item.img, 'pic-lg')));
      if (item.q) add(el, questionLine(item.q, ctx));
      if (item.say) {
        // Spelling: the word is only heard, never shown.
        add(el, h('div', { class: 'speak-tools' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => ctx.speak(item.say) }, '🔊 Hear the word'),
          h('button', { type: 'button', class: 'btn ghost', onclick: () => ctx.speak(item.say, { slow: true }) }, '🐢 Slowly')));
        setTimeout(() => ctx.speak(item.say), 400);
      }
      const parts = String(item.text ?? '___').split('___');
      const line = h('div', { class: 'gap-line' });
      const inputs = [];
      parts.forEach((part, i) => {
        if (part) add(line, h('span', {}, rich(part)));
        if (i < parts.length - 1) {
          const idx = inputs.length;
          if (act.bank) {
            const slot = h('button', {
              type: 'button',
              class: `slot ${idx === active ? 'active' : ''}`,
              onclick: () => { active = idx; refreshSlots(); },
            }, values[idx] || '?');
            inputs.push(slot);
            add(line, slot);
          } else {
            const input = h('input', {
              class: 'gap-input',
              type: 'text',
              autocomplete: 'off',
              autocapitalize: 'off',
              spellcheck: 'false',
              enterkeyhint: 'done',
              'aria-label': `Blank ${idx + 1}`,
              placeholder: item.hint ? `${item.hint}…` : '',
              size: Math.max(4, Math.min(22, String(first(blanks[idx])).length + 2)),
              oninput: (e) => { values[idx] = e.target.value; ctx.changed([...values]); },
              onkeydown: (e) => { if (e.key === 'Enter') ctx.submit(); },
            });
            input.value = values[idx];
            inputs.push(input);
            add(line, input);
          }
        }
      });
      add(el, line);
      if (item.after) add(el, h('p', { class: 'muted' }, item.after));
      function refreshSlots() {
        inputs.forEach((s, i) => {
          s.textContent = values[i] || '?';
          s.classList.toggle('active', i === active);
          s.classList.toggle('filled', Boolean(values[i]));
        });
      }
      if (act.bank) {
        const bank = h('div', { class: 'bank' });
        for (const word of act.bank) {
          add(bank, h('button', {
            type: 'button',
            class: 'chip',
            onclick: () => {
              values[active] = word;
              ctx.speakQuiet(word);
              const next = values.findIndex((v) => !v);
              if (next >= 0) active = next;
              refreshSlots();
              ctx.changed(values.every(Boolean) ? [...values] : null);
            },
          }, word));
        }
        add(el, bank);
        refreshSlots();
      } else {
        setTimeout(() => inputs[active]?.focus({ preventScroll: true }), 50);
      }
      return () => (values.every((v) => String(v).trim()) ? [...values] : null);
    },
    grade(item, value) {
      const blanks = blankAnswers(item);
      const per = (item.points ?? blanks.length) / blanks.length;
      let earned = 0;
      blanks.forEach((ans, i) => { if (answersMatch(value?.[i] ?? '', ans, { strict: item.strict })) earned += per; });
      return { earned, possible: item.points ?? blanks.length, reveal: fillText(item.text ?? '___', blanks.map(first)) };
    },
  },

  write: {
    items: (act) => act.items,
    render(el, item, ctx, act, state) {
      if (item.img) add(el, h('div', { class: 'item-pic' }, picture(item.img, 'pic-lg')));
      add(el, questionLine(item.prompt, ctx, { big: true }));
      const input = h('input', {
        class: 'write-input',
        type: 'text',
        autocomplete: 'off',
        spellcheck: 'false',
        enterkeyhint: 'done',
        placeholder: item.hint || 'Write here…',
        'aria-label': 'Your answer',
        oninput: (e) => ctx.changed(e.target.value),
        onkeydown: (e) => { if (e.key === 'Enter') ctx.submit(); },
      });
      input.value = state.value ?? '';
      add(el, input);
      setTimeout(() => input.focus({ preventScroll: true }), 50);
      return () => (input.value.trim() ? input.value : null);
    },
    grade(item, value) {
      // Short answers in your own words: correct when every keyword is there.
      const words = normalize(value).split(' ');
      const ok = item.keywords
        ? item.keywords.every((k) => asList(k).some((alt) => words.includes(normalize(alt))))
        : answersMatch(value, item.answer, { strict: item.strict });
      if (item.fullSentence) {
        // 1 point for the right information, 1 more for a full sentence.
        const earned = ok ? 1 + (words.length >= 4 ? 1 : 0) : 0;
        return { earned, possible: 2, reveal: first(item.answer) };
      }
      return { earned: ok ? item.points ?? 1 : 0, possible: item.points ?? 1, reveal: first(item.answer) };
    },
  },

  order: {
    items: (act) => act.items,
    render(el, item, ctx, act, state) {
      const chosen = state.value ? [...state.value] : [];
      const built = h('div', { class: 'built' });
      const pool = h('div', { class: 'bank' });
      function draw() {
        clear(built);
        clear(pool);
        if (!chosen.length) add(built, h('span', { class: 'muted' }, 'Tap the words in order'));
        chosen.forEach((wi, pos) => add(built, h('button', {
          type: 'button', class: 'chip chosen',
          onclick: () => { chosen.splice(pos, 1); draw(); ctx.changed(null); },
        }, item.words[wi])));
        item.words.forEach((w, wi) => {
          if (chosen.includes(wi)) return;
          add(pool, h('button', {
            type: 'button', class: 'chip',
            onclick: () => {
              chosen.push(wi);
              ctx.speakQuiet(w);
              draw();
              ctx.changed(chosen.length === item.words.length ? [...chosen] : null);
            },
          }, w));
        });
      }
      add(el, built, pool);
      draw();
      return () => (chosen.length === item.words.length ? [...chosen] : null);
    },
    grade(item, value) {
      const sentence = (value || []).map((i) => item.words[i]).join(' ');
      const ok = answersMatch(sentence, item.answer);
      return { earned: ok ? 1 : 0, possible: 1, reveal: item.answer };
    },
  },

  // Items of different kinds in one exercise ({ kind: 'choice' | 'gap' | 'write' }).
  mixed: {
    items: (act) => act.items,
    render(el, item, ctx, act, state) {
      return ITEM_TYPES[item.kind].render(el, item, ctx, { ...act, tf: item.tf, abc: item.abc, bank: item.bank }, state);
    },
    grade(item, value, act) {
      return ITEM_TYPES[item.kind].grade(item, value, { ...act, tf: item.tf, abc: item.abc, bank: item.bank });
    },
  },

  // Whole-exercise cards (one card holds several answers).
  match: {
    items: (act) => [act],
    render(el, act, ctx, _act, state) {
      const values = state.value ? [...state.value] : act.left.map(() => null);
      if (act.img) add(el, h('div', { class: 'item-pic' }, picture(act.img, 'pic-xl')));
      const rightPics = act.right.some((r) => r.img);
      if (rightPics) {
        const grid = h('div', { class: 'pic-key' });
        act.right.forEach((r, i) => add(grid, h('figure', {},
          img(r.img, { cls: 'pic' }), h('figcaption', {}, LETTERS[i]))));
        add(el, grid);
      } else {
        const list = h('ol', { class: 'match-right', type: 'a' });
        act.right.forEach((r) => add(list, h('li', {}, label(r))));
        add(el, list);
      }
      const rows = h('div', { class: 'match-rows' });
      act.left.forEach((l, li) => {
        const chips = h('div', { class: 'letters' });
        act.right.forEach((_, ri) => add(chips, h('button', {
          type: 'button',
          class: `letter ${values[li] === ri ? 'selected' : ''}`,
          'aria-label': `${label(l)}: ${LETTERS[ri]}`,
          onclick: () => {
            values[li] = ri;
            chips.querySelectorAll('.letter').forEach((b, j) => b.classList.toggle('selected', j === ri));
            ctx.changed(values.every((v) => v != null) ? [...values] : null);
          },
        }, LETTERS[ri])));
        add(rows, h('div', { class: 'match-row' },
          h('button', { type: 'button', class: 'match-left', onclick: () => ctx.speakQuiet(label(l)) },
            typeof l === 'string' ? l : [l.img ? img(l.img, { cls: 'pic' }) : null, label(l)]),
          chips));
      });
      add(el, rows);
      return () => (values.every((v) => v != null) ? [...values] : null);
    },
    grade(act, value) {
      const answer = [...act.answer].map((c) => LETTERS.indexOf(c));
      const earned = answer.filter((a, i) => value?.[i] === a).length;
      return { earned, possible: answer.length, reveal: act.left.map((l, i) => `${label(l)} → ${act.answer[i]}`).join(' · ') };
    },
  },

  sort: {
    items: (act) => [act],
    render(el, act, ctx, _act, state) {
      const words = act.bins.flatMap((b) => b.words);
      const shown = act.words || shuffle(words, hashString(act.id));
      const placed = state.value ? { ...state.value } : {};
      let picked = null;
      const pool = h('div', { class: 'bank' });
      const bins = h('div', { class: 'bins' });
      function draw() {
        clear(pool);
        clear(bins);
        shown.filter((w) => placed[w] == null).forEach((w) => add(pool, h('button', {
          type: 'button', class: `chip ${picked === w ? 'selected' : ''}`,
          onclick: () => { picked = w; ctx.speakQuiet(w); draw(); },
        }, w)));
        if (!pool.childElementCount) add(pool, h('span', { class: 'muted' }, 'All sorted! Tap Check.'));
        act.bins.forEach((b, bi) => {
          const box = h('button', {
            type: 'button', class: `bin ${picked ? 'ready' : ''}`,
            onclick: () => {
              if (!picked) return;
              placed[picked] = bi;
              picked = null;
              draw();
              ctx.changed(Object.keys(placed).length === words.length ? { ...placed } : null);
            },
          }, h('strong', {}, b.label));
          shown.filter((w) => placed[w] === bi).forEach((w) => add(box, h('span', {
            class: 'chip small',
            onclick: (e) => { e.stopPropagation(); delete placed[w]; draw(); ctx.changed(null); },
          }, w)));
          add(bins, box);
        });
      }
      add(el, h('p', { class: 'muted' }, 'Tap a word, then tap its box.'), pool, bins);
      draw();
      return () => (Object.keys(placed).length === words.length ? { ...placed } : null);
    },
    grade(act, value) {
      let earned = 0;
      let possible = 0;
      act.bins.forEach((b, bi) => b.words.forEach((w) => { possible++; if (value?.[w] === bi) earned++; }));
      return { earned, possible, reveal: act.bins.map((b) => `${b.label}: ${b.words.join(', ')}`).join(' · ') };
    },
  },

  sequence: {
    items: (act) => [act],
    render(el, act, ctx, _act, state) {
      const picks = state.value ? [...state.value] : [];
      const list = h('div', { class: 'sequence' });
      function draw() {
        clear(list);
        act.events.forEach((ev, i) => {
          const pos = picks.indexOf(i);
          add(list, h('button', {
            type: 'button', class: `seq-item ${pos >= 0 ? 'selected' : ''}`,
            onclick: () => {
              if (pos >= 0) picks.splice(pos, 1);
              else { picks.push(i); ctx.speakQuiet(ev); }
              draw();
              ctx.changed(picks.length === act.events.length ? [...picks] : null);
            },
          }, h('span', { class: 'seq-num' }, pos >= 0 ? String(pos + 1) : ''), ev));
        });
      }
      add(el, h('p', { class: 'muted' }, 'Tap what happens first, then second, and so on. Tap again to undo.'), list);
      draw();
      return () => (picks.length === act.events.length ? [...picks] : null);
    },
    grade(act, value) {
      // act.order[i] is the story position (1-based) of act.events[i].
      let earned = 0;
      act.events.forEach((_, i) => { if (value && value.indexOf(i) + 1 === act.order[i]) earned++; });
      const sorted = act.events.map((ev, i) => [act.order[i], ev]).sort((a, b) => a[0] - b[0]);
      return { earned, possible: act.events.length, reveal: sorted.map(([n, ev]) => `${n}. ${ev}`).join('  ') };
    },
  },

  multi: {
    items: (act) => [act],
    render(el, act, ctx, _act, state) {
      const picked = new Set(state.value || []);
      if (act.text) add(el, h('div', { class: 'reading-box' }, rich(act.text)));
      const row = h('div', { class: `options ${act.options.some((o) => o.img) ? 'options-pics' : ''}` });
      act.options.forEach((opt, i) => add(row, h('button', {
        type: 'button', class: `option tick ${picked.has(i) ? 'selected' : ''}`,
        'aria-pressed': picked.has(i) ? 'true' : 'false',
        onclick: (e) => {
          if (picked.has(i)) picked.delete(i); else picked.add(i);
          e.currentTarget.classList.toggle('selected', picked.has(i));
          e.currentTarget.setAttribute('aria-pressed', picked.has(i) ? 'true' : 'false');
          if (typeof opt === 'string') ctx.speakQuiet(opt);
          ctx.changed(picked.size ? [...picked] : null);
        },
      }, typeof opt === 'string' ? opt : [img(opt.img, { cls: 'pic' }), opt.label ? h('span', {}, opt.label) : null])));
      add(el, row);
      return () => (picked.size ? [...picked] : null);
    },
    grade(act, value) {
      const want = new Set(act.answer);
      const got = new Set(value || []);
      let earned = 0;
      act.options.forEach((_, i) => { if (want.has(i) === got.has(i)) earned++; });
      return { earned, possible: act.options.length, reveal: act.answer.map((i) => label(act.options[i])).join(', ') };
    },
  },

  tap: {
    items: (act) => (act.mode === 'letter' ? act.words.map((w) => ({ ...w, mode: 'letter' })) : [act]),
    render(el, item, ctx, act, state) {
      const picked = new Set(state.value || []);
      const box = h('div', { class: 'tap-text' });
      const tokens = item.mode === 'letter' ? [...item.word] : item.text.split(/\s+/);
      tokens.forEach((tok, i) => {
        add(box, h('button', {
          type: 'button', class: `tok ${item.mode === 'letter' ? 'tok-letter' : ''} ${picked.has(i) ? 'selected' : ''}`,
          onclick: (e) => {
            if (item.mode === 'letter') {
              picked.clear();
              box.querySelectorAll('.tok').forEach((b) => b.classList.remove('selected'));
              picked.add(i);
            } else if (picked.has(i)) picked.delete(i); else picked.add(i);
            e.currentTarget.classList.toggle('selected', picked.has(i));
            if (item.mode !== 'letter') ctx.speakQuiet(tok.replace(/[^\w']/g, ''));
            ctx.changed(picked.size ? [...picked] : null);
          },
        }, tok));
        if (item.mode !== 'letter') add(box, ' ');
      });
      if (item.mode === 'letter') {
        add(el, h('p', { class: 'muted' }, 'Tap the quiet letter.'),
          h('button', { type: 'button', class: 'btn small ghost', onclick: () => ctx.speak(item.word) }, '🔊 Hear the word'));
      }
      add(el, box);
      return () => (picked.size ? [...picked] : null);
    },
    grade(item, value) {
      if (item.mode === 'letter') {
        const ok = value?.[0] === item.answer;
        return { earned: ok ? 1 : 0, possible: 1, reveal: `${item.word} (quiet ${item.word[item.answer]})` };
      }
      const tokens = item.text.split(/\s+/).map((t) => t.replace(/[^\w']/g, '').toLowerCase());
      const want = item.answer.map((a) => a.toLowerCase());
      let earned = 0;
      let wrong = 0;
      for (const i of value || []) { if (want.includes(tokens[i])) earned++; else wrong++; }
      earned = Math.max(0, Math.min(want.length, earned) - wrong);
      return { earned, possible: want.length, reveal: item.answer.join(', ') };
    },
  },
};

function blankAnswers(item) {
  const count = Math.max(1, String(item.text ?? '___').split('___').length - 1);
  if (item.answers) return item.answers;
  return count === 1 ? [item.answer] : asList(item.answer).map((a) => a);
}

function fillText(text, words) {
  let i = 0;
  return text.replace(/___/g, () => words[i++] ?? '');
}

function questionLine(text, ctx, { big = false } = {}) {
  return h('div', { class: `question ${big ? 'big' : ''}` },
    h('button', { type: 'button', class: 'speak-btn', 'aria-label': 'Read aloud', onclick: () => ctx.speak(text.replace(/___/g, 'blank')) }, '🔊'),
    h('span', {}, rich(text)));
}

export function isRunnerType(type) {
  return type in ITEM_TYPES;
}

// Mounts the runner for one activity.
export function runActivity(root, act, env) {
  const type = ITEM_TYPES[act.type];
  const items = type.items(act);
  const isTest = Boolean(act.review);
  const maxTries = isTest ? 1 : 2;
  let rec = env.store.activityProgress(act.id);

  const card = h('div', { class: 'card runner-card' });
  const dots = h('div', { class: 'dots' });
  const feedback = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const checkBtn = h('button', { type: 'button', class: 'btn primary', disabled: true }, 'Check ✓');
  const nextBtn = h('button', { type: 'button', class: 'btn primary hidden' }, 'Next ➜');
  const controls = h('div', { class: 'controls' }, checkBtn, nextBtn);
  add(root, dots, card, feedback, controls);

  let index = Math.min(rec?.index ?? 0, items.length);
  if (rec?.completed) index = items.length;
  let getValue = () => null;

  function answers() {
    return env.store.activityProgress(act.id)?.answers || [];
  }

  function drawDots() {
    clear(dots);
    if (items.length < 2) return;
    const saved = answers();
    items.forEach((_, i) => {
      const a = saved[i];
      add(dots, h('span', {
        class: `dot ${i === index ? 'current' : ''} ${a?.done ? (a.earned >= a.possible ? 'ok' : a.earned > 0 ? 'part' : 'bad') : ''}`,
      }));
    });
  }

  function show() {
    if (index >= items.length) return finish();
    clear(card);
    clear(feedback);
    feedback.className = 'feedback';
    nextBtn.classList.add('hidden');
    checkBtn.classList.remove('hidden');
    checkBtn.disabled = true;
    drawDots();
    const item = items[index];
    const saved = answers()[index];
    if (items.length > 1) add(card, h('div', { class: 'item-count' }, `${index + 1} / ${items.length}`));
    const body = h('div', { class: 'item-body' });
    add(card, body);
    const ctx = {
      speak: env.speak,
      speakQuiet: (t) => env.speak(t, { quiet: true }),
      changed: (v) => { checkBtn.disabled = v == null; },
      submit: () => { if (!checkBtn.disabled) checkBtn.click(); },
    };
    getValue = type.render(body, item, ctx, act, { value: saved?.done ? null : saved?.value });
    checkBtn.disabled = getValue() == null;
    if (saved?.done) showResult(saved, item);
  }

  function showResult(saved, item) {
    const ok = saved.earned >= saved.possible;
    feedback.className = `feedback ${ok ? 'good' : saved.earned > 0 ? 'part' : 'bad'}`;
    clear(feedback);
    add(feedback, h('strong', {}, ok ? `✓ ${saved.praise || 'Correct!'}` : saved.earned > 0 ? `Nearly! ${fmt(saved.earned)} / ${saved.possible}` : '✗ Not quite.'));
    if (!ok) add(feedback, h('div', { class: 'reveal' }, 'Answer: ', h('span', {}, saved.reveal)));
    if (!ok && item?.explain) add(feedback, h('div', { class: 'muted' }, item.explain));
    card.querySelectorAll('button, input').forEach((b) => { if (!b.classList.contains('speak-btn')) b.disabled = true; });
    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = index === items.length - 1 ? 'Finish 🏁' : 'Next ➜';
    nextBtn.focus({ preventScroll: true });
  }

  checkBtn.addEventListener('click', () => {
    const value = getValue();
    if (value == null) return;
    const item = items[index];
    const result = type.grade(item, value, act);
    const prev = answers()[index] || { tries: 0 };
    const tries = prev.tries + 1;
    const ok = result.earned >= result.possible;
    if (!ok && tries < maxTries) {
      env.store.updateActivity(act.id, (r) => { r.answers[index] = { value, tries, done: false }; r.index = index; });
      feedback.className = 'feedback bad';
      clear(feedback);
      add(feedback, h('strong', {}, '✗ Not quite. Try again!'));
      env.speak('Try again!', { quiet: true });
      env.sound('wrong');
      return;
    }
    const saved = { value, tries, done: true, earned: result.earned, possible: result.possible, reveal: result.reveal, praise: ok ? praise() : '' };
    env.store.updateActivity(act.id, (r) => { r.answers[index] = saved; r.index = index + 1; });
    env.sound(ok ? 'right' : 'wrong');
    if (ok) env.speak(saved.praise, { quiet: true });
    drawDots();
    showResult(saved, item);
  });

  nextBtn.addEventListener('click', () => {
    index++;
    show();
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  function finish() {
    const saved = answers();
    const earned = saved.reduce((s, a) => s + (a?.earned || 0), 0);
    const possible = items.reduce((s, item, i) => s + (saved[i]?.possible ?? 0), 0);
    env.complete(act, earned, possible);
    clear(card);
    clear(feedback);
    clear(controls);
    dots.remove();
    add(card, env.resultPanel(act, earned, possible, () => {
      env.store.resetActivity(act.id);
      clear(root);
      runActivity(root, act, env);
    }));
    const review = h('details', { class: 'answers-review' }, h('summary', {}, 'See my answers'));
    items.forEach((item, i) => {
      const a = saved[i];
      if (!a) return;
      const ok = a.earned >= a.possible;
      add(review, h('div', { class: `review-row ${ok ? 'ok' : 'bad'}` },
        h('span', {}, ok ? '✓' : '✗'),
        h('span', {}, describe(item, act) || `${i + 1}.`),
        ok ? null : h('span', { class: 'muted' }, ` → ${a.reveal}`)));
    });
    add(card, review);
  }

  show();
}

function describe(item, act) {
  if (act.type === 'mixed') return describe(item, { ...act, type: item.kind });
  if (act.type === 'choice') return item.q || item.text || '';
  if (act.type === 'gap') return (item.text || '').replace(/___/g, '____');
  if (act.type === 'write') return item.prompt;
  if (act.type === 'order') return item.words.join(' / ');
  if (act.type === 'tap' && item.mode === 'letter') return item.word;
  return act.title;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
