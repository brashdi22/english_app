// Text-to-speech (the app reads words aloud) with the browser's Web Speech
// API, and speech recognition (the app listens to the child) either offline
// on the device (Vosk, the default) or with the browser's online recognizer.

import * as offline from './offline-speech.js';

const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export const canSpeak = 'speechSynthesis' in globalThis;
export const canListen = Boolean(Recognition) || offline.supported;
export const canListenOffline = offline.supported;
export const canListenOnline = Boolean(Recognition);
export const offlineStatus = offline.status;
export const onOfflineStatus = offline.onStatus;

// Which recognizer to use: 'offline' unless the grown-up chose the browser's
// one in Settings, or the device can't run the offline one.
export function engine(settings = {}) {
  if (settings.listenEngine === 'browser' && Recognition) return 'browser';
  if (offline.supported) return 'offline';
  return Recognition ? 'browser' : 'none';
}

let voices = [];
function refreshVoices() {
  voices = canSpeak ? speechSynthesis.getVoices() : [];
}
if (canSpeak) {
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

export function englishVoices() {
  refreshVoices();
  return voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
}

function pickVoice(settings) {
  const list = englishVoices();
  if (settings.voiceName) {
    const chosen = list.find((v) => v.name === settings.voiceName);
    if (chosen) return chosen;
  }
  const accent = settings.accent.toLowerCase().replace('_', '-');
  const sameAccent = list.filter((v) => v.lang.toLowerCase().replace('_', '-') === accent);
  const pool = sameAccent.length ? sameAccent : list;
  // Prefer the higher quality voices most platforms ship.
  return pool.find((v) => /google|samantha|natural|enhanced|premium/i.test(v.name)) || pool[0] || null;
}

// Resolves when the utterance has finished (or failed), so callers can wait
// for the app to stop talking before starting the microphone.
export function speak(text, settings, { slow = false, pitch = 1.05 } = {}) {
  return new Promise((resolve) => {
    if (!canSpeak || !text) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(settings);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || settings.accent;
    u.rate = slow ? Math.max(0.4, settings.rate * 0.6) : settings.rate;
    u.pitch = pitch;
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    u.onend = finish;
    u.onerror = finish;
    // Some browsers never fire onend; don't leave the lesson stuck.
    setTimeout(finish, 1500 + text.length * 180 / u.rate);
    try {
      speechSynthesis.speak(u);
    } catch {
      finish();
    }
  });
}

export function stopSpeaking() {
  if (canSpeak) speechSynthesis.cancel();
}

const ERROR_MESSAGES = {
  'no-speech': "I didn't hear anything. Tap the microphone and say the word.",
  'audio-capture': 'No microphone was found. Please plug one in.',
  'not-allowed': 'The microphone is blocked. Please allow microphone access for this app.',
  'service-not-allowed': 'The microphone is blocked. Please allow microphone access for this app.',
  network: 'Listening needs an internet connection. Please check you are online.',
  aborted: '',
};

let active = null;
let micPrepared = false;

// Asks for microphone permission before the first tap on 🎤, so the
// permission prompt doesn't swallow the child's first try.
export function prepareMicrophone(settings) {
  if (engine(settings) === 'offline') {
    // Start getting the offline recognizer ready while the child looks.
    offline.load().catch(() => {});
    return;
  }
  if (micPrepared || !canListen || !navigator.mediaDevices?.getUserMedia) return;
  micPrepared = true;
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => stream.getTracks().forEach((t) => t.stop()))
    .catch(() => { micPrepared = false; });
}

// Browsers that never say when the microphone is on get this long instead.
const READY_FALLBACK_MS = 1200;

// Listens once and resolves with { alternatives: string[] } or rejects with
// an Error whose `code` is the recognizer error and `message` is kid-friendly.
// `onReady` is called when the microphone is really recording: only then
// should the child be told to speak, or the start of the word is lost.
// Turns the microphone off when the child leaves a speaking exercise.
export function releaseMicrophone() {
  offline.closeMic();
}

// Listens once with the chosen recognizer. `expected` lists the words or
// sentences the child should say; the offline recognizer listens for those.
// `openAnswer`: the child answers in their own words (talk tasks). There are
// no expected words to give the offline recognizer, and the browser's one is
// better at free speech, so it is used whenever the browser has it.
export function listen({ settings = {}, expected = [], mode = 'word', openAnswer = false, ...opts } = {}) {
  if (openAnswer && Recognition) return browserListen({ lang: settings.accent, ...opts });
  if (engine(settings) === 'offline') {
    return offline.listen({ expected, mode, ...opts }).catch((err) => {
      // A device that can't run the offline recognizer falls back once.
      if (err.code === 'engine' && Recognition) return browserListen({ lang: settings.accent, ...opts });
      throw err;
    });
  }
  return browserListen({ lang: settings.accent, ...opts });
}

function browserListen({ lang = 'en-US', timeoutMs = 7000, onReady = () => {} } = {}) {
  return new Promise((resolve, reject) => {
    if (!Recognition) {
      const err = new Error('Listening is not supported in this browser. Try Chrome, Edge or Safari.');
      err.code = 'unsupported';
      return reject(err);
    }
    stopListening();
    stopSpeaking();
    const rec = new Recognition();
    active = rec;
    rec.lang = lang;
    // Early guesses are kept: for one short word, browsers often make a guess
    // and then end without a final result.
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 5;

    let settled = false;
    let ready = false;
    let timer = null;
    const heard = [];
    let finals = 0;
    const markReady = () => {
      if (ready || settled) return;
      ready = true;
      // The time limit starts when the child can actually speak.
      timer = setTimeout(() => rec.stop(), timeoutMs);
      onReady();
    };
    const fallback = setTimeout(markReady, READY_FALLBACK_MS);
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(fallback);
      if (active === rec) active = null;
      fn(value);
    };
    const finish = () => settle(resolve, { alternatives: [...heard] });

    rec.onaudiostart = markReady;
    rec.onresult = (event) => {
      let final = false;
      for (let r = event.resultIndex || 0; r < event.results.length; r++) {
        const result = event.results[r];
        for (let i = 0; i < result.length; i++) {
          const text = result[i].transcript.trim();
          // Final guesses go first: they are the browser's best answer.
          if (text && !heard.includes(text)) {
            if (result.isFinal) heard.splice(finals++, 0, text); else heard.push(text);
          }
        }
        if (result.isFinal) final = true;
      }
      if (final) finish();
    };
    rec.onerror = (event) => {
      if (heard.length && ['no-speech', 'aborted'].includes(event.error)) return finish();
      const err = new Error(ERROR_MESSAGES[event.error] ?? 'Something went wrong while listening. Please try again.');
      err.code = event.error;
      settle(reject, err);
    };
    rec.onend = () => {
      if (heard.length) return finish();
      const err = new Error(ERROR_MESSAGES['no-speech']);
      err.code = 'no-speech';
      settle(reject, err);
    };

    try {
      rec.start();
    } catch (e) {
      const err = new Error('Could not start the microphone. Please try again.');
      err.code = 'start-failed';
      settle(reject, err);
    }
  });
}

export function stopListening() {
  offline.stop();
  if (active) {
    try { active.abort(); } catch { /* already stopped */ }
    active = null;
  }
}
