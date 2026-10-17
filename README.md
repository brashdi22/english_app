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
- Several children can use the app on one device, each with their own name.
- **⚙️ Settings → Download backup / Restore backup** moves progress to
  another device.

## Grown-up mode

Some tasks are scored by an adult in the book: letter sounds, writing, and
talking. Tap **🔒 Grown-up** (you'll answer a simple multiplication question
first) to give those points. The "For the adult" notes from the book are
shown in purple boxes.

## Running the app

The app is a static website with no build step. Speaking and listening use the
browser's Web Speech API:

| | Reads aloud | Listens to the child |
|---|---|---|
| Chrome / Edge (desktop, Android) | ✅ | ✅ (needs internet) |
| Safari (Mac, iPhone, iPad) | ✅ | ✅ |
| Firefox | ✅ | ❌ (a grown-up marks the speaking instead) |

The microphone only works on `https://` or `localhost`, so serve the folder
instead of opening `index.html` as a file:

```sh
python3 -m http.server 8000     # then open http://localhost:8000
```

To put it online for free, turn on **GitHub Pages** for this repository
(Settings → Pages → deploy from the branch, folder `/`). Once it has been opened,
the app works offline and can be installed on a tablet or phone ("Add to Home
Screen"). Listening still needs an internet connection in Chrome.

## For developers

```
index.html, css/styles.css
js/app.js          screens, navigation, progress tracker, settings
js/runner.js       question-card exercises (checking, retries, scoring)
js/screens.js      words, stories, dialogues, pronunciation, writing, grown-up scoring
js/speech.js       text-to-speech and speech recognition
js/scoring.js      pronunciation, reading and answer checking
js/storage.js      auto-saving progress store
js/content/        the book: one file per unit (begin, starter, ch01–ch10, cp1–cp3, final)
assets/img/        pictures from the book
sw.js              offline support
```

To fix or change the book's content, edit the file in `js/content/`. Keep the
`id` values the same, because saved progress is stored by id.

```sh
npm test               # unit tests + checks every exercise against the answer key
npm run precache       # run after adding or changing files (offline file list)
```

The content test checks every id and picture, grades every exercise with its
answer-key answer, and checks the review totals against the book.

Pictures: Twemoji icons (© Twitter, Inc. and other contributors, licensed
CC-BY 4.0) and drawings made for the book.
