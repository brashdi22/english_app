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

## Accounts and families

The app works in one of two ways.

### With accounts (recommended; needs a free Firebase project, see below)

- **Children** create their own account with a **username and a PIN**
  (4–8 numbers); no email needed. They can log in on **any device**. Each
  device remembers the children who used it, so next time they just tap
  their picture and type their PIN.
- **Parents** create a parent account with their email and a password and
  get a **family ID** (8 letters and numbers).
- **Joining a family:** a child types the family ID when creating their
  account, or later in **⚙️ Settings → My family**. The parent sees the
  request in the parent area and **accepts or rejects** it. Only the parent
  can take a child out of the family (**Remove from family**); children
  cannot leave by themselves.
- **Deleting accounts** (parent only): **🗑 Delete account** on a child's
  card deletes that child's account and all their work; their devices are
  logged out and the username becomes free again. **Delete my parent
  account** (bottom of the parent area, needs the log-in password) deletes
  the parent account and the family, and, if ticked, the children's
  accounts too. Children cannot delete their own account.
- **The parent area** (log in as the parent on any device): the family ID,
  join requests, each child's stars, activities, review scores and full
  Progress Tracker with reading records and "Not yet" items.
- **🏆 Scoreboard:** the children of the family compare stars (all time and
  this week), activities done, units finished, review scores, reading speed
  and words said. Only members of the same family see each other.
- **Daily time limit:** each child in a family has **60 minutes a day**
  at first. In the parent area, **⏱ Time** on a child's card sets their
  limit (any number of minutes, or no limit) and **adds extra time for
  today** — from the parent's own phone or computer, it reaches the child's
  devices straight away. On the child's device a grown-up can also add time
  with the grown-up password. Only time with the app on screen and in use
  counts (not after 3 minutes without a tap), on all the child's devices
  together; the top bar shows the minutes left, with a warning at 5
  minutes, and then **"Time's up for today"**. The day starts at midnight on
  the device. The count runs on the child's device, so it is a firm limit
  for children, not tamper-proof (e.g. against changing the device's date).
  Children who are not in a family have no limit.
- **Grown-up scoring** (letter sounds, writing, talking): on a child's
  device, tap **🔒 Grown-up** and type the family's **grown-up password**.
  It starts as **`adminpass`**; the parent can change it in the parent area
  and the change reaches all the children's devices.
- Work is saved on the device straight away (so it works offline) and in the
  child's account when online.
- **Security:** a child's data can only be read by the child and, once
  accepted, by their family's parent, and only that parent can remove or
  delete them (see [`firestore.rules`](firestore.rules); after changing
  the rules, publish them again in the Firebase console).
  Passwords and PINs are stored only as hashes. PINs are short, so they keep
  brothers and sisters apart rather than being strong security; choose a
  longer PIN if that matters to you.
- **Forgotten passwords:** a parent can get a reset email with **Forgot
  password?** on the parent log-in. A forgotten child PIN (or any password)
  can be reset by the app's owner with the [admin tool](#admin-tool).

### Without accounts (until Firebase is set up)

Children and progress stay on **one device**. A grown-up opens the **👪
parent area** with the parent password (`adminpass` at first), adds the
children with a picture and a 4-digit PIN, and can reset or remove them,
change the password and download backups. The scoreboard compares the
children of that device.

### Setting up accounts (once, about 15 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com),
   **Create a project** (any name, e.g. `greenhill-english`; Google Analytics
   is not needed). The free *Spark* plan is enough.
2. **Build → Authentication → Get started → Sign-in method → Email/Password →
   Enable → Save.** (Children's accounts use this too, with their username.)
3. **Build → Firestore Database → Create database**, choose a location near
   you, start in **production mode**.
4. In Firestore, open the **Rules** tab, replace the rules with the contents
   of [`firestore.rules`](firestore.rules) and **Publish**.
5. **Project settings (⚙️) → General → Your apps → Web (`</>`)**: register an
   app (no hosting needed) and copy the values of `firebaseConfig`.
6. Paste them into [`js/cloud-config.js`](js/cloud-config.js)
   (`apiKey`, `authDomain`, `projectId`, `appId`). These values are not
   secret.
7. **Authentication → Settings → Authorized domains → Add domain**: add your
   GitHub Pages address (e.g. `yourname.github.io`).

Then open the app, choose **I'm a parent → Create a parent account**, and
give the family ID to the children.

### Admin tool

`tools/admin.mjs` runs on your own computer and can change any account. It
needs [Node.js](https://nodejs.org) and a **service account key**.

1. In the Firebase console: **Project settings (⚙️) → Service accounts →
   Generate new private key**. A `.json` file downloads.
2. Move it to a folder **outside this project** (e.g. your Documents folder).
   This key can change every account: never commit, upload or share it. If
   it leaks, delete it in Google Cloud console → IAM → Service accounts →
   Keys and make a new one.
3. In this project's folder, run `npm install` once.

Then:

```sh
node tools/admin.mjs list --key ~/Documents/greenhill-key.json
node tools/admin.mjs kid-pin sami 4321 --key ~/Documents/greenhill-key.json
node tools/admin.mjs parent-password mum@example.com newpassword123 --key ~/Documents/greenhill-key.json
node tools/admin.mjs grownup-password ABCD2345 newgrownuppass --key ~/Documents/greenhill-key.json
```

- `list`: every child (username and family) and parent (email and family ID).
- `kid-pin <username> <PIN>`: a new PIN of 4 to 8 numbers.
- `parent-password <email> <password>`: a new parent log-in password.
- `grownup-password <family ID or parent email> <password>`: the family's
  grown-up scoring password (if the parent forgot it).

After a PIN or password change, devices that are still logged in to that
account are logged out within an hour.

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
js/family.js       accounts, families, join requests, grown-up password, syncing
js/family-pages.js log-in and sign-up pages, PIN pad, parent area, scoreboard
js/cloud.js        Firebase (accounts) — settings in js/cloud-config.js
js/progress.js     scores and summaries for the tracker and scoreboard
js/screen-time.js  daily time limit: counting a child's time on all devices
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
tools/admin.mjs    admin tool: reset PINs and passwords, list accounts
```

To fix or change the book's content, edit the file in `js/content/`. Keep the
`id` values the same, because saved progress is stored by id.

```sh
npm test               # unit tests + checks every exercise against the answer key
npm run precache       # run after adding or changing files (offline file list)
```

The content test checks every id and picture, grades every exercise with its
answer-key answer, and checks the review totals against the book.

To try accounts on your computer without a Firebase project, run the
Firebase emulator (`npx firebase-tools emulators:start --only auth,firestore
--project demo-greenhill`) and open `http://localhost:8000/?emulator`.
With the emulator running, `npm install` then `npm run test:emulator` checks
the security rules (who can read and write what) and the admin tool
(`node tools/admin.mjs … --emulator` uses the emulator too).

The speech model is downloaded by the **Fetch offline speech model** workflow
(`.github/workflows/fetch-speech-model.yml`), which saves it to `models/`.
`tools/check-vocabulary.py` lists words in the book the model doesn't know;
each needs an entry in `SPOKEN_FORMS` in `js/offline-speech.js`.

Speech recognition: vosk-browser by Ciaran O'Reilly and the Vosk English model
by Alpha Cephei, both licensed Apache-2.0.

Pictures: Twemoji icons (© Twitter, Inc. and other contributors, licensed
CC-BY 4.0) and drawings made for the book.
