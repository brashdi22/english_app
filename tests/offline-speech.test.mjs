// The offline recognizer with a fake Vosk model and microphone.
import test from 'node:test';
import assert from 'node:assert/strict';

// --- fake browser pieces -------------------------------------------------
const store = { 'englishApp.offlineModelReady': '1' }; // model already on the device
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
globalThis.location = { href: 'https://example.org/app/' };
globalThis.Worker = class {};
let micAllowed = true;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  mediaDevices: {
    getUserMedia: async () => {
      if (!micAllowed) throw Object.assign(new Error('denied'), { name: 'NotAllowedError' });
      return { getTracks: () => [{ stop() {} }] };
    },
  },
} });
let processor;
globalThis.AudioContext = class {
  constructor() { this.state = 'running'; this.sampleRate = 48000; this.destination = {}; }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
  createScriptProcessor() { processor = { connect() {}, disconnect() {} }; return processor; }
};

let recognizer;
let modelUrl;
class FakeRecognizer {
  constructor(rate, grammar) {
    this.rate = rate;
    this.grammar = grammar ? JSON.parse(grammar) : null;
    this.handlers = {};
    this.audio = 0;
    recognizer = this;
  }
  on(event, fn) { this.handlers[event] = fn; }
  setWords() {}
  acceptWaveform() { this.audio++; }
  retrieveFinalResult() { this.handlers.result?.({ result: { text: '', result: [] } }); }
  remove() { this.removed = true; }
  emit(event, result) { this.handlers[event]?.({ result }); }
}
globalThis.Vosk = { createModel: async (url) => { modelUrl = url; return { KaldiRecognizer: FakeRecognizer }; } };

const offline = await import('../js/offline-speech.js');
const said = (words) => ({ text: words.map((w) => w[0]).join(' '), result: words.map(([word, conf]) => ({ word, conf })) });
const speak = (event, result) => { processor.onaudioprocess({ inputBuffer: {} }); recognizer.emit(event, result); };

test('the recognizer listens for the expected words, each word, and [unk]', () => {
  assert.deepEqual(offline.buildGrammar(['hello', 'Hello! I am Sam.']), ['hello', 'hello i am sam', 'i', 'am', 'sam', '[unk]']);
});

test('words the model does not know are swapped for ones that sound the same', () => {
  assert.deepEqual(offline.buildGrammar(["Gran's house"]), ['gran house', 'gran', 'house', '[unk]']);
});

test('the model is loaded from the app\'s own site', async () => {
  await offline.load();
  assert.equal(modelUrl, 'https://example.org/app/models/vosk-model-small-en-us-0.15.tar.gz');
  assert.equal(offline.status().state, 'ready');
});

test('a recognized word comes back with its confidence', async () => {
  let ready = false;
  const p = offline.listen({ expected: ['cat', 'dog'], onReady: () => { ready = true; } });
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(ready, 'told to speak once the mic is on');
  assert.deepEqual(recognizer.grammar, ['cat', 'dog', '[unk]']);
  speak('result', said([['cat', 0.93]]));
  const r = await p;
  assert.deepEqual(r.alternatives, ['cat']);
  assert.equal(r.confidence, 0.93);
  assert.ok(recognizer.audio > 0, 'microphone audio reaches the recognizer');
});

test('an unknown word is reported as "couldn\'t understand"', async () => {
  const p = offline.listen({ expected: ['cat'] });
  await new Promise((r) => setTimeout(r, 0));
  speak('result', said([['[unk]', 1]]));
  await assert.rejects(p, (err) => err.code === 'unclear');
});

test('silence is reported as "didn\'t hear anything"', async () => {
  const p = offline.listen({ expected: ['cat'], timeoutMs: 20 });
  await assert.rejects(p, (err) => err.code === 'no-speech');
});

test('sentence mode waits for the whole line across short pauses', async () => {
  const p = offline.listen({ expected: ['Hello! I am Sam.'], mode: 'sentence' });
  await new Promise((r) => setTimeout(r, 0));
  speak('result', said([['hello', 1]]));
  await new Promise((r) => setTimeout(r, 300));
  speak('result', said([['i', 1], ['am', 0.9], ['sam', 1]]));
  const r = await p;
  assert.deepEqual(r.alternatives, ['hello i am sam']);
  assert.equal(r.confidence, 0.9);
});

test('a blocked microphone gives a clear message', async () => {
  offline.closeMic();
  micAllowed = false;
  await assert.rejects(offline.listen({ expected: ['cat'] }), (err) => err.code === 'not-allowed');
  micAllowed = true;
});
