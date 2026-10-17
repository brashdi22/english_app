// Pure helpers for comparing what the child said with the target word.
// Kept free of browser APIs so they can be unit-tested with Node.

const NUMBER_WORDS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven',
  12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen',
  17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
};

// Speech recognizers often return a homophone or a digit instead of the word.
const HOMOPHONES = {
  two: ['to', 'too'],
  four: ['for', 'fore'],
  eight: ['ate'],
  one: ['won'],
  red: ['read'],
  blue: ['blew'],
  pear: ['pair', 'pare'],
  bee: ['be', 'b'],
  sea: ['see', 'c'],
  eye: ['i', 'aye'],
  tea: ['tee', 't'],
  ant: ['aunt'],
  night: ['knight'],
  sun: ['son'],
  flower: ['flour'],
};

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => NUMBER_WORDS[w] ?? w)
    .join(' ');
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

export function similarity(a, b) {
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - levenshtein(a, b) / max;
}

// A small, forgiving sound key: drops vowels after the first letter and
// merges letters that sound alike, so "kat" and "cat" compare equal.
export function soundKey(word) {
  const w = word
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/z/g, 's')
    .replace(/[wh](?=[^aeiou]|$)/g, '');
  if (!w) return '';
  const rest = w.slice(1).replace(/[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
  const first = /[aeiouy]/.test(w[0]) ? 'a' : w[0];
  return first + rest;
}

function acceptedForms(target, extra = []) {
  const forms = new Set([normalize(target), ...extra.map(normalize)]);
  for (const form of [...forms]) {
    for (const h of HOMOPHONES[form] || []) forms.add(h);
  }
  return [...forms].filter(Boolean);
}

function scorePhrase(heard, form) {
  if (heard === form) return 1;
  const heardWords = heard.split(' ');
  const formWords = form.split(' ');
  // Child said the word inside a longer phrase ("it is a cat").
  if (formWords.length === 1 && heardWords.includes(form)) return 1;
  if (formWords.length > 1 && ` ${heard} `.includes(` ${form} `)) return 1;

  let best = similarity(heard, form);
  if (formWords.length === 1) {
    for (const w of heardWords) {
      let s = similarity(w, form);
      if (s < 0.85 && soundKey(w) === soundKey(form)) s = 0.85;
      best = Math.max(best, s);
    }
  }
  return best;
}

// alternatives: list of transcripts from the recognizer (best guess first).
// Returns { score: 0..1, stars: 0..3, heard: string }.
export function scorePronunciation(target, alternatives, extraAccepted = []) {
  const forms = acceptedForms(target, extraAccepted);
  let best = { score: 0, heard: '' };
  for (const alt of alternatives || []) {
    const heard = normalize(alt);
    if (!heard) continue;
    for (const form of forms) {
      const score = scorePhrase(heard, form);
      if (score > best.score) best = { score, heard: alt };
    }
  }
  if (!best.heard && alternatives?.length) best.heard = alternatives[0];
  return { ...best, stars: starsForScore(best.score) };
}

export function starsForScore(score) {
  if (score >= 0.99) return 3;
  if (score >= 0.75) return 2;
  if (score >= 0.5) return 1;
  return 0;
}

// Stars for a score, using the book's bands: 80% or more ★★★, 60–79% ★★,
// under 60% ★.
export function starsForResult(earned, possible) {
  if (!possible) return 0;
  const ratio = earned / possible;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

function tidy(text) {
  return String(text || '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Typed answers. Lenient by default: case, spacing and end punctuation are
// ignored. With `strict`, capital letters must match too (used where the book
// checks big letters, e.g. "i am happy" → "I am happy.").
export function answersMatch(given, expected, { strict = false } = {}) {
  const list = Array.isArray(expected) ? expected : [expected];
  // Commas and end punctuation don't change the answer.
  const loose = (t) => tidy(t).replace(/[.!?]+$/, '').replace(/,/g, ' ').replace(/\s*([?!.])\s*/g, '$1 ').replace(/\s+/g, ' ').trim();
  return list.some((e) => {
    if (strict) return loose(given) === loose(e);
    return loose(given).toLowerCase() === loose(e).toLowerCase();
  });
}

// Compares a line the child read aloud with the text. Returns one flag per
// word of the text (true = read correctly) and the number of mistakes.
export function compareReading(text, heard) {
  const target = normalize(text).split(' ').filter(Boolean);
  const said = normalize(heard).split(' ').filter(Boolean);
  // Recognizers sometimes split one word in two ("green hill").
  const saidJoined = said.map((w, i) => (i + 1 < said.length ? w + said[i + 1] : null));
  const close = (a, b) => a === b || (b && (similarity(a, b) >= 0.75 || (a.length > 2 && soundKey(a) === soundKey(b))));

  // Longest common subsequence with fuzzy word matching.
  const n = target.length;
  const m = said.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = close(target[i], said[j]) || close(target[i], saidJoined[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const matched = new Array(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (close(target[i], said[j]) || close(target[i], saidJoined[j])) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return { words: target, matched, mistakes: matched.filter((x) => !x).length };
}
