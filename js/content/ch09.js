import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck } from './helpers.js';

const groups = [
  {
    title: 'Weather',
    words: [
      w('rain', 'rain', 'water from the sky; It is raining.', 'Take your umbrella. It is **raining**!', 'Rhymes with train'),
      w('umbrella', 'umbrella', 'you hold it over your head in the rain', 'Ben has a red **umbrella**.', 'Say: um-BREL-uh'),
    ],
  },
  {
    title: 'In the library',
    words: [
      w('quiet', 'quiet', 'with very little sound', 'The library is very **quiet**.', 'Say: KWY-et'),
      w('page', 'page', 'one side of paper in a book', 'Look at **page** ten.', 'Rhymes with cage'),
      w('picture', 'picture', 'a drawing or a photo', 'There is a **picture** of the clock tower.', 'Say: PIK-cher'),
      w('look for', 'look-for', 'try to find', 'We are **looking for** a book.'),
      w('help', 'help', 'do something good for a person', 'Can you **help** me, please?'),
      w('children', 'friend', 'more than one child', 'The **children** are in the library.', 'Say: CHIL-dren'),
    ],
  },
  {
    title: 'Mystery words',
    words: [
      w('clue', 'clue', 'a thing that helps you find an answer', 'The picture is a **clue**!', 'Say: kloo'),
      w('secret', 'secret', 'something only a few people know', 'It is a **secret**!', 'Say: SEE-krit'),
      w('open', 'open', 'not close: Open the door. Open your book.', 'She **opens** a big book.', 'Say: OH-pen'),
    ],
  },
];

const ACTIONS = ['walk', 'run', 'swim', 'sit', 'stand', 'read', 'write', 'sleep'];

