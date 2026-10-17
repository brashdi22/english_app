import { tf } from './helpers.js';

export default {
  id: 'final',
  kind: 'final',
  label: 'Final Assessment',
  title: 'What Can You Do Now?',
  week: 12,
  color: '#b7950b',
  icon: 'trophy',
  intro: 'You are at the end of the book. Fantastic! This assessment shows everything you can do now. Do your best!',
  adult: 'Week 12. Do it in three sessions: Parts A and B (session 3), Parts C and D (session 4), Part E (session 5). It tests only the words and grammar in this book. The app marks most parts; in grown-up mode you give the points for Part D (writing) and check Part E. When everything is done, the certificate opens! Then do Parts C and D of "Let’s Begin" again and compare the scores.',
  review: {
    title: 'Final Assessment',
    bands: [
      [75, 'Excellent! You are secure at level A1 and ready for the next book.'],
      [60, 'Very good. You know most of the book. Review the weaker parts for a week.'],
      [43, 'Good. You have learned a lot. Repeat the chapters for the weakest part, then try again.'],
      [0, 'Keep going. Go back through the chapters more slowly, two sessions per part.'],
    ],
    next: 'If a part score is low, look again at: **A Words** – the New Words pages and the Word Bank · **B Grammar** – Ex 4: Chapters 1 and 5 · Ex 5: Chapters 2, 3, 4 and 6 · Ex 6: Chapters 7 and 8 · Ex 7: Chapters 9 and 10 · Ex 8: Chapters 6 and 9 · **C Reading** – the stories in Chapters 7–10 · **D Writing** – the Write and Speak pages in Chapters 5, 7 and 10 · **E Speaking** – the Talk activities and reading records.',
  },
  sections: [
    {
      title: 'Part A: Words (15 points)',
      activities: [
        {
          id: 'fin-1', n: 1, type: 'gap', review: true, title: 'Look and write the word.',
          items: [
            { img: 'school', answer: 'school' },
            { img: 'gran', answer: ['gran', 'grandmother', 'granny'] },
            { img: 'key', answer: ['key', 'a key'] },
            { img: 'bread', answer: 'bread' },
            { img: 'umbrella', answer: ['umbrella', 'an umbrella'] },
          ],
        },
        {
          id: 'fin-2', n: 2, type: 'gap', review: true, title: 'Choose a word from the box. Write it.',
          bank: ['library', 'breakfast', 'glasses', 'picnic', 'Yesterday'],
          items: [
            { text: 'I have ___ at seven o’clock in the morning.', answer: 'breakfast' },
            { text: 'There are a lot of books in the ___.', answer: 'library' },
            { text: 'Lina can see well with her ___.', answer: 'glasses' },
            { text: 'We had a ___ in the park with bread and fruit.', answer: 'picnic' },
            { text: 'Today is Monday. ___ was Sunday.', answer: 'Yesterday' },
          ],
        },
        {
          id: 'fin-3', n: 3, type: 'choice', review: true, title: 'Which word is different? Circle it.',
          items: [
            { q: 'Which word is different?', options: ['mum', 'dad', 'sister', 'pencil'], answer: 'pencil' },
            { q: 'Which word is different?', options: ['apple', 'banana', 'chair', 'orange'], answer: 'chair' },
            { q: 'Which word is different?', options: ['park', 'library', 'café', 'smile'], answer: 'smile' },
            { q: 'Which word is different?', options: ['Monday', 'Friday', 'morning', 'Sunday'], answer: 'morning' },
            { q: 'Which word is different?', options: ['red', 'blue', 'tall', 'green'], answer: 'tall' },
          ],
        },
      ],
    },
    {
      title: 'Part B: Grammar (25 points)',
      activities: [
        {
          id: 'fin-4', n: 4, type: 'gap', review: true, title: 'Write am, is, are, have or has.',
          bank: ['am', 'is', 'are', 'have', 'has'],
          items: [{
            text: 'My name ___ Nora. I ___ ten. My brothers ___ twelve. I ___ long black hair. My big brother ___ glasses.',
            answers: ['is', 'am', 'are', 'have', 'has'],
          }],
        },
        {
          id: 'fin-5', n: 5, type: 'choice', review: true, title: 'Circle the right word.',
          items: [
            { q: 'I have ___ orange.', options: ['a', 'an'], answer: 'an' },
            { q: 'Two ___ are in the park.', options: ['child', 'children'], answer: 'children' },
            { q: 'This is Ben. ___ bag is blue.', options: ['His', 'Her'], answer: 'His' },
            { q: '___ books are new.', options: ['This', 'These'], answer: 'These' },
            { q: 'There ___ a café next to the library.', options: ['is', 'are'], answer: 'is' },
          ],
        },
        {
          id: 'fin-6', n: 6, type: 'gap', review: true, title: 'Write the right form of the verb.',
          items: [
            { text: 'Ben ___ (play) football on Tuesday.', answer: 'plays' },
            { text: 'Lina ___ (not like) bananas.', answer: ["doesn't like", 'does not like'] },
            { text: '___ you like cheese? Yes, I do.', answer: 'Do' },
            { text: 'Sam ___ (get up) at seven o’clock.', answer: 'gets up' },
            { text: 'We ___ (not go) to school on Saturday.', answer: ["don't go", 'do not go'] },
          ],
        },
        {
          id: 'fin-7', n: 7, type: 'gap', review: true, title: 'Now or in the past? Write the verb.',
          items: [
            { text: 'Look! It ___ (rain) now.', answer: ['is raining', "it's raining"] },
            { text: 'Yesterday, we ___ (walk) to the park.', answer: 'walked' },
            { text: 'Shh! Dina ___ (sleep).', answer: 'is sleeping' },
            { text: 'Last Saturday, I ___ (go) to the market.', answer: 'went' },
            { text: 'In 1976, Mr Hill ___ (be) a boy.', answer: 'was' },
          ],
        },
        {
          id: 'fin-8', n: 8, type: 'mixed', review: true, title: 'Write the missing word.',
          items: [
            { kind: 'gap', img: 'cat-on', text: 'The cat is ___ the box.', answer: 'on' },
            { kind: 'gap', img: 'cat-under', text: 'The cat is ___ the table.', answer: 'under' },
            { kind: 'gap', bank: ['Who', 'What', 'Where', 'When', 'Why'], text: '___ is your teacher? Mrs Green.', answer: 'Who' },
            { kind: 'gap', bank: ['Who', 'What', 'Where', 'When', 'Why'], text: '___ is the park? It is between the school and the mosque.', answer: 'Where' },
            { kind: 'gap', bank: ['Who', 'What', 'Where', 'When', 'Why'], text: '___ do you go to bed? At nine o’clock.', answer: 'When' },
          ],
        },
      ],
    },
    {
      title: 'Part C: Reading (20 points)',
      activities: [
        {
          id: 'fin-story', type: 'story', title: "Read: Dina's Sunday", storyTitle: "Dina's Sunday",
          lines: [
            { text: 'My name is Dina. I am six. I have a big brother. His name is Sam. He is ten.' },
            { text: 'Every Sunday, Sam and I go to the park with Gran. The park is between the school and the mosque. There are big trees and a lot of children there.' },
            { text: 'Today is Sunday. It is sunny. Gran is sitting under a tree. She is reading a book. Sam is playing football with Ben. I am drawing a picture of Max, our cat.' },
            { text: 'Gran likes the park, but she doesn’t like football. "Football isn’t quiet!" she says.' },
            { text: 'At twelve o’clock, we have a picnic together. We have bread, cheese and bananas. I don’t like cheese. I have bread and a banana.' },
            { text: 'Yesterday was Saturday. It was raining, and we were at home. Sam was very happy. He and his friends found a time capsule last week! Now Sam has a special box in his room. Inside, there is a photo of the old clock tower.' },
            { text: 'I love my big brother. He is kind and funny!' },
          ],
        },
        {
          id: 'fin-9', n: 9, type: 'choice', tf: true, review: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Dina is six.', true),
            tf('Every Sunday, they go to the park with Mum.', false, 'They go with Gran.'),
            tf('Gran is reading a book.', true),
            tf('Gran likes football.', false, "She doesn't like football."),
            tf('Yesterday, it was sunny.', false, 'It was raining.'),
          ],
        },
        {
          id: 'fin-10', n: 10, type: 'choice', abc: true, review: true, title: 'Read and circle a, b or c.',
          items: [
            { q: 'Where is the park?', options: ['between the school and the mosque', 'next to the hospital', 'behind the library'], answer: 'between the school and the mosque' },
            { q: 'What is Sam doing?', options: ['reading', 'playing football', 'drawing'], answer: 'playing football' },
            { q: 'When do they have a picnic?', options: ["at twelve o'clock", "at three o'clock", 'in the evening'], answer: "at twelve o'clock" },
            { q: "What is inside Sam's special box?", options: ['a photo', 'a toy car', 'a key'], answer: 'a photo' },
          ],
        },
        {
          id: 'fin-11', n: 11, type: 'write', review: true, title: 'Answer in full sentences.',
          adultNote: '2 points each: 1 for the right information, 1 for a full sentence.',
          items: [
            { prompt: "Who is Dina's brother?", answer: "Sam is Dina's brother.", keywords: ['Sam'], fullSentence: true, points: 2 },
            { prompt: 'What is Dina drawing?', answer: 'She is drawing a picture of Max (her cat).', keywords: [['Max', 'cat']], fullSentence: true, points: 2 },
            { prompt: 'What does Dina have for the picnic?', answer: 'She has bread and a banana.', keywords: ['bread', ['banana', 'bananas']], fullSentence: true, points: 2 },
          ],
        },
        {
          id: 'fin-12', n: 12, type: 'write', review: true, title: 'Think! Answer.',
          items: [
            { prompt: 'Find a word in the story that means "with a lot of sun".', answer: 'sunny' },
            { prompt: 'Find a word in the story that means "with other people".', answer: 'together' },
            { prompt: "Why doesn't Dina have cheese?", answer: "Because she doesn't like cheese.", keywords: ['like'] },
            { prompt: 'Why was Sam very happy yesterday? (2 points)', answer: 'Because he and his friends found a time capsule.', keywords: ['capsule'], fullSentence: true, points: 2 },
          ],
        },
      ],
    },
    {
      title: 'Part D: Writing (15 points)',
      activities: [
        {
          id: 'fin-13', n: 13, type: 'open', review: true, lines: 8,
          title: 'Write about you. Write 6 to 8 sentences.',
          context: [{ kind: 'note', text: 'Write about: your name and age · your family · a friend (what he or she looks like) · your day · food you like and don’t like · what you did yesterday.' }],
          rubric: [
            { label: 'Content (1 point for each topic: name and age, family, friend, day, food, yesterday)', max: 5 },
            { label: "Grammar (am / is / are, have / has, he gets, don't / doesn't, past verbs)", max: 5 },
            { label: 'Words (words from the book, spelled so a reader can understand)', max: 3 },
            { label: 'Capital letters and full stops (2 = almost always · 1 = sometimes · 0 = rarely)', max: 2 },
          ],
          model: "My name is Salim. I am ten. I have one sister. Her name is Noor. My best friend is Ali. He is tall and he has short black hair. Every day, I get up at six o'clock. I like rice, but I don't like carrots. Yesterday, I went to the park with my family.",
        },
      ],
    },
    {
      title: 'Part E: Speaking and reading aloud (10 points)',
      activities: [
        {
          id: 'fin-14', n: 14, type: 'story', review: true, points: 5, storyTitle: "Sam's Diary (first three parts)",
          title: 'Read aloud. Read the first three parts of "Sam\'s Diary" to your adult.',
          adult: 'Tap "I read it aloud". The app listens and scores from the mistakes: 5 = smooth, 0–2 mistakes · 4 = 3–4 mistakes · 3 = 5–7 mistakes · 2 = many stops · 1 = needs help with most words.',
          mistakeBands: [[2, 5], [4, 4], [7, 3], [12, 2], [Infinity, 1]],
          lines: [
            { text: 'Dear Diary,' },
            { text: 'Today was a very special day!' },
            { text: 'In the morning, it was sunny. Lina, Ben and I went to the clock tower with Ms Rose and Mr Hill. We were very happy.' },
            { text: 'We walked to the small door behind the clock tower. I opened the door with the old key. It was very dark inside! Ben looked inside, and he found a big box under the clock. It was the time capsule!' },
          ],
        },
        {
          id: 'fin-15', n: 15, type: 'ask', review: true, title: "Answer your adult's questions.",
          adultNote: 'Give 1 point for each answer in a sentence. The app asks each question aloud and suggests a point when it hears a sentence.',
          scoring: { sentence: 1, word: 0 },
          items: [
            { q: 'Tell me about your family.', model: 'I have a brother and a sister.' },
            { q: 'What time do you get up?', model: "I get up at six o'clock." },
            { q: 'Do you like football?', model: "Yes, I do. / No, I don't." },
            { q: 'What are you doing now?', model: 'I am talking to you. / I am sitting.' },
            { q: 'What did you do yesterday?', model: 'I went to the park.' },
          ],
        },
      ],
    },
  ],
};
