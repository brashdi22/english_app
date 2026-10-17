import { w, progressCheck, tf } from './helpers.js';

const instructionWords = [
  w('Read', 'i-read'), w('Write', 'i-write'), w('Circle', null, 'draw a ring around the right answer', null, '⭕'),
  w('Match', 'i-match'), w('Look', 'i-look'), w('Say', 'i-say'), w('Tick', 'i-tick', 'make a ✓'),
  w('Draw', 'i-draw'), w('Colour', 'i-colour'), w('Find', 'i-find'), w('Answer', 'i-answer'),
  w('Choose', 'i-choose'), w('Number', 'i-number'), w('Ask', 'i-ask'),
];

const ALPHABET = [
  ['Aa', 'apple', 'apple'], ['Bb', 'bag', 'bag'], ['Cc', 'cat', 'cat'], ['Dd', 'dog', 'dog'], ['Ee', 'egg', 'egg'],
  ['Ff', 'fish', 'fish'], ['Gg', 'girl', 'girl-a'], ['Hh', 'hat', 'hat'], ['Ii', 'insect', 'insect'], ['Jj', 'jam', 'jam'],
  ['Kk', 'kite', 'kite'], ['Ll', 'leg', 'leg'], ['Mm', 'map', 'map'], ['Nn', 'net', 'net'], ['Oo', 'octopus', 'octopus'],
  ['Pp', 'pen', 'pen'], ['Qq', 'queen', 'queen'], ['Rr', 'red', 'red-square'], ['Ss', 'sun', 'sun'], ['Tt', 'ten', 'ten'],
  ['Uu', 'umbrella', 'umbrella'], ['Vv', 'van', 'van'], ['Ww', 'web', 'web'], ['Xx', 'box', 'box'], ['Yy', 'yo-yo', 'yo-yo'],
  ['Zz', 'zebra', 'zebra'],
];

const TRICKY = ['I', 'a', 'the', 'is', 'are', 'you', 'my', 'he', 'she', 'we', 'they', 'me', 'to', 'do', 'have', 'what', 'where', 'of'];

