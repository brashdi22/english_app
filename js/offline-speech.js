// Offline speech recognition with Vosk (vosk-browser), running on the device.
//
// The browser's own recognizer is made for adults speaking freely. Here the
// recognizer is told which words to expect (a "grammar"), so a child's word
// that is close to the target is recognized as that word, while other words
// from the same exercise and "[unk]" (unknown) are there to catch real
// mistakes. Each recognized word comes with a confidence (0–1).

const LIBRARY_URL = 'vendor/vosk-browser/vosk.js';
export const MODEL_URL = 'models/vosk-model-small-en-us-0.15.tar.gz';
export const MODEL_SIZE_MB = 40;
const READY_FLAG = 'englishApp.offlineModelReady';

// Words in the book that the model doesn't know, and a word it does know
// that sounds the same. Found with tools/check-vocabulary.py.
export const SPOKEN_FORMS = {
  grans: 'gran',
  linas: 'lina',
  zaks: 'zak',
};

export const supported = typeof WebAssembly === 'object'
  && typeof Worker === 'function'
  && Boolean(globalThis.navigator?.mediaDevices?.getUserMedia)
  && Boolean(globalThis.AudioContext || globalThis.webkitAudioContext);

let state = 'idle'; // idle | loading | ready | failed
let loading = null;
let model = null;
const listeners = new Set();
let progress = { loaded: 0, total: MODEL_SIZE_MB * 1024 * 1024 };

export function status() {
  return { state, ...progress, cached: hasRunBefore() };
}

export function onStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(status()));
}

function hasRunBefore() {
  try { return localStorage.getItem(READY_FLAG) === '1'; } catch { return false; }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (globalThis.Vosk) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(s);
  });
}

