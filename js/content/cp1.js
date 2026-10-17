import { CHECKPOINT_BANDS, CHECKPOINT_NEXT, tf } from './helpers.js';

export default {
  id: 'cp1',
  kind: 'checkpoint',
  label: 'Checkpoint 1',
  title: 'Review of Chapters 1–3',
  week: 4,
  color: '#c0392b',
  icon: 'star',
  intro: 'Well done! You are at the end of Chapter 3. Now look back at Chapters 1, 2 and 3. Do your best, and then check your answers with your adult.',
  adult: 'Week 4, session 5. About 25 minutes. The child works alone; help only with instructions. The app marks Parts A–C; you give the points for Part D in grown-up mode.',
  review: { title: 'Checkpoint 1', bands: CHECKPOINT_BANDS, next: CHECKPOINT_NEXT },
  sections: [
    {
      title: 'Part A: Words',
      activities: [
        {
          id: 'cp1-1', n: 1, type: 'match', review: true, title: 'Look at the pictures. Write the letter.',
          left: ['school', 'happy', 'photo', 'gran', 'chair', 'friend', 'ruler', 'doctor'],
          right: ['friend', 'gran', 'doctor', 'school', 'ruler', 'happy', 'chair', 'photo'].map((x) => ({ img: x })),
          answer: 'dfhbgaec',
        },
      ],
    },
    {
      title: 'Part B: Grammar',
      activities: [
        {
          id: 'cp1-2', n: 2, type: 'gap', review: true, title: 'Write am, is or are.',
          bank: ['am', 'is', 'are'],
          items: [
            { text: 'Ben ___ eleven.', answer: 'is' },
            { text: 'I ___ happy.', answer: 'am' },
            { text: 'Lina and Sam ___ friends.', answer: 'are' },
          ],
        },
        {
          id: 'cp1-3', n: 3, type: 'choice', review: true, title: 'Circle the right word.',
          items: [
            { q: 'This is Mum. ___ name is Hana.', options: ['His', 'Her'], answer: 'Her' },
            { q: 'Adam and Zak have a sister. ___ sister is Lina.', options: ['Their', 'Our'], answer: 'Their' },
            { q: 'I am Dina. ___ brother is Sam.', options: ['My', 'Your'], answer: 'My' },
          ],
        },
        {
          id: 'cp1-4', n: 4, type: 'mixed', review: true, title: 'Write a or an. Then write the plural.',
          items: [
            { kind: 'gap', bank: ['a', 'an'], text: '___ egg', answer: 'an' },
            { kind: 'gap', bank: ['a', 'an'], text: '___ book', answer: 'a' },
            { kind: 'gap', text: 'one pen → two ___', answer: 'pens' },
            { kind: 'gap', text: 'one child → three ___', answer: 'children' },
          ],
        },
      ],
    },
    {
      title: 'Part C: Reading',
      activities: [
        {
          id: 'cp1-story', type: 'story', title: "Read: Ben's Family", storyTitle: "Ben's Family",
          lines: [
            { text: 'Hello! I am Ben. I am eleven. This is my family.' },
            { text: 'My mum is a doctor. Her name is Sara.' },
            { text: 'My dad is a teacher at Greenhill School. His name is Tom.' },
            { text: 'I have a big sister. Her name is Amy. She is twelve.' },
            { text: 'We have a dog. His name is Rex.' },
            { text: 'In my school bag, I have a pen, two books and an apple. I am happy at school!' },
          ],
        },
        {
          id: 'cp1-5', n: 5, type: 'choice', tf: true, review: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Ben is ten.', false, 'He is eleven.'),
            tf("Ben's mum is a doctor.", true),
            tf("Amy is Ben's sister.", true),
            tf('Rex is a cat.', false, 'Rex is a dog.'),
          ],
        },
        {
          id: 'cp1-6', n: 6, type: 'gap', review: true, title: 'Write one word from the story.',
          items: [
            { text: "Ben's dad is a ___.", answer: 'teacher' },
            { text: 'His name is ___.', answer: 'Tom' },
            { text: 'Amy is ___ years old.', answer: ['twelve', '12'] },
            { text: 'In his bag, Ben has a pen, two books and an ___.', answer: 'apple' },
          ],
        },
      ],
    },
    {
      title: 'Part D: Writing',
      activities: [
        {
          id: 'cp1-7', n: 7, type: 'open', review: true, points: 4, lines: 3,
          title: 'Write three sentences about your family or your school.',
          guide: '1 point for each correct sentence (3) + 1 point for capital letters and full stops.',
          rubric: [{ label: 'Correct sentences', max: 3 }, { label: 'Capital letters and full stops', max: 1 }],
          model: 'My name is Huda. My brother is eight. My school is big.',
        },
      ],
    },
  ],
};
