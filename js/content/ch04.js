import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck } from './helpers.js';

const groups = [
  {
    title: 'Things',
    words: [
      w('pencil case', 'pencil-case', 'a small bag for pens and pencils', 'My **pencil case** is blue.', 'Say: PEN-sul kays'),
      w('cap', 'cap', 'a hat with a long front', "Ben's **cap** is blue."),
      w('ball', 'ball', 'you play football with it', 'Is this your **ball**?', 'Rhymes with tall'),
      w('lunch box', 'lunch-box', 'a box for your food at school', 'My **lunch box** is green.'),
      w('key', 'key', 'you open a door with it', 'This is an old **key**.', 'Rhymes with tea'),
      w('door', 'door', 'you open it and go into a room', 'Close the **door**, please.', 'Rhymes with four'),
      w('box', 'box', 'you put things in it', 'The **box** is big.'),
    ],
  },
  {
    title: 'Describing words',
    words: [
      w('big', 'big', 'not small', 'My bag is **big**.'),
      w('small', 'small', 'not big', 'The key is **small**.', 'Say: smawl'),
      w('old', 'old', 'not new', 'The key is very **old**.', 'Rhymes with gold'),
      w('lost', 'lost', 'you do not know where it is', 'My pencil case is **lost**!'),
    ],
  },
];

const YES_NO = ['Yes, it is.', "No, it isn't."];

