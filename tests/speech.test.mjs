// listen() with a fake browser recognizer: checks the fixes for "I have to say
// the word twice" (tell the child to speak only when the mic is on, and keep
// early guesses when the browser gives no final result).
import test from 'node:test';
import assert from 'node:assert/strict';

let current;
class FakeRecognition {
  constructor() { current = this; }
  start() { this.started = true; }
  stop() { setTimeout(() => this.onend?.(), 0); }
  abort() { setTimeout(() => this.onerror?.({ error: 'aborted' }), 0); }
}
globalThis.SpeechRecognition = FakeRecognition;
const { listen } = await import('../js/speech.js');

const result = (texts, isFinal) => Object.assign(texts.map((transcript) => ({ transcript })), { isFinal });
const event = (results, resultIndex = 0) => ({ results, resultIndex });
const tick = () => new Promise((r) => setTimeout(r, 0));

test('the child is told to speak only when the microphone is recording', async () => {
  let ready = false;
  const p = listen({ onReady: () => { ready = true; } });
  await tick();
  assert.equal(ready, false, 'not ready straight after the tap');
  current.onaudiostart();
  assert.equal(ready, true);
  current.onresult(event([result(['cat'], true)]));
  assert.deepEqual((await p).alternatives, ['cat']);
});

test('an early guess is kept when the browser ends without a final result', async () => {
  const p = listen();
  current.onaudiostart();
  current.onresult(event([result(['dog'], false)]));
  current.onend();
  assert.deepEqual((await p).alternatives, ['dog']);
});

test('an early guess is kept when the browser reports no speech', async () => {
  const p = listen();
  current.onresult(event([result(['sun'], false)]));
  current.onerror({ error: 'no-speech' });
  assert.deepEqual((await p).alternatives, ['sun']);
});

test('final guesses come before early ones', async () => {
  const p = listen();
  current.onresult(event([result(['hat'], false)]));
  current.onresult(event([result(['cat', 'cap'], true)]));
  assert.deepEqual((await p).alternatives, ['cat', 'cap', 'hat']);
});

test('silence is still reported as "didn\'t hear anything"', async () => {
  const p = listen();
  current.onend();
  await assert.rejects(p, (err) => err.code === 'no-speech');
});

test('the time limit starts when the microphone is ready, not at the tap', async () => {
  const p = listen({ timeoutMs: 30 });
  const outcome = p.catch((err) => err);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(current.stopped, undefined);
  let stopped = false;
  current.stop = () => { stopped = true; setTimeout(() => current.onend(), 0); };
  current.onaudiostart();
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(stopped, true);
  assert.equal((await outcome).code, 'no-speech');
});

test('open talk answers use the browser recognizer even when offline listening is chosen', async () => {
  current = null;
  const p = listen({ settings: { listenEngine: 'offline' }, openAnswer: true });
  await tick();
  assert.ok(current?.started, "the browser's recognizer was started");
  current.onresult(event([result(['my name is ali'], true)]));
  assert.deepEqual((await p).alternatives, ['my name is ali']);
});