export default {
  id: 'ch9',
  kind: 'chapter',
  label: 'Chapter 9',
  title: 'The Clue in the Library',
  week: 10,
  color: '#34495e',
  icon: 'clue',
  intro: 'It is Monday. It is raining. The Map Club goes to the library to see Ms Rose. Can she help with the mystery of the old key?',
  goals: ['I can say what is happening now: She is reading.', 'I can spell -ing words: reading, writing, sitting.', 'I can ask questions with **who, what, where, when** and **why**.', 'I can answer why questions with **because**.'],
  endGoal: 'At the end of this chapter, you can describe a picture and say what people are doing.',
  review: { title: 'Chapter 9 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch9-words', type: 'words', title: 'New Words', groups },
        sayWords('ch9-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch9-1', n: 1, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['quiet', 'umbrella', 'page', 'clue', 'secret', 'help'],
          items: [
            { text: 'It is raining. Take your ___.', answer: 'umbrella' },
            { text: 'Shh! The library is very ___.', answer: 'quiet' },
            { text: 'Open your book at ___ ten.', answer: 'page' },
            { text: "Don't tell Ben. It is a ___!", answer: 'secret' },
            { text: 'This picture is a ___. It helps us with the mystery.', answer: 'clue' },
            { text: 'My bag is very big. Can you ___ me, please?', answer: 'help' },
          ],
        },
        {
          id: 'ch9-2', n: 2, type: 'open', title: 'Write one sentence with quiet and one sentence with picture.',
          frames: [{ before: '', hint: 'a sentence with quiet' }, { before: '', hint: 'a sentence with picture' }],
          model: 'My room is quiet in the evening. There is a picture of my family in my room.',
        },
      ],
    },
    {
      title: 'Sound Spot: silent letters',
      activities: [
        soundSpot('ch9-sound', 'Read the words with quiet letters', 'Some letters are quiet. We write them, but we don’t say them! know · knee · knock (quiet k) · write · wrong (quiet w) · listen (quiet t) · Wednesday (quiet d)',
          ['know', 'knee', 'knock', 'write', 'wrong', 'listen', 'Wednesday']),
        {
          id: 'ch9-3', n: 3, type: 'tap', mode: 'letter', title: 'Circle the quiet letter in each word.',
          words: [
            { word: 'know', answer: 0 },
            { word: 'write', answer: 0 },
            { word: 'listen', answer: 3 },
            { word: 'knee', answer: 0 },
            { word: 'wrong', answer: 0 },
            { word: 'Wednesday', answer: 2 },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch9-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'The Clue in the Library', words: 191,
          helpers: 'says = tells · future = the time after now · safe = no person can take it · I think ... = I have an idea · 1976 = nineteen seventy-six · 2026 = twenty twenty-six',
          lines: [
            { text: 'It is Monday afternoon and it is raining. Sam, Lina and Ben are walking to the library. They have umbrellas.' },
            { text: 'The library is very quiet. A man is reading a book. Two girls are writing. Ms Rose is sitting at her desk. She has short grey hair and big glasses.' },
            { text: '"Hello, Ms Rose," says Lina. "We are looking for a book about the clock tower."' },
            { text: '"Come with me," says Ms Rose. She is opening a big, old book. "Look at this picture. It is the clock tower in 1976."' },
            { img: 'photo-1976', caption: 'Greenhill School, 1976' },
            { text: 'In the picture, two children are standing next to the clock tower. A boy has a box. He is smiling.' },
            { text: 'Ben is reading the words under the picture: "Greenhill School, 1976. Our time capsule is under the clock tower. Open it in 2026!"' },
            { text: '"2026? That’s now!" says Sam.' },
            { text: '"What is a time capsule?" asks Ben.' },
            { text: '"It is a box of old things for the children of the future," says Ms Rose.' },
            { text: '"Why is it under the clock tower?" asks Lina.' },
            { text: '"Because it is a safe place," says Ms Rose.' },
            { text: 'Sam is looking at his old key. "I think this key opens the small door!" he says.' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch9-4', n: 4, type: 'choice', abc: true, title: 'Read and circle a, b or c.',
          items: [
            { q: 'What day is it?', options: ['Monday', 'Wednesday', 'Saturday'], answer: 'Monday' },
            { q: 'In the story, it is ...', options: ['raining', 'very hot', 'evening'], answer: 'raining' },
            { q: 'Who is sitting at the desk?', options: ['Ms Rose', 'Lina', 'a man'], answer: 'Ms Rose' },
          ],
        },
        {
          id: 'ch9-5', n: 5, type: 'write', title: 'Answer the questions. Write a short answer.',
          items: [
            { prompt: 'Who has a box in the picture?', answer: 'a boy', keywords: ['boy'] },
            { prompt: 'What are the friends looking for?', answer: 'a book about the clock tower', keywords: ['book'] },
            { prompt: 'Where is the time capsule?', answer: 'under the clock tower', keywords: ['under', 'tower'] },
            { prompt: 'When can the children open it?', answer: 'in 2026 (now)', keywords: [['2026', 'now']] },
            { prompt: 'Why is it under the clock tower?', answer: 'Because it is a safe place.', keywords: ['safe'] },
          ],
        },
        {
          id: 'ch9-6', n: 6, type: 'sequence', title: 'Put the story in order. Write 1 to 5.',
          events: ['Ben reads the words under the picture.', 'The friends walk to the library.', 'Sam looks at his old key.', 'Ms Rose opens a big, old book.', 'They look at a picture of the clock tower.'],
          order: [4, 1, 5, 2, 3],
        },
        {
          id: 'ch9-7', n: 7, type: 'open', title: 'Think! Answer in a sentence.',
          frames: [
            { before: '1. What does Sam think about the old key?' },
            { before: '2. Who is the boy in the picture? Guess!' },
          ],
          model: '1. He thinks the key opens the small door behind the clock tower. 2. Any guess is fine! (Chapter 10 gives the answer.)',
        },
      ],
    },
    {
      title: 'Grammar: She is reading (now)',
      activities: [
        {
          id: 'ch9-grammar', type: 'info', title: 'Grammar: She is reading (now)',
          blocks: [
            { kind: 'p', text: 'We use **am / is / are + verb-ing** for things happening now.' },
            { kind: 'list', items: ['I am reading. She is writing. They are walking.', "Not: She isn't writing. Question: Is she reading? Yes, she is. / No, she isn't."] },
            { kind: 'pics', items: ACTIONS.map((a) => ({ img: a === 'read' ? 'i-read' : a, text: a })) },
            {
              kind: 'table', head: ['Spelling', 'Example', 'Rule'],
              rows: [
                ['most words', 'read → reading, play → playing', 'add -ing'],
                ['words with e at the end', 'write → writing, smile → smiling', 'take away the e, add -ing'],
                ['short words like sit', 'sit → sitting, run → running, swim → swimming', 'double the last letter'],
              ],
            },
            { kind: 'note', text: '**Every day or now?** Every day: I walk to school. Now: I am walking to school.' },
            { kind: 'mistakes', pairs: [['She reading.', 'She is reading.'], ['They is walking.', 'They are walking.'], ['I am writeing.', 'I am writing.']] },
            { kind: 'table', head: ['Who?', 'What?', 'Where?', 'When?', 'Why?'], rows: [['a person', 'a thing', 'a place', 'a time', 'a reason (because ...)']] },
          ],
        },
        {
          id: 'ch9-8', n: 8, type: 'gap', title: 'Look at the example. Write the -ing form.',
          context: [{ kind: 'p', text: 'Example: read → **reading**' }],
          items: [
            { text: 'walk → ___', answer: 'walking' },
            { text: 'write → ___', answer: 'writing' },
            { text: 'sit → ___', answer: 'sitting' },
            { text: 'look → ___', answer: 'looking' },
            { text: 'swim → ___', answer: 'swimming' },
            { text: 'smile → ___', answer: 'smiling' },
            { text: 'run → ___', answer: 'running' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch9-9', n: 9, type: 'write', title: 'What are they doing? Look and write.',
          context: [{ kind: 'p', text: 'Example: Ben / swim → **Ben is swimming.**' }],
          items: [
            { img: 'run', prompt: 'Lina / run', answer: ['Lina is running.', "Lina's running."] },
            { img: 'sleep', prompt: 'Dina / sleep', answer: ['Dina is sleeping.', "Dina's sleeping."] },
            { img: 'write', prompt: 'I / write', answer: ['I am writing.', "I'm writing."] },
            { img: 'i-read', prompt: 'Ms Rose / read', answer: ['Ms Rose is reading.'] },
            { img: 'walk', prompt: 'We / walk', answer: ['We are walking.', "We're walking."] },
          ],
        },
        {
          id: 'ch9-10', n: 10, type: 'choice', title: 'Every day or now? Circle the right words.',
          items: [
            { q: 'Every day, Ben ___ football.', options: ['plays', 'is playing'], answer: 'plays' },
            { q: 'Look! Ben ___ football now.', options: ['plays', 'is playing'], answer: 'is playing' },
            { q: 'I ___ to school every day.', options: ['go', 'am going'], answer: 'go' },
            { q: 'Shh! Dina ___ now.', options: ['sleeps', 'is sleeping'], answer: 'is sleeping' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch9-11', n: 11, type: 'open', lines: 3,
          title: 'Look out of your window (or at the picture on the front of this book). What is happening now? Write three sentences.',
          img: 'cover',
          talk: 'What am I doing? Do an action, but don’t speak! Your adult asks: "Are you swimming?" Answer: "No, I’m not." / "Yes, I am!" Then change places.',
          model: 'A man is walking. Two children are playing. A cat is sleeping under a tree. It is raining.',
        },
      ],
    },
    {
      title: 'Chapter 9 Review',
      activities: [
        {
          id: 'ch9-12', n: 12, type: 'gap', review: true, title: 'Write the -ing form.',
          items: [
            { text: 'write → ___', answer: 'writing' },
            { text: 'sit → ___', answer: 'sitting' },
            { text: 'read → ___', answer: 'reading' },
            { text: 'run → ___', answer: 'running' },
          ],
        },
        {
          id: 'ch9-13', n: 13, type: 'gap', review: true, title: 'Write am, is or are + the -ing form.',
          items: [
            { text: 'Lina ___ (read) a book.', answer: 'is reading' },
            { text: 'We ___ (walk) to school.', answer: 'are walking' },
            { text: 'I ___ (write) a letter.', answer: 'am writing' },
            { text: 'It ___ (rain).', answer: 'is raining' },
          ],
        },
        {
          id: 'ch9-14', n: 14, type: 'gap', review: true, title: 'Write the question word.',
          bank: ['Who', 'What', 'Where', 'When', 'Why'],
          items: [
            { text: '___ is the café? It is next to the library.', answer: 'Where' },
            { text: '___ is Ms Rose? She is a woman at the library.', answer: 'Who' },
            { text: '___ is the market? On Saturday.', answer: 'When' },
            { text: '___ is Ben happy? Because he has his cap.', answer: 'Why' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch9-check', [
          'say what is happening now (She is reading).',
          'spell -ing words (writing, sitting).',
          'use who, what, where, when and why.',
          'answer with because.',
        ]),
      ],
    },
  ],
};