export default {
  id: 'starter',
  kind: 'starter',
  label: 'Starter Unit',
  title: 'Sounds and Letters',
  week: 1,
  color: '#16a085',
  icon: 'i-say',
  intro: 'Good readers know the sounds of the letters. Then they can read new words alone! In this unit, you practise English sounds and short words. Then you can start Sam’s story.',
  goals: ['I can say the sounds of the letters.', 'I can read short words like cat, sun and fish.', 'I can read some tricky words: the, is, you.', 'I can understand the instruction words in this book.'],
  endGoal: 'At the end of this unit, you can read your first English sentences.',
  adult: 'Week 1, sessions 2–5. Session 2: instruction words and alphabet. Session 3: short vowels. Session 4: sh, ch, th, ck and tricky words. Session 5: first sentences and the Starter Review. Say letter sounds, not letter names: "a" as in apple, "b" as in bag (a short "b", not "buh").',
  review: {
    title: 'Starter Review',
    bands: [[8, 'Great!'], [6, 'Good. Fix your mistakes.'], [0, 'Practise again with your adult.']],
  },
  sections: [
    {
      title: 'Words for instructions',
      activities: [
        { id: 'st-instr', type: 'words', title: 'Words for instructions', groups: [{ title: 'These words are in the instructions in this book. Learn them first!', words: instructionWords }] },
      ],
    },
    {
      title: 'The alphabet: letters and sounds',
      activities: [
        {
          id: 'st-abc', type: 'words', title: 'The alphabet: letters and sounds',
          groups: [{ title: '', words: ALPHABET.map(([letters, word, img]) => w(word, img, null, null, letters)) }],
        },
        {
          id: 'st-abc-say', type: 'speak', mode: 'repeat', title: 'Say the alphabet words',
          context: [{ kind: 'note', text: 'The letters **a, e, i, o, u** are vowels. All the other letters are consonants.' }],
          items: ALPHABET.map(([letters, word, img]) => ({ text: word, img, hint: letters })),
        },
        {
          id: 'st-1', n: 1, type: 'gap', title: 'Look at the picture. Write the first letter.',
          items: [
            { img: 'fish', text: '___ish', answer: 'f' },
            { img: 'bag', text: '___ag', answer: 'b' },
            { img: 'dog', text: '___og', answer: 'd' },
            { img: 'sun', text: '___un', answer: 's' },
            { img: 'map', text: '___ap', answer: 'm' },
            { img: 'pen', text: '___en', answer: 'p' },
            { img: 'hat', text: '___at', answer: 'h' },
            { img: 'ten', text: '___en', answer: 't' },
          ],
        },
      ],
    },
    {
      title: 'Short vowel sounds',
      activities: [
        {
          id: 'st-vowels', type: 'speak', mode: 'repeat', title: 'Short vowel sounds',
          instruction: 'In short words, the vowels say short sounds. Read each line aloud.',
          context: [
            { kind: 'note', text: 'In short words, the vowels say short sounds. Read each line aloud.' },
            { kind: 'adult', text: 'Blending: say each sound and point to each letter (c – a – t). Then say the sounds faster and faster until they join: "cat!"' },
          ],
          items: [
            { text: 'cat, bag, map, Sam, Max, hat', hint: 'a' },
            { text: 'pen, red, ten, bed, Ben, get', hint: 'e' },
            { text: 'sit, big, fish, six, zip, in', hint: 'i' },
            { text: 'dog, box, hot, on, not, top', hint: 'o' },
            { text: 'sun, bus, cup, mum, up, run', hint: 'u' },
          ],
        },
        {
          id: 'st-2', n: 2, type: 'gap', title: 'Say the sounds. Read the word. Then write it.',
          items: [
            { text: 'c · a · t → ___', answer: 'cat' },
            { text: 'd · o · g → ___', answer: 'dog' },
            { text: 's · u · n → ___', answer: 'sun' },
            { text: 'p · e · n → ___', answer: 'pen' },
            { text: 'b · i · g → ___', answer: 'big' },
            { text: 'm · a · p → ___', answer: 'map' },
            { text: 'b · u · s → ___', answer: 'bus' },
            { text: 'r · e · d → ___', answer: 'red' },
          ],
        },
        {
          id: 'st-3', n: 3, type: 'gap', title: 'Look at the picture. Write the missing vowel: a, e, i, o or u.',
          bank: ['a', 'e', 'i', 'o', 'u'],
          items: [
            { img: 'cat', text: 'c___t', answer: 'a' },
            { img: 'dog', text: 'd___g', answer: 'o' },
            { img: 'bus', text: 'b___s', answer: 'u' },
            { img: 'bed', text: 'b___d', answer: 'e' },
            { img: 'fish', text: 'f___sh', answer: 'i' },
            { img: 'box', text: 'b___x', answer: 'o' },
            { img: 'ten', text: 't___n', answer: 'e' },
            { img: 'map', text: 'm___p', answer: 'a' },
            { img: 'cup', text: 'c___p', answer: 'u' },
            { q: '6', text: 's___x', answer: 'i' },
          ],
        },
      ],
    },
    {
      title: 'Two letters, one sound: sh, ch, th, ck',
      activities: [
        {
          id: 'st-digraphs', type: 'speak', mode: 'repeat', title: 'Two letters, one sound',
          context: [{
            kind: 'table', head: ['sh', 'ch', 'th', 'ck'],
            rows: [['fish', 'chip', 'this', 'back'], ['shop', 'lunch', 'that', 'duck'], ['she', 'much', 'with', 'clock']],
          }],
          items: ['fish', 'shop', 'she', 'chip', 'lunch', 'much', 'this', 'that', 'with', 'back', 'duck', 'clock'].map((text) => ({ text })),
        },
        {
          id: 'st-4', n: 4, type: 'gap', title: 'Write sh, ch, th or ck.',
          bank: ['sh', 'ch', 'th', 'ck'],
          items: [
            { img: 'fish', text: 'fi___', answer: 'sh' },
            { img: 'duck', text: 'du___', answer: 'ck' },
            { img: 'chips', text: '___ips', answer: 'ch' },
            { img: 'shop-bags', text: '___op', answer: 'sh' },
            { text: '___is', answer: 'th' },
            { text: 'lun___', answer: 'ch' },
            { img: 'clock', text: 'clo___', answer: 'ck' },
            { text: 'wi___', answer: 'th' },
          ],
        },
      ],
    },
    {
      title: 'Tricky words',
      activities: [
        {
          id: 'st-tricky', type: 'speak', mode: 'repeat', title: 'Tricky words',
          context: [{ kind: 'note', text: 'Some words are hard to sound out. Learn them by heart: **look, say, cover, write, check**.' }],
          items: TRICKY.map((text) => ({ text })),
        },
        {
          id: 'st-5', n: 5, type: 'gap', title: 'Look, say, cover, write, check. Write each word two times.',
          instruction: 'Listen to the word. Then write it two times.',
          items: ['the', 'you', 'are', 'they', 'have', 'what'].map((x) => ({ say: x, text: '___   ___', answers: [x, x] })),
        },
      ],
    },
    {
      title: 'Read your first sentences',
      activities: [
        {
          id: 'st-story', type: 'story', record: true, title: 'Read your first sentences', storyTitle: 'Max!', words: 34,
          lines: [
            { text: 'I am Sam.' },
            { text: 'I have a cat.' },
            { text: 'My cat is Max.' },
            { text: 'Max is big.' },
            { text: 'Max is on my bed.' },
            { text: 'My red bag is on the bed.' },
            { text: 'Max is in my bag!' },
            { text: 'Max! Get up!' },
          ],
        },
        {
          id: 'st-6', n: 6, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Sam has a dog.', false, 'Sam has a cat.'),
            tf('Max is big.', true),
            tf('The bag is red.', true),
            tf('Max is in the bag.', true),
          ],
        },
      ],
    },
    {
      title: 'Starter Review',
      activities: [
        {
          id: 'st-7', n: 7, type: 'gap', review: true, title: 'Write the first letter.',
          items: [
            { img: 'fish', text: '___ish', answer: 'f' },
            { img: 'bag', text: '___ag', answer: 'b' },
            { img: 'sun', text: '___un', answer: 's' },
            { img: 'map', text: '___ap', answer: 'm' },
          ],
        },
        {
          id: 'st-8', n: 8, type: 'gap', review: true, title: 'Write the missing letters.',
          items: [
            { img: 'cat', text: 'c___t', answer: 'a' },
            { img: 'bed', text: 'b___d', answer: 'e' },
            { img: 'fish', text: 'fi___', answer: 'sh' },
            { img: 'duck', text: 'du___', answer: 'ck' },
          ],
        },
        {
          id: 'st-9', n: 9, type: 'speak', mode: 'read', review: true, points: 2,
          pointsRule: [{ min: 5, points: 2 }, { min: 3, points: 1 }],
          title: 'Read the tricky words to your adult.',
          instruction: 'Read each word aloud. Tap the microphone, then read.',
          adultNote: '2 points for 5–6 words read correctly, 1 point for 3–4 words.',
          items: ['the', 'you', 'are', 'they', 'have', 'what'].map((text) => ({ text })),
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('st-check', [
          'say the sounds of the letters.',
          'read short words like cat, sun and fish.',
          'read sh, ch, th and ck words.',
          'read the tricky words.',
          'understand the instruction words.',
        ]),
      ],
    },
  ],
};
