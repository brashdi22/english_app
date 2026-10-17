// Checks the whole book: ids, pictures, answer keys and the points of every
// review, so a typo in a content file is caught before a child sees it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { BOOK } from '../js/content/index.js';
import { ITEM_TYPES } from '../js/runner.js';
import { SCREEN_TYPES } from '../js/screen-types.js';
import { activityPoints } from '../js/points.js';
import { LETTERS } from '../js/ui.js';

const root = new URL('..', import.meta.url).pathname;
const all = BOOK.units.flatMap((u) => u.sections.flatMap((s) => s.activities.map((a) => ({ unit: u, a }))));
const asList = (v) => (Array.isArray(v) ? v : [v]);

function images(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => images(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'img' && typeof v === 'string') out.add(v);
      else images(v, out);
    }
  }
  return out;
}

test('every unit and activity has a unique id', () => {
  const ids = new Set();
  for (const u of BOOK.units) {
    assert.ok(!ids.has(u.id), `duplicate unit id ${u.id}`);
    ids.add(u.id);
  }
  for (const { a } of all) {
    assert.ok(a.id, `activity without id: ${a.title}`);
    assert.ok(!ids.has(a.id), `duplicate id ${a.id}`);
    ids.add(a.id);
  }
});

test('every activity type is known', () => {
  for (const { a } of all) {
    assert.ok(a.type in ITEM_TYPES || SCREEN_TYPES.includes(a.type), `${a.id}: unknown type ${a.type}`);
  }
});

test('every picture exists', () => {
  const names = images(BOOK.units);
  BOOK.units.forEach((u) => names.add(u.icon));
  for (const name of names) {
    assert.ok(existsSync(`${root}assets/img/${name}.webp`), `missing picture ${name}`);
  }
});

