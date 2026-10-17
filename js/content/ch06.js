import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Places in a town',
    words: [
      w('street', 'street', 'a road with houses and shops', 'My house is on Hill **Street**.', 'Rhymes with feet'),
      w('park', 'park', 'a big green place with trees', 'The **park** is nice.', 'Rhymes with dark'),
      w('shop', 'shop', 'a place where you get food and things', 'There are two **shops**.'),
      w('library', 'library', 'a place with a lot of books', 'Lina is at the **library**.', 'Say: LIE-bruh-ree'),
      w('café', 'cafe', 'a small place to eat and drink', 'The **café** is next to the library.', 'Say: KAF-ay'),
      w('hospital', 'hospital', 'ill people go there; doctors help them', 'Dad is at the **hospital**.', 'Say: HOS-pi-tul'),
      w('mosque', 'mosque', 'a place where Muslims pray', 'The **mosque** is next to the park.', 'Say: mosk'),
      w('bus stop', 'bus-stop', 'you wait for the bus there', 'The **bus stop** is next to my house.'),
      w('square', 'square', 'a big open place in the middle of a town', 'There is a clock tower in the **square**.', 'Say: skwair'),
      w('clock tower', 'clock-tower', 'a very tall building with a big clock', 'The **clock tower** is very old.'),
      w('broken', 'broken', 'not OK; it does not work', 'The clock is **broken**.', 'Say: BROH-ken'),
    ],
  },
];

const PREPS = ['in', 'on', 'under', 'next to', 'between', 'behind', 'in front of'];
const MAP = [{ kind: 'img', img: 'greenhill-map', caption: "The Map Club's map of Greenhill" }];

