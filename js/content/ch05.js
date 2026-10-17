import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Face and hair',
    words: [
      w('hair', 'hair', 'it is on the top of your head', 'Lina has long **hair**.', 'Rhymes with chair'),
      w('eyes', 'eyes', 'you see with them', 'My **eyes** are brown.', 'Say: eyez'),
      w('glasses', 'glasses', 'you put them on your eyes to see well', 'Lina has **glasses**.', 'Say: GLAH-siz'),
      w('smile', 'smile', 'the shape of a happy mouth', 'Ben has a big **smile**.', 'Rhymes with mile'),
    ],
  },
  {
    title: 'Describing people',
    words: [
      w('tall', 'tall', 'not short; a long way up', 'Sam is **tall**.', 'Rhymes with ball'),
      w('short', 'short', 'not tall; not long', 'Ben is **short**. His hair is short.', 'Say: shawt'),
      w('long', 'ruler', 'not short', 'Lina has **long** hair.'),
      w('kind', 'kind', 'nice and good to people', 'Gran is very **kind**.', 'Rhymes with find'),
      w('funny', 'funny', 'he or she makes you laugh', 'Ben is very **funny**.', 'Say: FUN-ee'),
      w('clever', 'clever', 'good at thinking and learning', 'Lina is very **clever**.', 'Say: KLEV-er'),
    ],
  },
  {
    title: 'Club words',
    words: [
      w('club', 'club', 'friends who meet to do the same thing', 'We have a **club**!'),
      w('mystery', 'mystery', 'something strange; we do not know the answer', 'The old key is a **mystery**.', 'Say: MISS-tuh-ree'),
    ],
  },
];

const KIDS = ['Lina', 'Ben', 'Sam'];