// Downloads the model with progress. The library then fetches the same URL
// itself (normally from the browser's cache) and keeps the unpacked model in
// IndexedDB, so this only happens once per device.
async function prefetchModel(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Model download failed (${res.status})`);
  const total = Number(res.headers.get('Content-Length')) || progress.total;
  progress = { loaded: 0, total };
  if (!res.body?.getReader) {
    await res.arrayBuffer();
    return;
  }
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    progress = { loaded: progress.loaded + value.length, total };
    emit();
  }
}

// Starts loading (once). Resolves when the model is ready to listen.
export function load() {
  if (!supported) return Promise.reject(new Error('Offline listening is not supported on this device.'));
  if (loading) return loading;
  state = 'loading';
  emit();
  const url = new URL(MODEL_URL, location.href).href;
  loading = (async () => {
    await loadScript(LIBRARY_URL);
    if (!hasRunBefore()) await prefetchModel(url);
    model = await globalThis.Vosk.createModel(url, -1);
    try { localStorage.setItem(READY_FLAG, '1'); } catch { /* optional */ }
    state = 'ready';
    progress = { loaded: progress.total, total: progress.total };
    emit();
    return model;
  })().catch((err) => {
    state = 'failed';
    loading = null;
    emit();
    throw err;
  });
  return loading;
}

// ------------------------------------------------------------ microphone
let mic = null;

async function openMic() {
  if (mic) {
    if (mic.context.state === 'suspended') await mic.context.resume();
    return mic;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
  const context = new Ctx();
  if (context.state === 'suspended') await context.resume();
  const source = context.createMediaStreamSource(stream);
  const node = context.createScriptProcessor(4096, 1, 1);
  mic = { stream, context, source, node, sink: null };
  node.onaudioprocess = (event) => {
    if (mic.sink) mic.sink(event.inputBuffer);
  };
  source.connect(node);
  node.connect(context.destination);
  return mic;
}

// Turns the microphone off (when leaving a speaking exercise).
export function closeMic() {
  if (!mic) return;
  const m = mic;
  mic = null;
  m.sink = null;
  try { m.source.disconnect(); m.node.disconnect(); } catch { /* already */ }
  m.stream.getTracks().forEach((t) => t.stop());
  m.context.close().catch(() => {});
}

// --------------------------------------------------------------- grammar
function spoken(word) {
  const w = word.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, ' ').trim();
  return SPOKEN_FORMS[w.replace(/[ ']/g, '')] || w;
}

// Phrases the recognizer may hear: the expected phrases, every single word
// in them, and "[unk]" for anything else.
export function buildGrammar(expected) {
  const out = new Set();
  for (const phrase of expected) {
    const words = String(phrase).split(/\s+/).map(spoken).filter(Boolean);
    if (!words.length) continue;
    out.add(words.join(' '));
    words.forEach((w) => out.add(w));
  }
  out.add('[unk]');
  return [...out];
}

// Puts back words that were swapped for a spoken form ("green hill" →
// "greenhill"), so the result can be compared with the book's text.
export function restoreWords(text, expected) {
  let out = ` ${text} `;
  for (const word of expected.flatMap((p) => String(p).split(/\s+/))) {
    const clean = word.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z']/g, '');
    const form = spoken(word);
    // Only split words need putting back; "gran" for "gran's" scores as close.
    if (clean && form.includes(' ') && form !== clean) out = out.replaceAll(` ${form} `, ` ${clean} `);
  }
  return out.trim();
}

// ---------------------------------------------------------------- listen
let current = null;

export function stop() {
  if (current) current.cancel();
}

// Listens once. Resolves with { alternatives: [text], confidence } where
// confidence is the lowest word confidence, or rejects with err.code
// 'no-speech' / 'unclear' / 'not-allowed' / 'audio-capture'.
// In 'word' mode it stops at the first pause after speech; in 'sentence'
// mode it waits for a longer pause so a child can read a whole line.
export function listen({ expected = [], mode = 'word', timeoutMs = 7000, onReady = () => {} } = {}) {
  return (async () => {
    let m;
    try {
      m = await load();
    } catch (e) {
      const err = new Error('The offline listening helper could not start on this device.');
      err.code = 'engine';
      err.detail = e?.message;
      throw err;
    }
    let audio;
    try {
      audio = await openMic();
    } catch (e) {
      const err = new Error(e?.name === 'NotFoundError'
        ? 'No microphone was found. Please plug one in.'
        : 'The microphone is blocked. Please allow microphone access for this app.');
      err.code = e?.name === 'NotFoundError' ? 'audio-capture' : 'not-allowed';
      throw err;
    }
    stop();

    return new Promise((resolve, reject) => {
      const grammar = expected.length ? JSON.stringify(buildGrammar(expected)) : undefined;
      const rec = new m.KaldiRecognizer(audio.context.sampleRate, grammar);
      rec.setWords(true);
      const parts = [];
      let heardSomething = false;
      let pauseTimer = null;
      let settled = false;
      const pauseMs = mode === 'sentence' ? 1600 : 0;

      const done = (fn, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(limit);
        clearTimeout(pauseTimer);
        audio.sink = null;
        current = null;
        setTimeout(() => { try { rec.remove(); } catch { /* gone */ } }, 0);
        fn(value);
      };
      const finish = () => {
        const words = parts.flat().filter((w) => w.word !== '[unk]');
        const text = restoreWords(words.map((w) => w.word).join(' '), expected);
        if (text) {
          const confidence = Math.min(...words.map((w) => w.conf ?? 1));
          return done(resolve, { alternatives: [text], confidence, words });
        }
        const err = new Error(heardSomething
          ? "I couldn't understand that. Listen and try again."
          : "I didn't hear anything. Tap the microphone and say the word.");
        err.code = heardSomething ? 'unclear' : 'no-speech';
        done(reject, err);
      };

      rec.on('partialresult', (msg) => {
        if (msg.result?.partial) {
          heardSomething = true;
          if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = setTimeout(finish, pauseMs); }
        }
      });
      rec.on('result', (msg) => {
        const words = msg.result?.result || [];
        if (!words.length && !msg.result?.text) return;
        heardSomething = true;
        parts.push(words.length ? words : msg.result.text.split(' ').map((word) => ({ word, conf: 1 })));
        if (mode === 'word') finish();
        else {
          clearTimeout(pauseTimer);
          pauseTimer = setTimeout(finish, pauseMs);
        }
      });
      rec.on('error', (msg) => {
        const err = new Error('Something went wrong while listening. Please try again.');
        err.code = 'engine';
        err.detail = msg.error;
        done(reject, err);
      });

      const limit = setTimeout(() => {
        // Out of time: use whatever was said so far.
        rec.retrieveFinalResult();
        setTimeout(finish, 400);
      }, timeoutMs);

      current = {
        cancel: () => {
          const err = new Error('');
          err.code = 'aborted';
          done(reject, err);
        },
      };
      audio.sink = (buffer) => {
        try { rec.acceptWaveform(buffer); } catch { /* recognizer removed */ }
      };
      onReady();
    });
  })();
}