export default {
  id: 'ch6',
  kind: 'chapter',
  label: 'Chapter 6',
  title: 'Around Greenhill',
  week: 7,
  color: '#16a085',
  icon: 'clock-tower',
  intro: 'The Map Club walks around Greenhill. The friends make a map of the town. Where is the door for the old key?',
  goals: ['I can name places in a town.', 'I can say where things are: in, on, under, next to, between, behind, in front of.', 'I can use **there is** and **there are**.', 'I can read a map and a text together.'],
  endGoal: 'At the end of this chapter, you can describe your street or your town.',
  review: { title: 'Chapter 6 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch6-words', type: 'words', title: 'New Words', groups },
        sayWords('ch6-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch6-1', n: 1, type: 'match', title: 'Look at the pictures. Write the letter.',
          left: ['library', 'park', 'hospital', 'café', 'bus stop', 'mosque'],
          right: ['hospital', 'mosque', 'library', 'bus-stop', 'cafe', 'park'].map((x) => ({ img: x })),
          answer: 'cfaedb',
        },
        {
          id: 'ch6-2', n: 2, type: 'gap', title: 'Where do you go? Write the place.',
          bank: ['library', 'hospital', 'shop', 'park', 'café'],
          items: [
            { text: 'I want a book. I go to the ___.', answer: 'library' },
            { text: 'I am ill. I go to the ___.', answer: 'hospital' },
            { text: 'I want to play. I go to the ___.', answer: 'park' },
            { text: 'I want bread. I go to the ___.', answer: 'shop' },
            { text: 'I want a cup of juice. I go to the ___.', answer: ['café', 'cafe'] },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: ou and ow',
      activities: [
        soundSpot('ch6-sound', 'Read the ou and ow words', '**ou** and **ow** often say the sound in **town**.',
          ['house', 'out', 'mouse', 'round', 'town', 'down', 'now', 'how', 'brown']),
        {
          id: 'ch6-3', n: 3, type: 'tap', title: 'Read. Circle the five ou and ow words.',
          text: 'There is a brown mouse in our house in town.',
          answer: ['brown', 'mouse', 'our', 'house', 'town'],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch6-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'Our Map of Greenhill', words: 157,
          lines: [
            { img: 'greenhill-map', caption: "The Map Club's map of Greenhill" },
            { text: 'This is our map of Greenhill. Greenhill is a small town, but it is very nice.' },
            { text: 'In the middle of the town, there is a square. There is an old clock tower in the square. The clock tower is very tall, but the clock is broken.' },
            { text: 'There is a library next to the square. There are a lot of books in the library. There is a café next to the library.' },
            { text: 'There are two shops on Green Street. The school is on Green Street too. There is a park between the school and the mosque. There are big trees in the park.' },
            { text: 'There is a hospital on Hill Street. My dad is a doctor there. My house is on Hill Street, next to the bus stop. Lina’s house is next to the bus stop too.' },
            { text: 'And look! There is a small door behind the clock tower. It is very old. Is it the door for our key?' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch6-4', n: 4, type: 'choice', tf: true, title: 'Look at the map and read the story. True or false?',
          context: MAP,
          items: [
            tf('The library is next to the square.', true),
            tf('The park is between the school and the hospital.', false, 'It is between the school and the mosque.'),
            tf('There are two shops on Green Street.', true),
            tf('The café is next to the mosque.', false, 'It is next to the library.'),
            tf('There is a small door behind the clock tower.', true),
          ],
        },
        {
          id: 'ch6-5', n: 5, type: 'gap', title: 'Where is it? Write the missing words.',
          bank: ['in', 'between', 'next to', 'behind'],
          items: [
            { text: "The bus stop is ___ Sam's house and Lina's house.", answer: 'between' },
            { text: 'The clock tower is ___ the square.', answer: 'in' },
            { text: 'The café is ___ the library.', answer: 'next to' },
            { text: 'The small door is ___ the clock tower.', answer: 'behind' },
          ],
        },
        {
          id: 'ch6-6', n: 6, type: 'choice', abc: true, title: '"The clock is broken." What does broken mean? Circle a, b or c.',
          items: [{ q: 'broken', options: ['It does not work.', 'It is new.', 'It is tall.'], answer: 'It does not work.' }],
        },
        {
          id: 'ch6-7', n: 7, type: 'open', lines: 1, title: 'Think! Why is the small door important for the Map Club? Write.',
          model: 'It is old, and Sam has an old key. Maybe the key is for the door.',
        },
      ],
    },
    {
      title: 'Grammar: Where is it? There is / there are',
      activities: [
        {
          id: 'ch6-grammar', type: 'info', title: 'Grammar: Where is it? There is / there are',
          blocks: [
            { kind: 'pics', items: PREPS.map((p) => ({ img: `cat-${p.replace(/ /g, '-')}`, text: p, say: `The cat is ${p} the box.` })) },
            {
              kind: 'list',
              items: [
                "**There is** + one thing: There is a park. There's a café.",
                '**There are** + two or more: There are two shops.',
                "Questions: Is there a café? Yes, there is. / No, there isn't. Are there trees? Yes, there are. / No, there aren't.",
              ],
            },
            { kind: 'mistakes', pairs: [['There are a park.', 'There is a park.'], ['There is two shops.', 'There are two shops.'], ['The cat is in front the box.', 'The cat is in front of the box.'], ['next the school', 'next to the school']] },
          ],
        },
        {
          id: 'ch6-8', n: 8, type: 'gap', title: 'Look at the cat. Write the missing word.',
          bank: PREPS,
          items: [
            { img: 'cat-under', text: 'The cat is ___ the table.', answer: 'under' },
            { img: 'cat-in', text: 'The cat is ___ the box.', answer: 'in' },
            { img: 'cat-between', text: 'The cat is ___ the boxes.', answer: 'between' },
            { img: 'cat-behind', text: 'The cat is ___ the box.', answer: 'behind' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch6-9', n: 9, type: 'gap', title: 'Write is or are.',
          bank: ['is', 'are'],
          items: [
            { text: 'There ___ a mosque in Greenhill.', answer: 'is' },
            { text: 'There ___ big trees in the park.', answer: 'are' },
            { text: 'There ___ two shops on Green Street.', answer: 'are' },
            { text: 'There ___ a bus stop on Hill Street.', answer: 'is' },
            { text: 'There ___ a lot of books in the library.', answer: 'are' },
          ],
        },
        {
          id: 'ch6-10', n: 10, type: 'choice', title: "Look at the map. Answer Yes, there is. / No, there isn't. / Yes, there are. / No, there aren't.",
          context: MAP,
          items: [
            { q: 'Is there a hospital in Greenhill?', options: ['Yes, there is.', "No, there isn't."], answer: 'Yes, there is.' },
            { q: 'Are there three shops?', options: ['Yes, there are.', "No, there aren't."], answer: "No, there aren't.", why: 'There are two.' },
            { q: 'Is there a café?', options: ['Yes, there is.', "No, there isn't."], answer: 'Yes, there is.' },
            { q: 'Are there trees in the park?', options: ['Yes, there are.', "No, there aren't."], answer: 'Yes, there are.' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch6-11', n: 11, type: 'open', title: 'Draw a map of your street or your room. Then write about it.',
          frames: [
            { before: 'There is a' },
            { before: 'There are' },
            { before: 'My', hint: 'house is next to the park' },
            { before: '', hint: 'one more sentence' },
          ],
          talk: 'Hide and find. Your adult hides a small thing. Ask: "Is it under the chair?" "Is it behind the door?" Then you hide it!',
          model: 'There is a mosque in my street. There are three shops. My house is next to the park. There is a big tree in front of my house.',
        },
      ],
    },
    {
      title: 'Chapter 6 Review',
      activities: [
        {
          id: 'ch6-12', n: 12, type: 'gap', review: true, title: 'Look and write the place.',
          items: [
            { img: 'hospital', hint: 'h', answer: 'hospital' },
            { img: 'mosque', hint: 'm', answer: 'mosque' },
            { img: 'library', hint: 'l', answer: 'library' },
            { img: 'park', hint: 'p', answer: 'park' },
          ],
        },
        {
          id: 'ch6-13', n: 13, type: 'gap', review: true, title: 'Where is the cat? Write.',
          items: [
            { img: 'cat-on', text: 'The cat is ___ the box.', answer: 'on' },
            { img: 'cat-under', text: 'The cat is ___ the table.', answer: 'under' },
            { img: 'cat-next-to', text: 'The cat is ___ the box.', answer: 'next to' },
            { img: 'cat-in-front-of', text: 'The cat is ___ the box.', answer: 'in front of' },
          ],
        },
        {
          id: 'ch6-14', n: 14, type: 'gap', review: true, title: 'Write There is or There are.',
          bank: ['There is', 'There are'],
          items: [
            { text: '___ a bus stop next to my house.', answer: 'There is' },
            { text: '___ two cafés in my town.', answer: 'There are' },
            { text: '___ a lot of trees in the park.', answer: 'There are' },
            { text: '___ a library next to the square.', answer: 'There is' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch6-check', [
          'name places in a town.',
          'say where things are (in, on, under, next to ...).',
          'use there is and there are.',
          'read a map and the story "Our Map of Greenhill".',
        ]),
      ],
    },
  ],
};