// The answer the answer key gives, in the form each item type expects.
function correctValue(a, item) {
  switch (a.type === 'mixed' ? item.kind : a.type) {
    case 'choice': {
      const options = (a.tf || item.tf) ? ['True', 'False'] : item.options;
      if (a.tf || item.tf) return item.answer ? 0 : 1;
      if (typeof item.answer === 'number') return item.answer;
      const i = options.findIndex((o) => (typeof o === 'string' ? o : o.label) === item.answer);
      assert.ok(i >= 0, `${a.id}: answer "${item.answer}" is not an option`);
      return i;
    }
    case 'gap': {
      const blanks = String(item.text ?? '___').split('___').length - 1;
      const answers = item.answers || (blanks === 1 ? [item.answer] : asList(item.answer));
      assert.equal(answers.length, blanks, `${a.id}: ${blanks} blanks but ${answers.length} answers in "${item.text}"`);
      const values = answers.map((x) => asList(x)[0]);
      const bank = item.bank || a.bank;
      if (bank) values.forEach((v) => assert.ok(bank.includes(v), `${a.id}: "${v}" is not in the word bank`));
      return values;
    }
    case 'write': return asList(item.answer)[0];
    case 'order': {
      const used = new Set();
      const words = item.answer.replace(/[.!?]$/, '').split(' ');
      return words.map((w) => {
        const i = item.words.findIndex((x, k) => !used.has(k) && x === w);
        assert.ok(i >= 0, `${a.id}: "${w}" is not one of the tiles`);
        used.add(i);
        return i;
      });
    }
    case 'match':
      assert.equal(item.answer.length, item.left.length, `${a.id}: answer length`);
      return [...item.answer].map((c) => {
        const i = LETTERS.indexOf(c);
        assert.ok(i >= 0 && i < item.right.length, `${a.id}: letter ${c} has no picture/word`);
        return i;
      });
    case 'sequence': {
      const sorted = [...item.order].sort((x, y) => x - y);
      assert.deepEqual(sorted, item.events.map((_, i) => i + 1), `${a.id}: order must use 1..n once`);
      return item.events.map((_, i) => i).sort((x, y) => item.order[x] - item.order[y]);
    }
    case 'sort': {
      const placed = {};
      item.bins.forEach((b, bi) => b.words.forEach((w) => { placed[w] = bi; }));
      if (item.words) assert.deepEqual([...item.words].sort(), Object.keys(placed).sort(), `${a.id}: shown words`);
      return placed;
    }
    case 'multi': return item.answer;
    case 'tap': {
      if (item.mode === 'letter') {
        assert.ok(item.answer < item.word.length, `${a.id}: letter index`);
        return [item.answer];
      }
      const tokens = item.text.split(/\s+/).map((t) => t.replace(/[^\w']/g, '').toLowerCase());
      return item.answer.map((w) => {
        const i = tokens.indexOf(w.toLowerCase());
        assert.ok(i >= 0, `${a.id}: "${w}" is not in the sentence`);
        return i;
      });
    }
    default: throw new Error(`no answer for ${a.type}`);
  }
}

test('answer-key answers get full marks and match the points', () => {
  for (const { a } of all) {
    const type = ITEM_TYPES[a.type];
    if (!type) continue;
    let earned = 0;
    let possible = 0;
    for (const item of type.items(a)) {
      const r = type.grade(item, correctValue(a, item), a);
      assert.equal(r.earned, r.possible, `${a.id}: the answer key answer is marked wrong (${JSON.stringify(item).slice(0, 120)})`);
      earned += r.earned;
      possible += r.possible;
    }
    assert.equal(possible, activityPoints(a), `${a.id}: points ${possible} vs listed ${activityPoints(a)}`);
    assert.equal(earned, possible);
  }
});

test('wrong answers are marked wrong', () => {
  const ch1 = all.find(({ a }) => a.id === 'ch1-16').a;
  const r = ITEM_TYPES.gap.grade(ch1.items[0], ['am'], ch1);
  assert.equal(r.earned, 0);
});

test('review totals match the book', () => {
  const expected = {
    begin: 69, starter: 10, ch1: 12, ch2: 12, ch3: 12, cp1: 30, ch4: 12, ch5: 12, ch6: 12,
    cp2: 30, ch7: 12, ch8: 12, ch9: 12, cp3: 30, ch10: 12, final: 85,
  };
  for (const [id, total] of Object.entries(expected)) {
    const unit = BOOK.units.find((u) => u.id === id);
    const sum = unit.sections.flatMap((s) => s.activities).filter((a) => a.review).reduce((s, a) => s + activityPoints(a), 0);
    assert.equal(sum, total, `${id}: review points ${sum}, book says ${total}`);
  }
});

test('final assessment parts match the book', () => {
  const final = BOOK.units.find((u) => u.id === 'final');
  const parts = final.sections.map((s) => s.activities.filter((a) => a.review).reduce((t, a) => t + activityPoints(a), 0));
  assert.deepEqual(parts, [15, 25, 20, 15, 10]);
});

test('every chapter has the book structure', () => {
  for (const u of BOOK.units.filter((x) => x.kind === 'chapter')) {
    const types = u.sections.flatMap((s) => s.activities.map((a) => a.type));
    for (const t of ['words', 'speak', 'story', 'info', 'open', 'check']) {
      assert.ok(types.includes(t), `${u.id} has no ${t} activity`);
    }
    assert.ok(u.sections.flatMap((s) => s.activities).filter((a) => a.type === 'story' && a.record).length === 1, `${u.id}: one story with a reading record`);
  }
});

test('stories in the reading record have word counts like the book', () => {
  const stories = all.filter(({ a }) => a.type === 'story' && a.record).map(({ a }) => [a.storyTitle, a.words]);
  assert.deepEqual(stories, [
    ['Max!', 34], ['Hello, Greenhill!', 51], ['My Family', 110], ['My First Day', 115], ['Lost and Found', 139],
    ['The Map Club', 142], ['Our Map of Greenhill', 157], ['My Busy Week', 158], ['Market Day', 162],
    ['The Clue in the Library', 191], ["Sam's Diary", 206],
  ]);
});
