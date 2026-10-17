import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Hello and goodbye',
    words: [
      w('hello', 'hello', 'a word you say when you meet a person', '**Hello!** I am Sam.'),
      w('goodbye', 'goodbye', 'a word you say when you go', '**Goodbye**, Lina!', 'Say: good-BYE'),
      w('name', 'name', 'what people call you', 'My **name** is Sam.', 'Rhymes with game'),
      w('meet', 'meet', 'see and talk to a person for the first time', 'Nice to **meet** you!', 'Rhymes with feet'),
    ],
  },
  {
    title: 'People',
    words: [
      w('boy', 'boy', 'a young male child', 'Sam is a **boy**.'),
      w('girl', 'girl', 'a young female child', 'Lina is a **girl**.', 'Rhymes with curl'),
      w('friend', 'friend', 'a person you like and play with', 'Ben is my **friend**.', 'Say: frend'),
    ],
  },
  {
    title: 'Describing words and places',
    words: [
      w('new', 'new', 'you see it for the first time; it is not old', 'I am **new** in Greenhill.', 'Say: nyoo'),
      w('nice', 'nice', 'good; you like it', 'Greenhill is **nice**.', 'Rhymes with rice'),
      w('happy', 'happy', 'feeling good', 'We are **happy**!', 'Say: HAP-ee'),
      w('town', 'town', 'a place with houses, shops and streets', 'Greenhill is a **town**.', 'Rhymes with down'),
    ],
  },
];

