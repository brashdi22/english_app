# English Adventures in Greenhill — interactive edition

An interactive app made from the book *English Adventures in Greenhill*, a
12-week English reading and writing course for beginners aged 10. Every unit
of the book is in the app: Let's Begin, the Starter Unit, Chapters 1–10, the
three Checkpoints, the Final Assessment, the Grammar Summary, the Word Bank
and the Certificate. The pictures come from the book.

## What the child can do

- **New Words**: picture cards with the meaning and example sentence. Tap a
  card and the app reads the word and the example aloud.
- **Pronunciation**: the app says each word (🔊, or 🐢 for slower), then the
  child taps 🎤 and says it. The button turns orange ("Wait…") while the
  microphone switches on, then green ("Speak now!"). The app listens, gives
  0–3 stars and shows what it heard. In practice, one star counts as said;
  in tests (Let's Begin, Starter Review) two stars are needed. This is used for the New Words, the Sound Spots, tricky
  words, the alphabet and the short vowel lines.
- **Stories**: *Listen* reads the story aloud and highlights each line.
  *I read it aloud* listens while the child reads each line, colours missed
  words red, and saves a **reading record** (time and mistakes), like the
  record in the book.
- **Dialogues**: listen, then role-play. The app reads the other person's
  lines and listens to the child's lines.
- **Exercises** from the book, with the answers from the Answer Key: choosing
  words, filling gaps (word box or typing), matching pictures, true/false,
  putting words or events in order, sorting words into groups, circling words,
  rewriting sentences and short answers.
- **Writing** tasks with the book's sentence frames. *Hear my writing* reads
  the child's text aloud, and there is an example answer to look at.
- **Progress Check** (Yes! / Almost / Not yet) at the end of each chapter.

## Scores and auto-save

- Every answer is **saved automatically** on the device a moment after it is
  given. Unsaved changes are also written straight away when the app is
  hidden or closed. The top bar shows **✓ Saved**.
- If the child leaves in the middle of an exercise, it carries on from the
  same question next time. The home page has a **Continue** button.
- Practice exercises give two tries. Reviews, Checkpoints and the Final
  Assessment count the first try only, like a test.
- Scores and stars follow the book: Chapter Reviews are out of 12,
  Checkpoints out of 30, the Final Assessment out of 85 (Parts A–E), and the
  Starter Review out of 10.
- **📊 My Progress** shows the Progress Tracker, the reading records and the
  "Not yet" items from the Progress Checks.
- **🏆 Scoreboard** compares the children of the family: stars (all time and
  this week), activities done, units finished, review scores, reading speed
  and words said.

## Children, the parent area and family accounts

- **Children log in** by tapping their picture and typing their 4-digit PIN.
  The 🚪 button in the top bar logs them out.
- **👪 Parent area** (needs the parent password): add children and set their
  PINs, see each child's Progress Tracker, reading records and "Not yet"
  items, reset or remove a child, download a backup, and change the parent
  password. The parent password starts as **`adminpass`**: please change it
  in the parent area. It is stored only as a hash.
- **Grown-up scoring**: some tasks are scored by an adult in the book (letter
  sounds, writing, talking). Tap **🔒 Grown-up** and enter the parent
  password to give those points. The "For the adult" notes from the book are
  shown in purple boxes.
- Because the app is a website, the password check runs on the device: it
  keeps children out, but it is not strong security.

### Family accounts (several devices)

Without any setup, children, PINs and progress are saved **on one device**.
To let the children use **several devices** and to see their progress from
your own phone, connect the app to a free Firebase project (about 15
minutes, once):

1. Go to [console.firebase.google.com](https://console.firebase.google.com),
   **Create a project** (any name, e.g. `greenhill-english`; Google Analytics
   is not needed). The free *Spark* plan is enough.
2. **Build → Authentication → Get started → Sign-in method → Email/Password →
   Enable → Save.**
3. **Build → Firestore Database → Create database**, choose a location near
   you, start in **production mode**.
4. In Firestore, open the **Rules** tab, replace the rules with the contents
   of [`firestore.rules`](firestore.rules) and **Publish**. (These rules let
   each family read and write only its own data.)
5. **Project settings (⚙️) → General → Your apps → Web (`</>`)**: register an
   app (no hosting needed) and copy the values of `firebaseConfig`.
6. Paste them into [`js/cloud-config.js`](js/cloud-config.js)
   (`apiKey`, `authDomain`, `projectId`, `appId`). These values are not
   secret.
7. **Authentication → Settings → Authorized domains → Add domain**: add your
   GitHub Pages address (e.g. `yourname.github.io`).

Then open the app, choose **New family account**, and create it with your
email and a password. You are taken to the parent area to add the children.
On every other device the children use, sign in once with the same email and
password. Progress is saved on the device straight away (so it also works
offline) and shared with the family's other devices when online. Learners
saved on a device before the family account was made can be added from the
parent area.

## Running the app

The app is a static website with no build step. It reads aloud with the
browser's text-to-speech. To listen to the child it uses, by default, an
**offline recognizer that runs on the device** ([Vosk](https://alphacephei.com/vosk/),
small English model, in `models/`). The app tells it which words the child
should say, so a child's word that is close to the target is recognized as
that word, and other words come back as "couldn't understand". It downloads
about 40 MB the first time a speaking exercise opens, then works offline.
**⚙️ Settings → Listening** can switch to the browser's own recognizer
instead (needs internet).

| | Reads aloud | Offline listening | Browser listening |
|---|---|---|---|
| Chrome / Edge (desktop, Android) | ✅ | ✅ | ✅ (needs internet) |
| Safari (Mac, iPhone, iPad) | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ❌ |

The microphone only works on `https://` or `localhost`, so serve the folder
instead of opening `index.html` as a file:

```sh
python3 -m http.server 8000     # then open http://localhost:8000
```

To put it online for free, turn on **GitHub Pages** for this repository
(Settings → Pages → deploy from the branch, folder `/`). Once it has been opened,
the app works offline and can be installed on a tablet or phone ("Add to Home
Screen").

## For developers

```
index.html, css/styles.css
js/app.js          screens, navigation, settings
js/family.js       logins, parent password, syncing between devices
js/family-pages.js sign-in, PIN pad, parent area, scoreboard
js/cloud.js        Firebase (family accounts) — settings in js/cloud-config.js
js/progress.js     scores and summaries for the tracker and scoreboard
js/accounts.js     password and PIN hashing
js/runner.js       question-card exercises (checking, retries, scoring)
js/screens.js      words, stories, dialogues, pronunciation, writing, grown-up scoring
js/speech.js       text-to-speech, and chooses the speech recognizer
js/offline-speech.js  offline speech recognition (Vosk) with the expected words
js/scoring.js      pronunciation, reading and answer checking
js/storage.js      auto-saving progress store
js/content/        the book: one file per unit (begin, starter, ch01–ch10, cp1–cp3, final)
assets/img/        pictures from the book
sw.js              offline support
vendor/vosk-browser/  the offline recognizer library (Apache-2.0)
models/            the English speech model (Apache-2.0)
vendor/firebase/   Firebase JS SDK, bundled (Apache-2.0)
firestore.rules    who may read and write family data
firebase.json      settings for the local Firebase emulator (testing)
```

To fix or change the book's content, edit the file in `js/content/`. Keep the
`id` values the same, because saved progress is stored by id.

```sh
npm test               # unit tests + checks every exercise against the answer key
npm run precache       # run after adding or changing files (offline file list)
```

The content test checks every id and picture, grades every exercise with its
answer-key answer, and checks the review totals against the book.

To try family accounts on your computer without a Firebase project, run the
Firebase emulator (`npx firebase-tools emulators:start --only auth,firestore
--project demo-greenhill`) and open `http://localhost:8000/?emulator`.

The speech model is downloaded by the **Fetch offline speech model** workflow
(`.github/workflows/fetch-speech-model.yml`), which saves it to `models/`.
`tools/check-vocabulary.py` lists words in the book the model doesn't know;
each needs an entry in `SPOKEN_FORMS` in `js/offline-speech.js`.

Speech recognition: vosk-browser by Ciaran O'Reilly and the Vosk English model
by Alpha Cephei, both licensed Apache-2.0.

Pictures: Twemoji icons (© Twitter, Inc. and other contributors, licensed
CC-BY 4.0) and drawings made for the book.