export default {
  id: 'ch4',
  kind: 'chapter',
  label: 'Chapter 4',
  title: 'Lost and Found',
  week: 5,
  color: '#8e44ad',
  icon: 'key',
  intro: "Oh no! Sam's pencil case is not in his bag. Sam and Ben look in the school's Lost and Found box. What is in the box? Something very old!",
  goals: ['I can say if things are big, small, old or new.', "I can say **isn't** and **aren't**: It isn't my bag.", "I can ask and answer: Is it your bag? Yes, it is. / No, it isn't.", 'I can use **this, that, these** and **those**.'],
  endGoal: 'At the end of this chapter, you can ask "Is this your …?" and answer.',
  review: { title: 'Chapter 4 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch4-words', type: 'words', title: 'New Words', groups },
        sayWords('ch4-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch4-1', n: 1, type: 'gap', title: 'Look and write the word.',
          items: [
            { img: 'key', hint: 'k', answer: 'key' },
            { img: 'cap', hint: 'c', answer: 'cap' },
            { img: 'ball', hint: 'b', answer: 'ball' },
            { img: 'door', hint: 'd', answer: 'door' },
            { img: 'box', hint: 'b', answer: 'box' },
            { img: 'lunch-box', hint: 'l… b', answer: ['lunch box', 'lunchbox'] },
          ],
        },
        {
          id: 'ch4-2', n: 2, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['lost', 'old', 'key', 'small', 'door'],
          items: [
            { text: 'My pencil case is not in my bag. It is ___!', answer: 'lost' },
            { text: 'This ___ is for the door.', answer: 'key' },
            { text: 'Gran is not young. She is ___.', answer: 'old' },
            { text: 'A ball is big. An eraser is ___.', answer: 'small' },
            { text: 'Open the ___ and come in.', answer: 'door' },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: ai and ay',
      activities: [
        soundSpot('ch4-sound', 'Read the ai and ay words', '**ai** and **ay** say the sound in **day**. We use **ai** in the middle of a word and **ay** at the end.',
          ['rain', 'train', 'wait', 'paint', 'day', 'play', 'say', 'way', 'today', 'Monday']),
        {
          id: 'ch4-3', n: 3, type: 'gap', title: 'Write ai or ay.',
          bank: ['ai', 'ay'],
          items: [
            { text: 'r___n', answer: 'ai' },
            { text: 'd___', answer: 'ay' },
            { text: 'pl___', answer: 'ay' },
            { text: 'tr___n', answer: 'ai' },
            { text: 'w___t', answer: 'ai' },
            { text: 's___', answer: 'ay' },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch4-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'Lost and Found', words: 139,
          helpers: 'Lost and Found = a box for lost things · Oh no! = something is bad · a key for a door = a key to open a door',
          lines: [
            { text: 'It is lunch time at Greenhill School. Sam is not happy.' },
            { speaker: 'Sam', text: 'Oh no! My pencil case is lost!' },
            { speaker: 'Ben', text: 'Is it in your desk?' },
            { speaker: 'Sam', text: "No, it isn't." },
            { speaker: 'Ben', text: 'Look! This is the Lost and Found box. Is that your pencil case?' },
            { speaker: 'Sam', text: "No, it isn't. That pencil case is small and green. My pencil case is big and blue." },
            { speaker: 'Ben', text: 'Hey! This is my cap! Thank you, box!' },
            { speaker: 'Sam', text: 'And what is this? It is a key. It is very old. Is it your key, Ben?' },
            { speaker: 'Ben', text: "No, it isn't. Look! It has four numbers on it: 1, 9, 7, 6." },
            { speaker: 'Mrs Green', text: "It isn't my key, Sam. Is it a key for a door? Is it a key for a box?" },
            { speaker: 'Lina', text: 'Sam! Is this your pencil case? It is on my chair.' },
            { speaker: 'Sam', text: 'Yes, it is! Thank you, Lina!' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch4-4', n: 4, type: 'choice', title: "Answer with Yes, it is. or No, it isn't.",
          items: [
            { q: "Is Sam's pencil case in his desk?", options: YES_NO, answer: "No, it isn't." },
            { q: "Is Sam's pencil case big and blue?", options: YES_NO, answer: 'Yes, it is.' },
            { q: "Is the cap in the box Ben's cap?", options: YES_NO, answer: 'Yes, it is.' },
            { q: 'Is the key new?', options: YES_NO, answer: "No, it isn't.", why: 'It is very old.' },
            { q: "Is the key Mrs Green's key?", options: YES_NO, answer: "No, it isn't." },
          ],
        },
        {
          id: 'ch4-5', n: 5, type: 'choice', title: 'Who says it? Write Sam, Ben, Lina or Mrs Green.',
          items: [
            { q: '"Is it in your desk?"', options: ['Sam', 'Ben', 'Lina', 'Mrs Green'], answer: 'Ben' },
            { q: '"It is on my chair."', options: ['Sam', 'Ben', 'Lina', 'Mrs Green'], answer: 'Lina' },
            { q: '"My pencil case is lost!"', options: ['Sam', 'Ben', 'Lina', 'Mrs Green'], answer: 'Sam' },
            { q: '"Is it a key for a door?"', options: ['Sam', 'Ben', 'Lina', 'Mrs Green'], answer: 'Mrs Green' },
          ],
        },
        {
          id: 'ch4-6', n: 6, type: 'sequence', title: 'Put the story in order. Write 1, 2, 3 and 4.',
          events: ['Sam has an old key.', "Sam's pencil case is lost.", "Lina has Sam's pencil case.", "Ben's cap is in the box."],
          order: [3, 1, 4, 2],
        },
      ],
    },
    {
      title: "Grammar: isn't, aren't and questions",
      activities: [
        {
          id: 'ch4-grammar', type: 'info', title: "Grammar: isn't, aren't and questions",
          blocks: [
            {
              kind: 'list',
              items: [
                "Not sentences: I am not (**I'm not**) · he / she / it is not (**isn't**) · you / we / they are not (**aren't**).",
                'Questions: put am / is / are first. It is your bag. → **Is it** your bag?',
                "Short answers: Yes, it is. / No, it isn't. · Yes, they are. / No, they aren't. · Yes, I am. / No, I'm not.",
              ],
            },
            {
              kind: 'table', head: ['✓', '✗ (not)', '?', 'Short answers'],
              rows: [
                ['I am ten.', "I'm not ten.", 'Am I ten?', "Yes, you are. / No, you aren't."],
                ['It is a key.', "It isn't a key.", 'Is it a key?', "Yes, it is. / No, it isn't."],
                ['They are new.', "They aren't new.", 'Are they new?', "Yes, they are. / No, they aren't."],
              ],
            },
            { kind: 'mistakes', pairs: [['It not my bag.', "It isn't my bag."], ['Your bag is it?', 'Is it your bag?'], ["Yes, it's.", 'Yes, it is.']] },
            { kind: 'p', text: '**this, that, these, those**' },
            { kind: 'table', head: ['', 'near (here)', 'far (there)'], rows: [['one', 'this pen', 'that pen'], ['two or more', 'these pens', 'those pens']] },
          ],
        },
        {
          id: 'ch4-7', n: 7, type: 'gap', title: 'Look at the example. Make it a not sentence.',
          context: [{ kind: 'p', text: "Example: It is my key. → It **isn't** my key." }],
          items: [
            { text: 'I am eleven. → I ___ eleven.', answer: ['am not'] },
            { text: 'The cap is red. → The cap ___ red.', answer: ["isn't", 'is not'] },
            { text: 'They are my pencils. → They ___ my pencils.', answer: ["aren't", 'are not'] },
            { text: 'We are at home. → We ___ at home.', answer: ["aren't", 'are not'] },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch4-8', n: 8, type: 'write', title: 'Make questions.',
          context: [{ kind: 'p', text: 'Example: It is your bag. → **Is it your bag?**' }],
          items: [
            { prompt: 'Ben is eleven.', answer: 'Is Ben eleven?' },
            { prompt: 'They are new.', answer: 'Are they new?' },
            { prompt: 'You are ten.', answer: 'Are you ten?' },
            { prompt: 'The key is old.', answer: 'Is the key old?' },
          ],
        },
        {
          id: 'ch4-9', n: 9, type: 'choice', title: 'Circle the right word.',
          items: [
            { q: '___ pencils are new.', options: ['This', 'These'], answer: 'These' },
            { q: 'Look over there! ___ is my cap.', options: ['That', 'Those'], answer: 'That' },
            { q: '___ is my desk.', options: ['This', 'These'], answer: 'This' },
            { q: '___ books over there are big.', options: ['That', 'Those'], answer: 'Those' },
          ],
        },
        {
          id: 'ch4-10', n: 10, type: 'gap', title: 'Complete the dialogue.',
          bank: ['Is', "isn't", 'Are', 'are'],
          items: [
            { text: 'Ben: ___ this your ruler?', answer: 'Is' },
            { text: 'Sam: No, it ___. My ruler is blue.', answer: "isn't" },
            { text: 'Ben: ___ these your books?', answer: 'Are' },
            { text: 'Sam: Yes, they ___! Thank you!', answer: 'are' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch4-11', n: 11, type: 'open', title: 'Write a LOST notice.',
          frames: [
            { before: 'LOST! My', after: 'is lost.' },
            { before: 'It is', hint: 'red and small', after: '(colour) and (big / small).' },
            { before: "It isn't" },
            { before: 'Please help! My name is' },
          ],
          talk: 'Your adult puts a thing in a bag. Ask: "Is it a pen?" Your adult answers: "No, it isn’t." Ask again! Then change places.',
          model: "LOST! My cap is lost. It is red and small. It isn't new. Please help! My name is Yusuf.",
        },
      ],
    },
    {
      title: 'Chapter 4 Review',
      activities: [
        {
          id: 'ch4-12', n: 12, type: 'gap', review: true, title: 'Look and write the word.',
          items: [
            { img: 'key', hint: 'k', answer: 'key' },
            { img: 'cap', hint: 'c', answer: 'cap' },
            { img: 'ball', hint: 'b', answer: 'ball' },
            { img: 'door', hint: 'd', answer: 'door' },
          ],
        },
        {
          id: 'ch4-13', n: 13, type: 'write', review: true, title: 'Write the not sentence or the question.',
          items: [
            { prompt: 'It is my bag. (not)', answer: ["It isn't my bag.", 'It is not my bag.'] },
            { prompt: 'They are old. (?)', answer: 'Are they old?' },
            { prompt: 'I am happy. (not)', answer: ["I'm not happy.", 'I am not happy.'] },
            { prompt: 'He is ten. (?)', answer: 'Is he ten?' },
          ],
        },
        {
          id: 'ch4-14', n: 14, type: 'choice', review: true, title: "Read. Answer with Yes, it is. or No, it isn't.",
          context: [{ kind: 'p', cls: 'reading', text: "This is Dina's lunch box. It is small and pink. It isn't new. It is in her school bag." }],
          items: [
            { q: "Is Dina's lunch box big?", options: YES_NO, answer: "No, it isn't." },
            { q: 'Is it pink?', options: YES_NO, answer: 'Yes, it is.' },
            { q: 'Is it new?', options: YES_NO, answer: "No, it isn't." },
            { q: 'Is it in her school bag?', options: YES_NO, answer: 'Yes, it is.' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch4-check', [
          'say big, small, old and new.',
          "use isn't and aren't.",
          'ask and answer: Is it ...? Yes, it is.',
          'use this, that, these and those.',
          'read the story "Lost and Found".',
        ]),
      ],
    },
  ],
};