const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export default {
  id: 'ch1',
  kind: 'chapter',
  label: 'Chapter 1',
  title: 'Hello, Greenhill!',
  week: 2,
  color: '#2f6fde',
  icon: 'hello',
  intro: 'Meet Sam. He is ten. Sam and his family are new in a town called Greenhill. In this chapter, Sam meets two new friends.',
  goals: ['I can say hello and goodbye.', 'I can say my name and my age.', 'I can use **I am**, **you are**, **he is** and **she is**.', 'I can read a short story.'],
  endGoal: 'At the end of this chapter, you can say hello to a new friend and tell them about you.',
  review: { title: 'Chapter 1 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        {
          id: 'ch1-words', type: 'words', title: 'New Words', groups,
          strip: NUMBERS.map((n, i) => ({ text: `${i + 1} ${n}`, say: n })),
        },
        sayWords('ch1-say', groups, NUMBERS.map((n, i) => ({ text: n, hint: String(i + 1) }))),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch1-1', n: 1, type: 'match', title: 'Look at the pictures. Write the letter.',
          left: ['hello', 'town', 'girl', 'friend', 'boy', 'happy'],
          right: [{ img: 'boy' }, { img: 'happy' }, { img: 'hello' }, { img: 'girl' }, { img: 'town' }, { img: 'friend' }],
          answer: 'cedfab',
        },
        {
          id: 'ch1-2', n: 2, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['name', 'boy', 'girl', 'new', 'happy', 'town'],
          items: [
            { text: 'Lina is a ___.', answer: 'girl' },
            { text: 'Ben is a ___.', answer: 'boy' },
            { text: 'Hello! My ___ is Sam.', answer: 'name' },
            { text: 'I am ___ in Greenhill.', answer: 'new' },
            { text: 'Greenhill is a nice ___.', answer: 'town' },
            { text: 'We are ___!', answer: 'happy' },
          ],
        },
        {
          id: 'ch1-3', n: 3, type: 'gap', title: 'Write the numbers as words.',
          items: [
            { text: '3 → ___', answer: 'three' },
            { text: '7 → ___', answer: 'seven' },
            { text: '10 → ___', answer: 'ten' },
            { text: '11 → ___', answer: 'eleven' },
            { text: '5 → ___', answer: 'five' },
            { text: '12 → ___', answer: 'twelve' },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: ee',
      activities: [
        soundSpot('ch1-sound', 'Read the ee words', 'The letters **ee** say the sound you hear in **see**.',
          ['see', 'meet', 'green', 'three', 'tree', 'feet', 'Greenhill']),
        {
          id: 'ch1-4', n: 4, type: 'tap', title: 'Read. Circle the five ee words.',
          text: 'Sam and Lina meet. They see three green trees.',
          answer: ['meet', 'see', 'three', 'green', 'trees'],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch1-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'Hello, Greenhill!', words: 51,
          adult: 'How to read the story: 1. You read it aloud while the child follows with a finger. 2. Read it together. 3. The child reads alone. Read it again in sessions 4 and 5 and keep the reading record.',
          lines: [
            { text: 'Hello! I am Sam.' },
            { text: 'I am ten. I am a boy.' },
            { text: 'I am new in Greenhill.' },
            { text: 'Greenhill is a nice town.' },
            { text: 'This is Lina.' },
            { text: 'She is a girl. She is ten.' },
            { text: 'This is Ben.' },
            { text: 'He is a boy. He is eleven.' },
            { text: 'Lina and Ben are my new friends.' },
            { text: 'We are happy!' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch1-5', n: 5, type: 'choice', title: 'Read the story again. Circle the right answer.',
          items: [
            { q: 'Sam is ___.', options: ['nine', 'ten', 'eleven'], answer: 'ten' },
            { q: 'Ben is ___.', options: ['ten', 'eleven', 'twelve'], answer: 'eleven' },
            { q: 'Lina is a ___.', options: ['boy', 'girl'], answer: 'girl' },
            { q: 'Greenhill is a ___ town.', options: ['nice', 'new'], answer: 'nice' },
          ],
        },
        {
          id: 'ch1-6', n: 6, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Sam is a girl.', false, 'Sam is a boy.'),
            tf('Lina is ten.', true),
            tf('Ben is a boy.', true),
            tf('Sam is new in Greenhill.', true),
            tf('Sam, Lina and Ben are happy.', true),
          ],
        },
        {
          id: 'ch1-7', n: 7, type: 'choice', title: 'Who is it? Write Sam, Lina or Ben.',
          items: [
            { q: '"I am new in Greenhill."', options: ['Sam', 'Lina', 'Ben'], answer: 'Sam' },
            { q: 'She is ten. She is a girl.', options: ['Sam', 'Lina', 'Ben'], answer: 'Lina' },
            { q: 'He is eleven.', options: ['Sam', 'Lina', 'Ben'], answer: 'Ben' },
          ],
        },
        {
          id: 'ch1-8', n: 8, type: 'write', title: 'Find the word in the story. Write it.',
          items: [
            { prompt: 'a word that means feeling good', answer: 'happy' },
            { prompt: 'a word for a place with houses and streets', answer: 'town' },
            { prompt: 'a word that means good; you like it', answer: 'nice' },
          ],
        },
      ],
    },
    {
      title: 'Grammar: I am, you are, he is, she is',
      activities: [
        {
          id: 'ch1-grammar', type: 'info', title: 'Grammar: I am, you are, he is, she is',
          blocks: [
            { kind: 'p', text: 'We use **am**, **is** and **are** to talk about people and things.' },
            {
              kind: 'table', head: ['Who?', 'am / is / are', 'Short form', 'Example'],
              rows: [
                ['I', 'am', "I'm", 'I am Sam.'],
                ['you', 'are', "you're", 'You are my friend.'],
                ['he', 'is', "he's", 'He is a boy.'],
                ['she', 'is', "she's", 'She is ten.'],
                ['it', 'is', "it's", 'It is a nice town.'],
                ['we', 'are', "we're", 'We are happy.'],
                ['they', 'are', "they're", 'They are my friends.'],
              ],
            },
            { kind: 'note', text: '**he** = a boy or a man. **she** = a girl or a woman. **it** = a thing or a place. **we** = me and other people. **they** = two or more people or things.' },
            { kind: 'note', icon: '⚠️', text: 'Remember: In English, we always need **am**, **is** or **are**. Always write **I** with a big letter.' },
            { kind: 'mistakes', pairs: [['Sam ten.', 'Sam is ten.'], ['I is happy.', 'I am happy.'], ['She are a girl.', 'She is a girl.'], ['i am Sam.', 'I am Sam.']] },
          ],
        },
        {
          id: 'ch1-9', n: 9, type: 'gap', title: 'Look at the example. Write am, is or are.',
          context: [{ kind: 'p', text: 'Example: I **am** Sam.' }],
          bank: ['am', 'is', 'are'],
          items: [
            { text: 'You ___ my friend.', answer: 'are' },
            { text: 'He ___ a boy.', answer: 'is' },
            { text: 'She ___ ten.', answer: 'is' },
            { text: 'We ___ happy.', answer: 'are' },
            { text: 'It ___ a nice town.', answer: 'is' },
            { text: 'They ___ my friends.', answer: 'are' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch1-10', n: 10, type: 'gap', title: 'Write he, she, it, we or they.',
          bank: ['he', 'she', 'it', 'we', 'they'],
          items: [
            { text: 'Ben → ___', answer: 'he' },
            { text: 'Lina → ___', answer: 'she' },
            { text: 'Greenhill → ___', answer: 'it' },
            { text: 'Lina and Ben → ___', answer: 'they' },
            { text: 'Sam and I → ___', answer: 'we' },
            { text: 'the town → ___', answer: 'it' },
          ],
        },
        {
          id: 'ch1-11', n: 11, type: 'order', title: 'Put the words in order. Write the sentence.',
          items: [
            { words: ['am', 'I', 'Sam'], answer: 'I am Sam.' },
            { words: ['ten', 'is', 'She'], answer: 'She is ten.' },
            { words: ['happy', 'are', 'We'], answer: 'We are happy.' },
            { words: ['a', 'boy', 'is', 'He'], answer: 'He is a boy.' },
          ],
        },
        {
          id: 'ch1-12', n: 12, type: 'write', title: 'Find the mistake. Write the sentence again.',
          items: [
            { prompt: 'Ben eleven.', answer: 'Ben is eleven.' },
            { prompt: 'I is new.', answer: ['I am new.', "I'm new."] },
            { prompt: 'They is my friends.', answer: ['They are my friends.', "They're my friends."] },
            { prompt: 'i am happy.', answer: ['I am happy.', "I'm happy."], strict: true, explain: 'Always write I with a big letter.' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch1-13', n: 13, type: 'dialogue', title: 'Talk. Read the dialogue with your adult. Then say it again with your name.',
          roles: ['Sam', 'Lina'],
          lines: [
            { speaker: 'Lina', text: "Hello! I'm Lina. What's your name?" },
            { speaker: 'Sam', text: 'Hi! My name is Sam.' },
            { speaker: 'Lina', text: 'How old are you, Sam?' },
            { speaker: 'Sam', text: "I'm ten. How old are you?" },
            { speaker: 'Lina', text: "I'm ten too! Nice to meet you, Sam." },
            { speaker: 'Sam', text: 'Nice to meet you too. Goodbye!' },
          ],
          talk: 'Now say it again with your adult. Use your own name and age!',
        },
        {
          id: 'ch1-14', n: 14, type: 'open', title: 'Write about you.',
          frames: [
            { before: 'Hello! My name is' },
            { before: 'I am', after: 'years old.' },
            { before: 'I am a', after: '(boy / girl)' },
            { before: 'My town is' },
          ],
          model: 'Hello! My name is Sara. I am ten years old. I am a girl. My town is Muscat.',
        },
      ],
    },
    {
      title: 'Chapter 1 Review',
      activities: [
        {
          id: 'ch1-15', n: 15, type: 'gap', review: true, title: 'Look and write the word.',
          items: [
            { img: 'boy', hint: 'b', answer: 'boy' },
            { img: 'girl', hint: 'g', answer: 'girl' },
            { img: 'happy', hint: 'h', answer: 'happy' },
            { img: 'hello', hint: 'h', answer: 'hello' },
          ],
        },
        {
          id: 'ch1-16', n: 16, type: 'gap', review: true, title: 'Write am, is or are.',
          bank: ['am', 'is', 'are'],
          items: [
            { text: 'Lina ___ ten.', answer: 'is' },
            { text: 'I ___ new.', answer: 'am' },
            { text: 'Ben and Sam ___ friends.', answer: 'are' },
            { text: 'You ___ happy.', answer: 'are' },
          ],
        },
        {
          id: 'ch1-17', n: 17, type: 'mixed', review: true, title: 'Read. Then circle or write the answer.',
          context: [{ kind: 'p', cls: 'reading', text: 'This is Tom. He is twelve. He is new in Greenhill. Tom and Ben are friends.' }],
          items: [
            { kind: 'choice', q: 'Tom is ___.', options: ['ten', 'twelve'], answer: 'twelve' },
            { kind: 'choice', q: 'Tom is a ___.', options: ['boy', 'girl'], answer: 'boy' },
            { kind: 'gap', text: 'Tom and Ben are ___.', answer: 'friends' },
            { kind: 'gap', text: 'Tom is new in ___.', answer: 'Greenhill' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch1-check', [
          'say hello and tell people my name and age.',
          'use am, is and are.',
          'read the story "Hello, Greenhill!".',
          'read and write the numbers 1 to 12.',
        ]),
      ],
    },
  ],
};
