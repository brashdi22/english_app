import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalize, scorePronunciation, compareReading, answersMatch, starsForResult, starsForScore,
} from '../js/scoring.js';

test('normalize lowercases, strips punctuation and spells small numbers', () => {
  assert.equal(normalize('Hello, Sam!'), 'hello sam');
  assert.equal(normalize("I'm 10"), 'im ten');
  assert.equal(normalize('yo-yo'), 'yo yo');
});

test('pronunciation: exact word gets three stars', () => {
  assert.equal(scorePronunciation('cat', ['cat']).stars, 3);
  assert.equal(scorePronunciation('cat', ['Cat.']).stars, 3);
});

test('pronunciation: word inside a phrase still counts', () => {
  assert.equal(scorePronunciation('dog', ['it is a dog']).stars, 3);
});

test('pronunciation: homophones and digits from the recognizer count', () => {
  assert.equal(scorePronunciation('two', ['2']).stars, 3);
  assert.equal(scorePronunciation('two', ['too']).stars, 3);
  assert.equal(scorePronunciation('eight', ['ate']).stars, 3);
});

test('pronunciation: best of the alternatives is used', () => {
  const r = scorePronunciation('green', ['grin', 'green']);
  assert.equal(r.stars, 3);
  assert.equal(r.heard, 'green');
});

test('pronunciation: close and wrong attempts', () => {
  assert.ok(scorePronunciation('pencil', ['pencils']).stars >= 2);
  assert.equal(scorePronunciation('banana', ['table']).stars, 0);
  assert.equal(scorePronunciation('cat', []).stars, 0);
});

test('pronunciation: extra accepted forms', () => {
  assert.equal(scorePronunciation('I like apples', ['i like apple'], ['i like apple']).stars, 3);
});

test('reading: perfect line has no mistakes', () => {
  const r = compareReading('Hello! I am Sam.', 'hello I am Sam');
  assert.equal(r.mistakes, 0);
  assert.deepEqual(r.matched, [true, true, true, true]);
});

test('reading: missed words are counted', () => {
  const r = compareReading('Max is on my bed.', 'Max is my bed');
  assert.equal(r.mistakes, 1);
  assert.deepEqual(r.matched, [true, true, false, true, true]);
});

test('reading: words split by the recognizer still match', () => {
  const r = compareReading('I am new in Greenhill.', 'I am new in green hill');
  assert.equal(r.mistakes, 0);
});

test('reading: nothing heard means every word is a mistake', () => {
  assert.equal(compareReading('We are happy!', '').mistakes, 3);
});

test('typed answers ignore case, commas and end punctuation', () => {
  assert.ok(answersMatch('i am new', 'I am new.'));
  assert.ok(answersMatch('Yes she does', 'Yes, she does.'));
  assert.ok(answersMatch('  is   ', 'is'));
  assert.ok(answersMatch('Sam’s mum', "Sam's mum"));
  assert.ok(answersMatch('b', ['a', 'b']));
  assert.ok(!answersMatch('are', 'is'));
});

test('strict typed answers check capital letters', () => {
  assert.ok(!answersMatch('i am happy.', 'I am happy.', { strict: true }));
  assert.ok(answersMatch('I am happy', 'I am happy.', { strict: true }));
});

test('stars follow the book bands', () => {
  assert.equal(starsForResult(10, 12), 3);
  assert.equal(starsForResult(8, 12), 2);
  assert.equal(starsForResult(7, 12), 1);
  assert.equal(starsForResult(24, 30), 3);
  assert.equal(starsForResult(18, 30), 2);
  assert.equal(starsForResult(0, 0), 0);
  assert.equal(starsForScore(1), 3);
  assert.equal(starsForScore(0.4), 0);
});
