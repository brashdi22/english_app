const LETTERS = 's a t p i n m d g o c k e u r h b f l j v w x y z q'.split(' ');

export default {
  id: 'begin',
  kind: 'begin',
  label: "Let's Begin",
  title: 'What Do You Know?',
  week: 1,
  color: '#8e44ad',
  icon: 'i-ask',
  intro: 'This is not a test! It helps us find the best place to start. Do your best. It is OK to say "I don’t know".',
  adult: 'Do this in one relaxed session (about 25 minutes). Read every instruction aloud and help the child understand it. Stop if the child is tired and finish another day. Grown-up mode (👪) lets you give the points for Parts A, E and F. The app scores Parts B, C and D. At the end of the book, do Parts C and D again and compare the scores!',
  review: {
    title: "Let's Begin",
    bands: null,
  },
  placement(s) {
    if (s.A == null) return null;
    const tips = [];
    if (s.A < 18) tips.push('Part A is under 18: the child needs more work on letter sounds. Spend two weeks on the Starter Unit and practise 5 sounds a day. Then start Chapter 1.');
    else if (s.C != null && s.D != null && s.A >= 22 && s.C + s.D >= 14) tips.push('The child can read simple words. Do the Starter Unit quickly (2 sessions) and start Chapter 1 in Week 1.');
    else if (s.C != null && s.D != null && s.C + s.D < 10) tips.push('Do the full Starter Unit in Week 1, as planned.');
    else tips.push('Do the Starter Unit in Week 1, as planned.');
    if (s.E != null && s.F != null && s.E + s.F < 7) tips.push('Parts E and F are low: this is normal for a beginner. Speaking and writing grow in every chapter. Spend extra time on Write and Speak.');
    return tips.join(' ');
  },
  sections: [
    {
      title: 'Part A: Letters and sounds',
      activities: [
        {
          id: 'begin-a', n: 1, part: 'A', type: 'adult', review: true, compact: true,
          title: 'Say the sound of each letter.',
          childText: 'Your grown-up points to each letter. Say its **sound** (for example "a" as in apple, "b" as in bag).',
          guide: 'Point to each letter. The child says its sound (for example "a" as in apple, "b" as in bag). Tick (✓) each sound the child knows. A letter name (ay, bee) is a good start, but count only sounds. 26 points.',
          items: LETTERS.map((l) => ({ label: l, say: l })),
        },
      ],
    },
    {
      title: 'Part B: Words I know',
      activities: [
        {
          id: 'begin-b', n: 2, part: 'B', type: 'match', review: true,
          title: 'Look at the pictures. Write the letter.',
          left: ['dog', 'sun', 'bag', 'car', 'apple', 'cat', 'book', 'fish', 'ball', 'house'],
          right: ['cat', 'sun', 'book', 'house', 'ball', 'dog', 'apple', 'car', 'fish', 'bag'].map((x) => ({ img: x })),
          answer: 'fbjhgacied',
        },
      ],
    },
    {
      title: 'Part C: Read the words',
      activities: [
        {
          id: 'begin-c', n: 3, part: 'C', type: 'speak', mode: 'read', review: true,
          title: 'Read the words aloud.',
          instruction: 'Read each word aloud. Tap the microphone, then read.',
          adultNote: 'The child reads each word without help. Row 1: sound-out words. Row 2: tricky words. Row 3: longer words. The app listens and counts a word as correct when it hears it clearly.',
          items: ['cat', 'sun', 'pen', 'big', 'dog', 'the', 'is', 'you', 'my', 'they', 'green', 'school', 'friend', 'happy', 'house'].map((text) => ({ text })),
        },
      ],
    },
    {
      title: 'Part D: Read and choose',
      activities: [
        {
          id: 'begin-d', n: 4, part: 'D', type: 'choice', review: true, abc: true,
          title: 'Read the sentence. Circle a or b.',
          items: [
            { q: 'This is a cat.', options: [{ img: 'cat' }, { img: 'dog' }], answer: 0 },
            { q: 'This is a book.', options: [{ img: 'bag' }, { img: 'book' }], answer: 1 },
            { q: 'The boy is happy.', options: [{ img: 'happy-face' }, { img: 'sad-face' }], answer: 0 },
            { q: 'It is a big house.', options: [{ img: 'car' }, { img: 'house' }], answer: 1 },
          ],
        },
      ],
    },
    {
      title: 'Part E: Talk',
      activities: [
        {
          id: 'begin-e', n: 5, part: 'E', type: 'ask', review: true,
          title: "Answer your adult's questions.",
          adultNote: '2 points for an answer in a sentence ("My name is Ali."), 1 point for one word ("Ali"), 0 for no answer. The app suggests points from what it hears; you can change them in grown-up mode.',
          scoring: { sentence: 2, word: 1 },
          items: [
            { q: "What's your name?", model: 'My name is Ali.' },
            { q: 'How old are you?', model: 'I am ten.' },
            { q: 'What is this?', img: 'pen', model: 'It is a pen.' },
            { q: 'What colour is it?', img: 'c-red', model: 'It is red.' },
          ],
        },
      ],
    },
    {
      title: 'Part F: Write',
      activities: [
        {
          id: 'begin-f', n: 6, part: 'F', type: 'open', review: true,
          title: 'Write.',
          frames: [
            { before: '1. Write your name.' },
            { before: '2. Write three English words.' },
            { before: '3. Write a sentence about you (if you can).' },
          ],
          rubric: [{ label: 'Name', max: 1 }, { label: 'English words', max: 3 }, { label: 'Sentence', max: 2 }],
          guide: '1 point for the name; 1 point for each English word (up to 3); 2 points for a sentence (1 point if it has small mistakes).',
        },
      ],
    },
  ],
};
