import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const COLOURS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'black', 'white'];

const groups = [
  {
    title: 'In the classroom',
    words: [
      w('school', 'school', 'a place where children learn', 'Greenhill **School** is big.', 'Say: skool'),
      w('classroom', 'classroom', 'a room in a school for one class', 'My **classroom** is nice.', 'Say: KLAHS-room'),
      w('desk', 'desk', 'a table for school work', 'My **desk** is new.'),
      w('chair', 'chair', 'you sit on it', 'This is my **chair**.', 'Rhymes with hair'),
      w('board', 'board', 'the teacher writes on it in the classroom', 'Look at the **board**.', 'Rhymes with door'),
      w('window', 'window', 'you look out of it', 'The **window** is big.', 'Say: WIN-doh'),
    ],
  },
  {
    title: 'In my bag',
    words: [
      w('bag', 'bag', 'you put your books in it', 'My **bag** is blue.'),
      w('book', 'book', 'you read it', 'I have a new **book**.', 'Rhymes with look'),
      w('pen', 'pen', 'you write with it', 'This is a **pen**.'),
      w('pencil', 'pencil', 'you write or draw with it', 'My **pencil** is red.', 'Say: PEN-sul'),
      w('eraser', 'eraser', 'it takes away pencil mistakes', 'I have an **eraser**.', 'Say: ih-RAY-zer'),
      w('ruler', 'ruler', 'you draw lines with it', 'This is a **ruler**.', 'Say: ROO-ler'),
    ],
  },
];

