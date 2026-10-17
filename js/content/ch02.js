import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Family',
    words: [
      w('family', 'family', 'a mum, a dad and their children', 'This is my **family**.', 'Say: FAM-i-lee'),
      w('mum', 'mum', 'your mother', 'My **mum** is a teacher.'),
      w('dad', 'dad', 'your father', 'My **dad** is a doctor.'),
      w('sister', 'girl', 'a girl with the same mum and dad as you', 'Dina is my little **sister**.', 'Say: SIS-ter'),
      w('brother', 'boy', 'a boy with the same mum and dad as you', 'I have a **brother**.', 'Say: BRUH-ther'),
      w('gran', 'gran', 'the mother of your mum or dad', 'My **gran** is very nice.'),
    ],
  },
  {
    title: 'Jobs',
    words: [
      w('teacher', 'teacher', 'a person who helps children learn at school', 'My mum is a **teacher**.', 'Say: TEE-cher'),
      w('doctor', 'doctor', 'a person who helps people when they are ill', 'My dad is a **doctor**.', 'Say: DOK-ter'),
    ],
  },
  {
    title: 'Other words',
    words: [
      w('cat', 'max', 'a small animal; it says "meow"', 'Max is our **cat**.'),
      w('photo', 'photo', 'a picture from a camera or a phone', 'Look at this **photo**!', 'Say: FOH-toh'),
      w('little', 'little', 'small; young', 'Dina is **little**. She is six.', 'Say: LIT-ul'),
      w('love', 'love', 'like very, very much', 'I **love** my family.', 'Say: luv'),
    ],
  },
];