export default {
  id: 'ch5',
  kind: 'chapter',
  label: 'Chapter 5',
  title: 'My New Friends',
  week: 6,
  color: '#d35400',
  icon: 'smile',
  intro: 'Sam, Lina and Ben are good friends now. They have a new club. What is it? And what is the old key for?',
  goals: ['I can describe people: tall, short, long hair, glasses.', 'I can use **have** and **has**.', 'I can put describing words before things: long hair, a big smile.', 'I can read a description and find the right person.'],
  endGoal: 'At the end of this chapter, you can describe a friend or a person in your family.',
  review: { title: 'Chapter 5 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      blocks: [{ kind: 'note', text: '**best friend** = your number 1 friend. **a lot of** = many.' }],
      activities: [
        { id: 'ch5-words', type: 'words', title: 'New Words', groups },
        sayWords('ch5-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch5-1', n: 1, type: 'gap', title: 'Look at the pictures. Write the word.',
          items: [
            { img: 'glasses', hint: 'g', answer: 'glasses' },
            { img: 'eyes', hint: 'e', answer: 'eyes' },
            { img: 'smile', hint: 's', answer: 'smile' },
            { img: 'hair', hint: 'h', answer: 'hair' },
            { img: 'tall', hint: 't', answer: 'tall' },
          ],
        },
        {
          id: 'ch5-2', n: 2, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['funny', 'clever', 'kind', 'club', 'mystery'],
          items: [
            { text: 'Ben makes me laugh. He is very ___.', answer: 'funny' },
            { text: 'Lina is good at school. She is ___.', answer: 'clever' },
            { text: 'Gran helps people. She is very ___.', answer: 'kind' },
            { text: 'What is the old key for? It is a ___!', answer: 'mystery' },
            { text: 'We meet on Wednesday. We are a ___.', answer: 'club' },
          ],
        },
        {
          id: 'ch5-3', n: 3, type: 'open', title: 'Describe a person in your family. Use two words from this page.',
          frames: [{ before: 'My', hint: 'dad is tall and funny.' }],
          model: 'My dad is tall and funny.',
        },
      ],
    },
    {
      title: 'Sound Spot: ar and or',
      activities: [
        soundSpot('ch5-sound', 'Read the ar and or words', '**ar** says the sound in **car**: park · star · dark · arm · Mark. **or** says the sound in **fork**: short · sport · for · morning · horse.',
          ['car', 'park', 'star', 'dark', 'arm', 'Mark', 'fork', 'short', 'sport', 'for', 'morning', 'horse']),
        {
          id: 'ch5-4', n: 4, type: 'gap', title: 'Write ar or or.',
          bank: ['ar', 'or'],
          items: [
            { img: 'car', text: 'c___', answer: 'ar' },
            { text: 'sh___t', answer: 'or' },
            { img: 'star', text: 'st___', answer: 'ar' },
            { text: 'p___k', answer: 'ar' },
            { text: 'sp___t', answer: 'or' },
            { img: 'fork', text: 'f___k', answer: 'or' },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch5-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'The Map Club', words: 142,
          lines: [
            { text: 'Lina and Ben are my best friends now.' },
            { text: 'Lina is tall. She has long black hair and brown eyes. She has glasses.' },
            { text: 'Lina is very clever. She has a lot of books!' },
            { text: 'Ben is short. He has short brown hair, blue eyes and a big smile. Ben is very funny.' },
            { text: 'I am tall too. I have short black hair and brown eyes.' },
            { text: 'Dina is not in the club. She is six and she is very little. But she has a lot of questions!' },
            { text: 'We have a club. It is the Map Club! We have a big map of Greenhill. We have the old key too. It is in my pencil case.' },
            { text: 'Is it a key for a door? Is it a key for a box? It is a mystery! Where is the door? We are the Map Club. We can find it!' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch5-5', n: 5, type: 'choice', title: 'Who is it? Write Lina, Ben or Sam.',
          items: [
            { q: 'He has a big smile.', options: KIDS, answer: 'Ben' },
            { q: 'She has glasses.', options: KIDS, answer: 'Lina' },
            { q: 'He has short black hair.', options: KIDS, answer: 'Sam' },
            { q: 'She is very clever.', options: KIDS, answer: 'Lina' },
            { q: 'He is very funny.', options: KIDS, answer: 'Ben' },
          ],
        },
        {
          id: 'ch5-6', n: 6, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Lina is short.', false, 'She is tall.'),
            tf('Ben has blue eyes.', true),
            tf('Sam has long hair.', false, 'He has short hair.'),
            tf("The key is in Sam's pencil case.", true),
          ],
        },
        {
          id: 'ch5-7', n: 7, type: 'write', title: 'Answer with a word or a short sentence.',
          items: [
            { prompt: "What colour is Lina's hair?", answer: 'It is black.', keywords: ['black'] },
            { prompt: 'What is the name of the club?', answer: 'It is the Map Club.', keywords: ['map', 'club'] },
            { prompt: 'The club has two things. What are they?', answer: 'a big map of Greenhill and the old key', keywords: ['map', 'key'] },
          ],
        },
        {
          id: 'ch5-8', n: 8, type: 'choice', abc: true, title: 'Think! Why is it the Map Club? Circle a, b or c.',
          items: [{ q: 'Why is it the Map Club?', options: ['They have a big map.', 'They have glasses.', 'They are tall.'], answer: 'They have a big map.' }],
        },
      ],
    },
    {
      title: 'Grammar: have and has',
      activities: [
        {
          id: 'ch5-grammar', type: 'info', title: 'Grammar: have and has',
          blocks: [
            { kind: 'list', items: ['**I, you, we, they + have**: I have brown eyes. We have a club.', '**he, she, it + has**: She has glasses. He has a big smile. It has four numbers.'] },
            {
              kind: 'table', head: ['Who?', 'Example'],
              rows: [
                ['I', 'I have short hair.'], ['you', 'You have a nice smile.'], ['we', 'We have a club.'], ['they', 'They have a map.'],
                ['he', 'Ben has blue eyes.'], ['she', 'Lina has glasses.'], ['it', 'The key has four numbers.'],
              ],
            },
            { kind: 'p', text: '**Describing words**' },
            { kind: 'list', items: ['Describing words go before the thing: long hair · a big smile · a kind teacher.', 'For hair: size, then colour: long black hair · short brown hair.', "Describing words don't change: two big bags (not bigs)."] },
            { kind: 'mistakes', pairs: [['She have glasses.', 'She has glasses.'], ['I has a sister.', 'I have a sister.'], ['He has hair short.', 'He has short hair.']] },
          ],
        },
        {
          id: 'ch5-9', n: 9, type: 'gap', title: 'Look at the example. Write have or has.',
          context: [{ kind: 'p', text: 'Example: Lina **has** glasses.' }],
          bank: ['have', 'has'],
          items: [
            { text: 'I ___ brown eyes.', answer: 'have' },
            { text: 'Ben ___ a big smile.', answer: 'has' },
            { text: 'We ___ a club.', answer: 'have' },
            { text: 'Sam and Dina ___ a cat.', answer: 'have' },
            { text: 'Mrs Green ___ red hair.', answer: 'has' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch5-10', n: 10, type: 'match', title: 'Who is it? Read and write the letter.',
          left: ['She has long black hair and a big smile.', 'He has short yellow hair and glasses.', 'He has short black hair and a big smile.', 'She has long brown hair and glasses.'],
          right: ['person-a', 'person-b', 'person-c', 'person-d'].map((x) => ({ img: x })),
          answer: 'badc',
        },
        {
          id: 'ch5-11', n: 11, type: 'order', title: 'Put the words in order. Write the sentence.',
          items: [
            { words: ['hair', 'long', 'has', 'She'], answer: 'She has long hair.' },
            { words: ['a', 'smile', 'big', 'has', 'He'], answer: 'He has a big smile.' },
            { words: ['eyes', 'have', 'brown', 'I'], answer: 'I have brown eyes.' },
            { words: ['glasses', 'Gran', 'has'], answer: 'Gran has glasses.' },
          ],
        },
        {
          id: 'ch5-12', n: 12, type: 'write', title: 'Find the mistake. Write the sentence again.',
          items: [
            { prompt: 'Ben have a cap.', answer: 'Ben has a cap.' },
            { prompt: 'Lina has hair long.', answer: 'Lina has long hair.' },
            { prompt: 'They has a map.', answer: 'They have a map.' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch5-13', n: 13, type: 'open', title: 'Write about your best friend (or a person in your family).',
          frames: [
            { before: 'My best friend is' },
            { before: 'He / She is', after: 'years old.' },
            { before: 'He / She is', after: '(tall / short)' },
            { before: 'He / She has', hint: 'long black hair and brown eyes' },
            { before: 'He / She is very', after: '(kind / funny / clever)' },
          ],
          talk: 'Guess who? Describe a person in your family. Your adult guesses. "He has short grey hair. He is tall. He is very funny. Who is it?"',
          model: 'My best friend is Maryam. She is ten years old. She is tall. She has long black hair and brown eyes. She is very kind.',
        },
      ],
    },
    {
      title: 'Chapter 5 Review',
      activities: [
        {
          id: 'ch5-14', n: 14, type: 'gap', review: true, title: 'Write the opposite.',
          items: [
            { text: 'tall → ___', answer: 'short' },
            { text: 'big → ___', answer: ['small', 'little'] },
            { text: 'new → ___', answer: 'old' },
            { text: 'long → ___', answer: 'short' },
          ],
        },
        {
          id: 'ch5-15', n: 15, type: 'gap', review: true, title: 'Write have or has.',
          bank: ['have', 'has'],
          items: [
            { text: 'Ben ___ brown hair.', answer: 'has' },
            { text: 'I ___ a sister.', answer: 'have' },
            { text: 'They ___ a map.', answer: 'have' },
            { text: 'Lina ___ glasses.', answer: 'has' },
          ],
        },
        {
          id: 'ch5-16', n: 16, type: 'choice', review: true, title: 'Read. Circle the right word.',
          context: [{ kind: 'p', cls: 'reading', text: "This is Ben's mum. She is tall. She has short red hair and green eyes. She is very kind." }],
          items: [
            { q: "Ben's mum is ___.", options: ['tall', 'short'], answer: 'tall' },
            { q: 'Her hair is ___.', options: ['long', 'short'], answer: 'short' },
            { q: 'Her eyes are ___.', options: ['blue', 'green'], answer: 'green' },
            { q: 'She is very ___.', options: ['kind', 'funny'], answer: 'kind' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch5-check', [
          'describe people (tall, short, long hair).',
          'use have and has.',
          'put describing words before things (long hair).',
          'read the story "The Map Club".',
        ]),
      ],
    },
  ],
};