export default {
  id: 'ch3',
  kind: 'chapter',
  label: 'Chapter 3',
  title: 'My New School',
  week: 4,
  color: '#27ae60',
  icon: 'school',
  intro: 'Today is Sam’s first day at Greenhill School. Who is his teacher? Is Lina in his class? And what is in his school bag?',
  goals: ['I can name things in a classroom and in my school bag.', 'I can use **a** and **an**: a pen, an eraser.', 'I can make plurals: one book, two books.', 'I can say colours.'],
  endGoal: 'At the end of this chapter, you can talk about your classroom and your school bag.',
  review: { title: 'Chapter 3 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        {
          id: 'ch3-words', type: 'words', title: 'New Words', groups,
          strip: COLOURS.map((c) => ({ text: c, img: `c-${c}` })),
        },
        sayWords('ch3-say', groups, COLOURS.map((c) => ({ text: c, img: `c-${c}` }))),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch3-1', n: 1, type: 'match', title: 'Look at the pictures. Write the letter.',
          left: ['pencil', 'chair', 'book', 'bag', 'ruler', 'desk'],
          right: ['bag', 'ruler', 'pencil', 'chair', 'book', 'desk'].map((x) => ({ img: x })),
          answer: 'cdeabf',
        },
        {
          id: 'ch3-2', n: 2, type: 'gap', title: 'What colour is it? Write the colour word.',
          items: [
            { img: 'c-blue', hint: 'b', answer: 'blue' },
            { img: 'c-green', hint: 'g', answer: 'green' },
            { img: 'c-yellow', hint: 'y', answer: 'yellow' },
            { img: 'c-black', hint: 'b', answer: 'black' },
            { img: 'c-orange', hint: 'o', answer: 'orange' },
            { img: 'c-brown', hint: 'b', answer: 'brown' },
          ],
        },
        {
          id: 'ch3-3', n: 3, type: 'open', title: 'Write about two things in your classroom or bag. Use a colour.',
          frames: [{ before: 'My', hint: 'bag is blue.' }, { before: 'My', hint: 'desk is brown.' }],
          model: 'My bag is blue. My desk is brown.',
        },
      ],
    },
    {
      title: 'Sound Spot: oo',
      activities: [
        soundSpot('ch3-sound', 'Read the oo words', 'The letters **oo** have two sounds: **oo** as in book (look · good · cook · foot) and **oo** as in school (room · too · food · moon).',
          ['book', 'look', 'good', 'cook', 'foot', 'school', 'room', 'too', 'food', 'moon']),
        {
          id: 'ch3-4', n: 4, type: 'tap', title: 'Read the sentence. Circle the four oo words.',
          text: 'Look at my good book. It is in my school bag.',
          answer: ['Look', 'good', 'book', 'school'],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch3-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'My First Day', words: 115,
          helpers: 'today = this day · first day = day number 1 · class = the children in a classroom · Welcome! = We are happy you are here.',
          lines: [
            { text: 'Today is my first day at Greenhill School.' },
            { text: 'My classroom is big and nice. The windows are big too.' },
            { text: 'My teacher is Mrs Green. She is very nice.' },
            { text: 'Her desk is big and her chair is red.' },
            { speaker: 'Mrs Green', text: 'Hello, Sam. Welcome to our class!' },
            { text: 'Lina is in my class! I am very happy.' },
            { text: 'My desk is new and my chair is new too.' },
            { text: 'Look in my bag! I have a book, an eraser, a ruler, two pens and three pencils.' },
            { text: 'My pencils are red, blue and green. My book is red too.' },
            { text: 'My eraser is pink and blue. My bag is new. It is blue and black.' },
            { text: 'I am happy at my new school.' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch3-5', n: 5, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf("Sam's classroom is big.", true),
            tf("Mrs Green is Sam's teacher.", true),
            tf("Lina is in Sam's class.", true),
            tf('Sam has four pencils.', false, 'He has three pencils.'),
          ],
        },
        {
          id: 'ch3-6', n: 6, type: 'choice', abc: true, title: 'Read and circle a, b or c.',
          items: [
            { q: "Sam's teacher is ...", options: ['Mrs Green', 'Lina', 'Dina'], answer: 'Mrs Green' },
            { q: "How many pens are in Sam's bag?", options: ['one', 'two', 'three'], answer: 'two' },
            { q: "What colour is Sam's eraser?", options: ['red and blue', 'pink and blue', 'green'], answer: 'pink and blue' },
          ],
        },
        {
          id: 'ch3-7', n: 7, type: 'multi', title: "What is in Sam's bag? Tick (✓) the boxes.",
          options: ['book', 'pencil', 'chair', 'pen', 'ruler', 'ball', 'eraser'].map((x) => ({ img: x, label: x })),
          answer: [0, 1, 3, 4, 6],
        },
        {
          id: 'ch3-8', n: 8, type: 'choice', abc: true, title: 'In the story, what does classroom mean? Circle a, b or c.',
          items: [{ q: 'classroom', options: ['a room for a class', 'a big bag', 'a teacher'], answer: 'a room for a class' }],
        },
      ],
    },
    {
      title: 'Grammar: a, an and plurals',
      activities: [
        {
          id: 'ch3-grammar', type: 'info', title: 'Grammar: a, an and plurals',
          blocks: [
            {
              kind: 'list',
              items: [
                'Use **a** or **an** for one thing.',
                'Use **an** before a, e, i, o, u: an apple, an egg, an eraser, an orange, an umbrella.',
                'Use **a** before other letters: a book, a pen, a desk.',
                'For two or more, add **-s**: book → books. After s, x, ch, sh, add **-es**: bus → buses, box → boxes.',
                'Some words change: child → children, man → men, woman → women.',
              ],
            },
            {
              kind: 'table', head: ['one', 'two or more'],
              rows: [['a book', 'two books'], ['a pen', 'three pens'], ['an eraser', 'four erasers'], ['a bus', 'two buses'], ['a box', 'five boxes'], ['a child', 'six children']],
            },
            { kind: 'note', text: '**the** = we know which one: Look at the board. Open the window.' },
            { kind: 'mistakes', pairs: [['a eraser', 'an eraser'], ['two pencil', 'two pencils'], ['a books', 'a book / books'], ['an pen', 'a pen']] },
          ],
        },
        {
          id: 'ch3-9', n: 9, type: 'gap', title: 'Look at the example. Write a or an.',
          context: [{ kind: 'p', text: 'Example: **an** eraser' }],
          bank: ['a', 'an'],
          items: [
            { text: '___ book', answer: 'a' },
            { text: '___ apple', answer: 'an' },
            { text: '___ desk', answer: 'a' },
            { text: '___ egg', answer: 'an' },
            { text: '___ ruler', answer: 'a' },
            { text: '___ orange', answer: 'an' },
            { text: '___ umbrella', answer: 'an' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch3-10', n: 10, type: 'gap', title: 'Write the plural.',
          items: [
            { text: 'pen → ___', answer: 'pens' },
            { text: 'chair → ___', answer: 'chairs' },
            { text: 'bus → ___', answer: 'buses' },
            { text: 'box → ___', answer: 'boxes' },
            { text: 'book → ___', answer: 'books' },
            { text: 'child → ___', answer: 'children' },
            { text: 'girl → ___', answer: 'girls' },
            { text: 'class → ___', answer: 'classes' },
          ],
        },
        {
          id: 'ch3-11', n: 11, type: 'gap', title: 'Look and write. Use a, an or a number.',
          items: [
            { img: { img: 'book', count: 3 }, answer: ['three books', '3 books'] },
            { img: { img: 'pencil', count: 2 }, answer: ['two pencils', '2 pencils'] },
            { img: 'apple', answer: 'an apple' },
            { img: { img: 'chair', count: 4 }, answer: ['four chairs', '4 chairs'] },
            { img: 'egg', answer: 'an egg' },
            { img: { img: 'box', count: 2 }, answer: ['two boxes', '2 boxes'] },
          ],
        },
        {
          id: 'ch3-12', n: 12, type: 'write', title: 'Find the mistake. Write the sentence again.',
          items: [
            { prompt: 'I have a eraser.', answer: 'I have an eraser.' },
            { prompt: 'My two pencil are blue.', answer: 'My two pencils are blue.' },
            { prompt: 'This is an book.', answer: 'This is a book.' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch3-13', n: 13, type: 'open', title: 'What is in your school bag? Write. Use a, an and numbers.',
          frames: [
            { before: 'In my bag, I have' },
            { before: '', hint: 'another sentence' },
            { before: 'My bag is', after: '(colour)' },
            { before: 'My pencils are', after: '(colour)' },
          ],
          model: 'In my bag, I have a book, an eraser, a ruler and three pencils. My bag is black. My pencils are yellow.',
        },
        {
          id: 'ch3-14', n: 14, type: 'dialogue', title: 'Talk. Walk around your room with your adult. Point and say.',
          roles: ['You'],
          lines: [
            { speaker: 'You', text: 'This is a chair. It is brown.' },
            { speaker: 'Adult', text: 'Find something blue!' },
            { speaker: 'You', text: 'A blue pen! Two blue books!' },
          ],
          talk: 'Now walk around your room. Point to real things and say what they are, with a / an, numbers and colours.',
        },
      ],
    },
    {
      title: 'Chapter 3 Review',
      activities: [
        {
          id: 'ch3-15', n: 15, type: 'gap', review: true, title: 'Write a or an.',
          bank: ['a', 'an'],
          items: [
            { text: '___ apple', answer: 'an' },
            { text: '___ chair', answer: 'a' },
            { text: '___ eraser', answer: 'an' },
            { text: '___ pencil', answer: 'a' },
          ],
        },
        {
          id: 'ch3-16', n: 16, type: 'gap', review: true, title: 'Write the plural.',
          items: [
            { text: 'book → ___', answer: 'books' },
            { text: 'box → ___', answer: 'boxes' },
            { text: 'child → ___', answer: 'children' },
            { text: 'window → ___', answer: 'windows' },
          ],
        },
        {
          id: 'ch3-17', n: 17, type: 'gap', review: true, title: 'Read. Then write the answer.',
          context: [{ kind: 'p', cls: 'reading', text: "This is Leo's classroom. It is big and nice. Leo has a red desk and a blue chair. In his bag, he has two books and an orange pencil." }],
          items: [
            { text: 'His desk is ___.', answer: 'red' },
            { text: 'His chair is ___.', answer: 'blue' },
            { text: 'He has ___ books.', answer: ['two', '2'] },
            { text: 'His pencil is ___.', answer: 'orange' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch3-check', [
          'name things in a classroom and in my bag.',
          'use a and an.',
          'make plurals (books, boxes, children).',
          'say colours.',
          'read the story "My First Day".',
        ]),
      ],
    },
  ],
};
