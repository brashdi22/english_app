import { CHECKPOINT_BANDS, CHECKPOINT_NEXT, tf } from './helpers.js';

export default {
  id: 'cp2',
  kind: 'checkpoint',
  label: 'Checkpoint 2',
  title: 'Review of Chapters 4–6',
  week: 7,
  color: '#c0392b',
  icon: 'star',
  intro: 'Great work! You are at the end of Chapter 6. Now look back at Chapters 4, 5 and 6.',
  adult: 'Week 7, session 5. About 25–30 minutes. The app marks Parts A–C; you give the points for Part D in grown-up mode.',
  review: { title: 'Checkpoint 2', bands: CHECKPOINT_BANDS, next: CHECKPOINT_NEXT },
  sections: [
    {
      title: 'Part A: Words',
      activities: [
        {
          id: 'cp2-1', n: 1, type: 'match', review: true, title: 'Look at the pictures. Write the letter.',
          left: ['glasses', 'door', 'hospital', 'key', 'mosque', 'smile', 'library', 'cap'],
          right: ['key', 'cap', 'glasses', 'library', 'hospital', 'smile', 'door', 'mosque'].map((x) => ({ img: x })),
          answer: 'cgeahfdb',
        },
      ],
    },
    {
      title: 'Part B: Grammar',
      activities: [
        {
          id: 'cp2-2', n: 2, type: 'choice', review: true, title: 'Circle the right words.',
          items: [
            { q: 'It ___ my bag.', options: ["isn't", "aren't"], answer: "isn't" },
            { q: '___ they your books?', options: ['Is', 'Are'], answer: 'Are' },
            { q: 'Is it your cap? Yes, it ___.', options: ['is', "isn't"], answer: 'is' },
            { q: 'Look at ___ pencils.', options: ['this', 'these'], answer: 'these' },
            { q: 'Lina ___ long hair.', options: ['have', 'has'], answer: 'has' },
            { q: 'We ___ a club.', options: ['have', 'has'], answer: 'have' },
            { q: 'He has ___.', options: ['short hair', 'hair short'], answer: 'short hair' },
            { q: 'There ___ two shops in my street.', options: ['is', 'are'], answer: 'are' },
          ],
        },
        {
          id: 'cp2-3', n: 3, type: 'gap', review: true, title: 'Where is the cat? Write.',
          items: [
            { img: 'cat-behind', text: 'The cat is ___ the box.', answer: 'behind' },
            { img: 'cat-between', text: 'The cat is ___ the boxes.', answer: 'between' },
            { img: 'cat-in', text: 'The cat is ___ the box.', answer: 'in' },
            { img: 'cat-under', text: 'The cat is ___ the table.', answer: 'under' },
          ],
        },
      ],
    },
    {
      title: 'Part C: Reading',
      activities: [
        {
          id: 'cp2-story', type: 'story', title: "Read: Lina's Room", storyTitle: "Lina's Room",
          lines: [
            { text: "This is Lina's room. It is small, but it is very nice." },
            { text: 'There is a bed next to the window. There are a lot of books on her desk. Her glasses are on the books.' },
            { text: 'There is a big map of Greenhill on the door. There is a brown bag under the bed.' },
            { text: "It isn't Lina's bag. It is her brother Zak's bag!" },
          ],
        },
        {
          id: 'cp2-4', n: 4, type: 'choice', tf: true, review: true, title: 'True or false? Circle T or F.',
          items: [
            tf("Lina's room is big.", false, 'It is small.'),
            tf('There is a bed next to the window.', true),
            tf("Lina's glasses are on her books.", true),
            tf("The brown bag is Lina's bag.", false, "It is Zak's bag."),
          ],
        },
        {
          id: 'cp2-5', n: 5, type: 'write', review: true, title: 'Where is it? Write.',
          items: [
            { prompt: 'Where is the map?', answer: 'It is on the door.', keywords: ['on', 'door'] },
            { prompt: 'Where is the brown bag?', answer: 'It is under the bed.', keywords: ['under', 'bed'] },
          ],
        },
      ],
    },
    {
      title: 'Part D: Writing',
      activities: [
        {
          id: 'cp2-6', n: 6, type: 'open', review: true, points: 4, lines: 3,
          title: 'Write three sentences about your room. Use there is, there are and in, on, under, next to.',
          guide: '1 point for each correct sentence (3) + 1 point for capital letters and full stops.',
          rubric: [{ label: 'Correct sentences', max: 3 }, { label: 'Capital letters and full stops', max: 1 }],
          model: 'There is a bed in my room. There are two books on my desk. My bag is under the bed.',
        },
      ],
    },
  ],
};
