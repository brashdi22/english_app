// Text-to-speech (the app reads words aloud) and speech recognition
// (the app listens to the child) using the browser's Web Speech API.

const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export const canSpeak = 'speechSynthesis' in globalThis;
export const canListen = Boolean(Recognition);

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

// Listens once and resolves with { alternatives: string[] } or rejects with
// an Error whose `code` is the recognizer error and `message` is kid-friendly.
export function listen({ lang = 'en-US', timeoutMs = 7000 } = {}) {
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
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 5;

    let settled = false;
    const timer = setTimeout(() => rec.stop(), timeoutMs);
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (active === rec) active = null;
      fn(value);
    };

    rec.onresult = (event) => {
      const result = event.results[0];
      const alternatives = [];
      for (let i = 0; i < result.length; i++) alternatives.push(result[i].transcript);
      settle(resolve, { alternatives });
    };
    rec.onerror = (event) => {
      const err = new Error(ERROR_MESSAGES[event.error] ?? 'Something went wrong while listening. Please try again.');
      err.code = event.error;
      settle(reject, err);
    };
    rec.onend = () => {
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
  if (active) {
    try { active.abort(); } catch { /* already stopped */ }
    active = null;
  }
}