export default {
  id: 'ch2',
  kind: 'chapter',
  label: 'Chapter 2',
  title: 'Meet My Family',
  week: 3,
  color: '#e67e22',
  icon: 'family',
  intro: 'Lina is at Sam’s new house. Sam has a photo of his family. Who is in the photo?',
  goals: ['I can name the people in my family.', 'I can use **my, your, his, her, our** and **their**.', "I can use **'s**: Sam's mum.", 'I can read about a family.'],
  endGoal: 'At the end of this chapter, you can show a photo of your family and say who everyone is.',
  review: { title: 'Chapter 2 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch2-words', type: 'words', title: 'New Words', groups },
        sayWords('ch2-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      blocks: [{ kind: 'note', text: "**very** makes a word stronger: nice → very nice. **'s** shows who has it: Sam's mum = the mum of Sam." }],
      activities: [
        {
          id: 'ch2-1', n: 1, type: 'gap', title: "Look at Sam's family tree. Write the words.",
          context: [{ kind: 'img', img: 'family-tree', caption: "Sam's family tree" }],
          bank: ['mum', 'dad', 'sister', 'gran', 'cat'],
          items: [
            { text: "Mona is Sam's ___.", answer: 'gran' },
            { text: "Karim is Sam's ___.", answer: 'dad' },
            { text: "Hana is Sam's ___.", answer: 'mum' },
            { text: "Dina is Sam's ___.", answer: 'sister' },
            { text: "Max is the family's ___.", answer: 'cat' },
          ],
        },
        {
          id: 'ch2-2', n: 2, type: 'sort', title: 'Girls and women, or boys and men? Write the words in the table.',
          words: ['mum', 'dad', 'sister', 'brother', 'gran', 'girl', 'boy'],
          bins: [
            { label: 'girls and women', words: ['mum', 'sister', 'gran', 'girl'] },
            { label: 'boys and men', words: ['dad', 'brother', 'boy'] },
          ],
        },
        {
          id: 'ch2-3', n: 3, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['photo', 'little', 'doctor', 'teacher', 'love', 'cat'],
          items: [
            { text: 'Look at this ___ of my family.', answer: 'photo' },
            { text: 'My dad helps people when they are ill. He is a ___.', answer: 'doctor' },
            { text: 'Max is our ___.', answer: 'cat' },
            { text: 'Dina is six. She is my ___ sister.', answer: 'little' },
            { text: 'I ___ my family!', answer: 'love' },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: magic e',
      activities: [
        soundSpot('ch2-sound', 'Read the magic e words',
          'An **e** at the end of a word is quiet, but it is magic! It makes the vowel say its name: cap → cape · kit → kite · not → note · cub → cube',
          ['cap', 'cape', 'kit', 'kite', 'not', 'note', 'cub', 'cube', 'name', 'game', 'five', 'nine', 'like', 'home', 'Rose']),
        {
          id: 'ch2-4', n: 4, type: 'gap', title: 'Add the magic e. Read both words.',
          items: [
            { text: 'can → ___', answer: 'cane' },
            { text: 'kit → ___', answer: 'kite' },
            { text: 'not → ___', answer: 'note' },
            { text: 'tap → ___', answer: 'tape' },
            { text: 'pin → ___', answer: 'pine' },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch2-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'My Family', words: 110,
          lines: [
            { text: 'Look at this photo. It is my family.' },
            { text: 'This is my dad. His name is Karim. He is a doctor.' },
            { text: 'This is my mum. Her name is Hana. She is a teacher.' },
            { text: 'This is my little sister. Her name is Dina. She is six.' },
            { text: 'This is my gran. Her name is Mona. She is very nice.' },
            { text: 'And this is our cat. His name is Max. He is big!' },
            { text: 'We are a happy family. I love my family!' },
            { speaker: 'Lina', text: 'Your family is nice, Sam! My family is big. I have two brothers. Their names are Adam and Zak. Adam is twelve and Zak is eight. My mum and dad are teachers.' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch2-5', n: 5, type: 'match', title: 'Match the people to the words. Write the letter.',
          left: ['Karim', 'Hana', 'Dina', 'Mona', 'Max'],
          right: ['six', 'a cat', 'a doctor', "Sam's gran", 'a teacher'],
          answer: 'ceadb',
        },
        {
          id: 'ch2-6', n: 6, type: 'choice', abc: true, title: 'Read and circle a, b or c.',
          items: [
            { q: 'Who is Hana?', options: ["Sam's sister", "Sam's mum", "Sam's gran"], answer: "Sam's mum" },
            { q: 'How old is Dina?', options: ['six', 'eight', 'twelve'], answer: 'six' },
          ],
        },
        {
          id: 'ch2-7', n: 7, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf("Sam's dad is a teacher.", false, 'He is a doctor.'),
            tf('Max is a cat.', true),
            tf("Sam's gran is very nice.", true),
            tf("Lina's mum and dad are doctors.", false, 'They are teachers.'),
          ],
        },
      ],
    },
    {
      title: 'Grammar: my, your, his, her, our, their',
      activities: [
        {
          id: 'ch2-grammar', type: 'info', title: 'Grammar: my, your, his, her, our, their',
          blocks: [
            { kind: 'p', text: 'We use these words to say who has something.' },
            {
              kind: 'table', head: ['Who?', 'Whose?', 'Example'],
              rows: [
                ['I', 'my', 'This is my cat.'],
                ['you', 'your', 'What is your name?'],
                ['he', 'his', 'This is Dad. His name is Karim.'],
                ['she', 'her', 'This is Mum. Her name is Hana.'],
                ['it', 'its', 'The cat is big. Its name is Max.'],
                ['we', 'our', 'Our house is new.'],
                ['they', 'their', 'Their names are Adam and Zak.'],
              ],
            },
            { kind: 'note', text: "**his** = for a boy or a man · **her** = for a girl or a woman · **'s** = who has it: Sam's mum, Lina's brothers." },
            { kind: 'mistakes', pairs: [['He name is Karim.', 'His name is Karim.'], ['This is my sister. His name is Dina.', 'Her name is Dina.'], ['My sister name is Dina.', "My sister's name is Dina."]] },
          ],
        },
        {
          id: 'ch2-8', n: 8, type: 'gap', title: 'Look at the example. Write his or her.',
          context: [{ kind: 'p', text: 'Example: This is my dad. **His** name is Karim.' }],
          bank: ['His', 'Her'],
          items: [
            { text: 'This is my mum. ___ name is Hana.', answer: 'Her' },
            { text: 'This is Lina. ___ brothers are Adam and Zak.', answer: 'Her' },
            { text: 'This is Ben. ___ friend is Sam.', answer: 'His' },
            { text: 'This is Gran. ___ name is Mona.', answer: 'Her' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch2-9', n: 9, type: 'choice', title: 'Circle the right word.',
          items: [
            { q: 'I am Sam. ___ sister is Dina.', options: ['My', 'Your'], answer: 'My' },
            { q: 'Lina, what is ___ name?', options: ['your', 'my'], answer: 'your' },
            { q: 'We have a cat. ___ cat is Max.', options: ['Our', 'Their'], answer: 'Our' },
            { q: 'Adam and Zak are brothers. ___ sister is Lina.', options: ['Our', 'Their'], answer: 'Their' },
            { q: 'Dina is six. ___ brother is Sam.', options: ['His', 'Her'], answer: 'Her' },
          ],
        },
        {
          id: 'ch2-10', n: 10, type: 'gap', title: 'Write my, your, his, her, our or their.',
          bank: ['My', 'Your', 'His', 'Her', 'Our', 'Their'],
          items: [
            { text: 'I have a sister. ___ sister is six.', answer: 'My' },
            { text: 'Ben has a friend. ___ friend is Sam.', answer: 'His' },
            { text: 'We have a cat. ___ cat is big.', answer: 'Our' },
            { text: 'Adam and Zak have a sister. ___ sister is Lina.', answer: 'Their' },
            { text: 'Lina has a photo. ___ photo is nice.', answer: 'Her' },
          ],
        },
        {
          id: 'ch2-11', n: 11, type: 'write', title: "Use 's. Write the words.",
          items: [
            { prompt: 'the mum of Sam →', answer: "Sam's mum" },
            { prompt: 'the cat of Lina →', answer: "Lina's cat" },
            { prompt: 'the brother of Zak →', answer: "Zak's brother" },
            { prompt: 'the photo of Dina →', answer: "Dina's photo" },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch2-12', n: 12, type: 'open', title: 'Draw your family (or stick a photo). Then write about them.',
          frames: [
            { before: 'This is my' },
            { before: 'His / Her name is' },
            { before: 'He / She is' },
            { before: 'I love my' },
          ],
          talk: 'Show your picture to your adult. Say: "This is my ... His / Her name is ..."',
          model: 'This is my mum. Her name is Salma. She is a teacher. This is my brother. His name is Omar. I love my family.',
        },
      ],
    },
    {
      title: 'Chapter 2 Review',
      activities: [
        {
          id: 'ch2-13', n: 13, type: 'gap', review: true, title: 'Look and write the family word.',
          items: [
            { img: 'mum', hint: 'm', answer: 'mum' },
            { img: 'dad', hint: 'd', answer: 'dad' },
            { img: 'gran', hint: 'g', answer: 'gran' },
            { img: 'girl', hint: 's', answer: 'sister' },
          ],
        },
        {
          id: 'ch2-14', n: 14, type: 'choice', review: true, title: 'Circle the right word.',
          items: [
            { q: 'This is Ben. ___ friend is Sam.', options: ['His', 'Her'], answer: 'His' },
            { q: 'Lina is ten. ___ brother is Zak.', options: ['His', 'Her'], answer: 'Her' },
            { q: 'We are a family. ___ house is new.', options: ['Our', 'Their'], answer: 'Our' },
            { q: 'Sam and Dina have a cat. ___ cat is Max.', options: ['Our', 'Their'], answer: 'Their' },
          ],
        },
        {
          id: 'ch2-15', n: 15, type: 'gap', review: true, title: 'Read. Then write the answer.',
          context: [{ kind: 'p', cls: 'reading', text: 'This is Nora. She is nine. Her brother is Leo. He is five. Their dad is a doctor. Their mum is a teacher.' }],
          items: [
            { text: 'Nora is ___.', answer: ['nine', '9', 'nine years old'] },
            { text: 'Her brother is ___.', answer: 'Leo' },
            { text: 'Leo is ___.', answer: ['five', '5', 'five years old'] },
            { text: 'Their dad is a ___.', answer: 'doctor' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch2-check', [
          'name the people in my family.',
          'use my, your, his, her, our and their.',
          "use 's (Sam's mum).",
          'read the story "My Family".',
        ]),
      ],
    },
  ],
};
