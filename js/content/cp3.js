import { CHECKPOINT_BANDS, CHECKPOINT_NEXT, tf } from './helpers.js';

export default {
  id: 'cp3',
  kind: 'checkpoint',
  label: 'Checkpoint 3',
  title: 'Review of Chapters 7–9',
  week: 10,
  color: '#c0392b',
  icon: 'star',
  intro: 'Fantastic! You are at the end of Chapter 9. Now look back at Chapters 7, 8 and 9.',
  adult: 'Week 10, session 5. About 25–30 minutes. The app marks Parts A–C; you give the points for Part D in grown-up mode.',
  review: { title: 'Checkpoint 3', bands: CHECKPOINT_BANDS, next: CHECKPOINT_NEXT },
  sections: [
    {
      title: 'Part A: Words',
      activities: [
        {
          id: 'cp3-1', n: 1, type: 'match', review: true, title: 'Look at the pictures. Write the letter.',
          left: ['umbrella', 'carrot', 'breakfast', 'evening', 'cheese', 'rain', 'market', 'banana'],
          right: ['breakfast', 'banana', 'cheese', 'umbrella', 'rain', 'market', 'evening', 'carrot'].map((x) => ({ img: x })),
          answer: 'dhagcefb',
        },
      ],
    },
    {
      title: 'Part B: Grammar',
      activities: [
        {
          id: 'cp3-2', n: 2, type: 'choice', review: true, title: 'Circle the right words.',
          items: [
            { q: 'Ben ___ football on Tuesday.', options: ['play', 'plays'], answer: 'plays' },
            { q: 'Lina ___ like bananas.', options: ["don't", "doesn't"], answer: "doesn't" },
            { q: '___ you like apples?', options: ['Do', 'Does'], answer: 'Do' },
            { q: 'Look! Dina ___ a picture now.', options: ['draws', 'is drawing'], answer: 'is drawing' },
            { q: 'We ___ to the park.', options: ['is walking', 'are walking'], answer: 'are walking' },
            { q: "I ___ to bed at nine o'clock.", options: ['go', 'goes'], answer: 'go' },
          ],
        },
        {
          id: 'cp3-3', n: 3, type: 'gap', review: true, title: 'Write the short answer.',
          items: [
            { text: 'Does Ben like apples? No, ___.', answer: ["he doesn't", 'he does not'] },
            { text: 'Do you like juice? Yes, ___.', answer: 'I do' },
            { text: 'Is Lina reading? Yes, ___.', answer: 'she is' },
          ],
        },
        {
          id: 'cp3-4', n: 4, type: 'gap', review: true, title: 'Write the question word.',
          bank: ['Who', 'What', 'Where', 'When', 'Why'],
          items: [
            { text: '___ is your best friend? Lina.', answer: 'Who' },
            { text: '___ is the hospital? It is on Hill Street.', answer: 'Where' },
            { text: '___ is in the box? Old photos.', answer: 'What' },
          ],
        },
      ],
    },
    {
      title: 'Part C: Reading',
      activities: [
        {
          id: 'cp3-story', type: 'story', title: "Read: Saturday at Gran's House", storyTitle: "Saturday at Gran's House",
          lines: [
            { text: "It is Saturday. Sam and Dina are at Gran's house." },
            { text: "Every Saturday, they have lunch with Gran at one o'clock." },
            { text: "Gran likes carrots and bread, but she doesn't like cheese." },
            { text: "Now it is three o'clock. Gran is reading a book. Dina is drawing a picture of Max." },
            { text: "Sam isn't drawing. He is writing a story. Max is sleeping under the table." },
          ],
        },
        {
          id: 'cp3-5', n: 5, type: 'choice', tf: true, review: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Sam and Dina have lunch with Gran every Saturday.', true),
            tf('Gran likes cheese.', false, "She doesn't like cheese."),
            tf('Dina is drawing a picture of Max.', true),
            tf('Sam is drawing.', false, 'He is writing a story.'),
          ],
        },
        {
          id: 'cp3-6', n: 6, type: 'write', review: true, title: 'Answer the questions.',
          items: [
            { prompt: 'What time do they have lunch?', answer: "At one o'clock.", keywords: [['one', '1']] },
            { prompt: 'Where is Max sleeping?', answer: 'Under the table.', keywords: ['under', 'table'] },
          ],
        },
      ],
    },
    {
      title: 'Part D: Writing',
      activities: [
        {
          id: 'cp3-7', n: 7, type: 'open', review: true, points: 4, lines: 3,
          title: 'What do you do every Saturday? Write three sentences.',
          guide: '1 point for each correct sentence (3) + 1 point for capital letters and full stops.',
          rubric: [{ label: 'Correct sentences', max: 3 }, { label: 'Capital letters and full stops', max: 1 }],
          model: "Every Saturday, I get up at eight o'clock. I play football in the park. In the evening, I visit my gran.",
        },
      ],
    },
  ],
};
