// Small helpers that keep the chapter files short and close to the book.

export const CHAPTER_REVIEW_BANDS = [
  [10, 'Great!'],
  [8, 'Good. Fix your mistakes.'],
  [0, 'Practise again with your adult.'],
];

export const CHECKPOINT_BANDS = [
  [24, 'Great!'],
  [18, 'Good. Fix your mistakes.'],
  [0, 'Practise again with your adult.'],
];

export const CHECKPOINT_NEXT = 'What next? A low score in a part? Go back to the chapters: use your word cards, read the grammar boxes and stories again, and redo one Write and Speak task.';

// A New Words entry: word, picture, meaning, example, pronunciation hint.
export const w = (word, img, meaning, example, hint) => ({ word, img, meaning, example, hint });

// "Say the New Words": the app reads each word, then listens to the child.
export function sayWords(id, groups, extra = []) {
  const items = groups.flatMap((g) => g.words).map((x) => ({ text: x.word, img: x.img, hint: x.hint, accept: x.accept }));
  return {
    id,
    type: 'speak',
    mode: 'repeat',
    title: 'Say the New Words',
    instruction: 'Listen to each word. Then tap the microphone and say it.',
    items: [...items, ...extra],
  };
}

// Sound Spot words to listen to and say aloud.
export function soundSpot(id, title, rule, words, extra = {}) {
  return {
    id,
    type: 'speak',
    mode: 'repeat',
    title,
    instruction: 'Listen. Then say each word.',
    context: [{ kind: 'note', icon: '🔉', text: rule }],
    items: words.map((x) => (typeof x === 'string' ? { text: x } : x)),
    ...extra,
  };
}

export const progressCheck = (id, items) => ({ id, type: 'check', title: 'Progress Check', items });

export const tf = (q, answer, why) => ({ q, answer, why });
