import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Time',
    words: [
      w('yesterday', 'yesterday', 'the day before today', '**Yesterday** was Friday.', 'Say: YES-ter-day'),
      w('ago', 'ago', 'before now: two days ago, fifty years ago', 'Gran was a teacher fifty years **ago**.', 'Say: uh-GOH'),
      w('future', 'future', 'the time after now', 'What is your job in the **future**?', 'Say: FEW-cher'),
    ],
  },
  {
    title: 'Things',
    words: [
      w('diary', 'diary', 'a book where you write about your day', 'I write in my **diary** every evening.', 'Say: DIE-uh-ree'),
      w('time capsule', 'box', 'a box of things for people in the future', 'The **time capsule** is under the clock tower.', 'Say: TIME KAP-syool'),
      w('letter', 'letter', 'words on paper for a person to read', 'I am writing a **letter** to Gran.', 'Say: LET-er'),
      w('toy', 'toy', 'a thing children play with', 'This is my old **toy** car.', 'Rhymes with boy'),
    ],
  },
  {
    title: 'Other words',
    words: [
      w('inside', 'inside', 'in a box, a room or a building', 'What is **inside** the box?', 'Say: in-SIDE'),
      w('special', 'special', 'very good; not like every day', 'Today is a **special** day!', 'Say: SPESH-ul'),
      w('together', 'together', 'with other people', 'We are **together**.', 'Say: tuh-GETH-er'),
    ],
  },
];

export default {
  id: 'ch10',
  kind: 'chapter',
  label: 'Chapter 10',
  title: 'The Time Capsule',
  week: 11,
  color: '#b8860b',
  icon: 'old-key',
  intro: 'It is Saturday, the big day! The Map Club goes to the clock tower with Ms Rose and Mr Hill. Does the old key open the small door? Read Sam’s diary and find out!',
  goals: ['I can talk about the past with **was** and **were**.', 'I can use past verbs: walked, opened, went, saw, found.', 'I can read a longer story and answer in full sentences.', 'I can write a short letter.'],
  endGoal: 'At the end of this chapter, you can tell a story about yesterday and write a letter to a child in the future.',
  review: { title: 'Chapter 10 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch10-words', type: 'words', title: 'New Words', groups },
        sayWords('ch10-say', groups),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch10-1', n: 1, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['diary', 'letter', 'toy', 'inside', 'future', 'special'],
          items: [
            { text: 'I write about my day in my ___.', answer: 'diary' },
            { text: 'Dina plays with her ___ car.', answer: 'toy' },
            { text: 'Today is my birthday. It is a ___ day!', answer: 'special' },
            { text: 'What is ___ your bag? A book and a pen.', answer: 'inside' },
            { text: 'I am writing a ___ to my friend.', answer: 'letter' },
            { text: 'In the ___, I want to be a doctor.', answer: 'future' },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: -ed endings',
      activities: [
        soundSpot('ch10-sound', 'Read the -ed words', 'The ending **-ed** has three sounds: **t**: walked · looked · helped. **d**: played · opened · smiled. **id**: wanted · painted · needed.',
          ['walked', 'looked', 'helped', 'played', 'opened', 'smiled', 'wanted', 'painted', 'needed']),
        {
          id: 'ch10-2', n: 2, type: 'sort', title: 'Say the words. Write them in the table.',
          words: ['looked', 'played', 'wanted', 'walked', 'opened', 'painted'],
          bins: [
            { label: '-ed = t', words: ['looked', 'walked'] },
            { label: '-ed = d', words: ['played', 'opened'] },
            { label: '-ed = id', words: ['wanted', 'painted'] },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch10-story', type: 'story', record: true, title: 'Read the Story', storyTitle: "Sam's Diary", words: 206,
          helpers: 'Dear Diary = we start a diary page like this · sunny = with a lot of sun · dark = with no light · surprised = you think "Wow! Really?" · fifty = 50 · letters from the children = the children wrote them',
          lines: [
            { text: 'Saturday', cls: 'head' },
            { text: 'Dear Diary,' },
            { text: 'Today was a very special day!' },
            { text: 'In the morning, it was sunny. Lina, Ben and I went to the clock tower with Ms Rose and Mr Hill. We were very happy.' },
            { text: 'We walked to the small door behind the clock tower. I opened the door with the old key. It was very dark inside! Ben looked inside, and he found a big box under the clock. It was the time capsule!' },
            { text: 'We opened the box together. Inside, there were old photos, a toy car and three letters. The letters were from the children of 1976. Lina opened a letter. It said: "Hello, children of the future! We are the children of Greenhill School. We love our town. Greenhill is very special. Please love it too!"' },
            { text: 'Then Mr Hill saw the toy car. He smiled. "That is my toy car!" he said. "I was the boy in the picture. That was fifty years ago!" Wow! We were very surprised.' },
            { text: 'In the afternoon, we made a new time capsule. We put photos, a map of Greenhill and our letters in a new box. Mr Hill put it under the clock tower.' },
            { text: 'It was the best day! I love Greenhill, and I love the Map Club!' },
            { text: 'Sam' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch10-3', n: 3, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf('It was sunny in the morning.', true),
            tf('Sam opened the door with the old key.', true),
            tf('Lina found the box.', false, 'Ben found it.'),
            tf('There were three letters in the box.', true),
            tf("The toy car was Ms Rose's toy.", false, "It was Mr Hill's toy."),
          ],
        },
        {
          id: 'ch10-4', n: 4, type: 'choice', abc: true, title: 'Read and circle a, b or c.',
          items: [
            { q: 'Who went to the clock tower with the Map Club?', options: ['Mrs Green', 'Ms Rose and Mr Hill', "Sam's family"], answer: 'Ms Rose and Mr Hill' },
            { q: 'What was in the box?', options: ['old photos and letters', 'apples and bread', 'a map and a key'], answer: 'old photos and letters' },
            { q: 'The letters were from ...', options: ['the children of 1976', 'Mrs Green', 'Ms Rose'], answer: 'the children of 1976' },
          ],
        },
        {
          id: 'ch10-5', n: 5, type: 'sequence', title: 'Put the story in order. Write 1 to 6.',
          events: ['Ben found a box.', 'Mr Hill saw his toy car.', 'They walked to the clock tower.', 'They made a new time capsule.', 'Sam opened the door.', 'Lina opened a letter.'],
          order: [3, 5, 1, 6, 2, 4],
        },
        {
          id: 'ch10-6', n: 6, type: 'open', title: 'Think! Answer in full sentences.',
          frames: [
            { before: '1. Who was the boy in the picture in Chapter 9?' },
            { before: '2. In Chapter 8, Mr Hill looked at the key and smiled. Why?' },
            { before: '3. Was Sam happy? Copy a sentence from the diary that shows it.' },
          ],
          model: '1. Mr Hill was the boy in the picture. 2. Because he knew the key. / Because it was his time capsule. 3. Yes, he was. "Today was a very special day!" or "It was the best day!"',
        },
      ],
    },
    {
      title: 'Grammar: was, were and past verbs',
      activities: [
        {
          id: 'ch10-grammar', type: 'info', title: 'Grammar: was, were and past verbs',
          blocks: [
            { kind: 'p', text: 'We use the past for things that happened before now: yesterday, last Saturday, two days ago, in 1976.' },
            {
              kind: 'list',
              items: [
                '**was**: I / he / she / it was happy. **were**: you / we / they were happy.',
                "**there was** + one thing · **there were** + two or more. Not: wasn't, weren't.",
                'Most verbs add **-ed**: walk → walked, open → opened, look → looked, play → played.',
                'Verbs with e at the end add **-d**: smile → smiled, like → liked.',
              ],
            },
            { kind: 'p', text: '**Special verbs** (learn them by heart!)' },
            {
              kind: 'table', head: ['go', 'see', 'find', 'say', 'make', 'put', 'have'],
              rows: [['went', 'saw', 'found', 'said', 'made', 'put', 'had']],
            },
            { kind: 'mistakes', pairs: [['Yesterday I go to the park.', 'Yesterday I went to the park.'], ['We was happy.', 'We were happy.'], ['He finded a box.', 'He found a box.']] },
          ],
        },
        {
          id: 'ch10-7', n: 7, type: 'gap', title: 'Look at the example. Write was or were.',
          context: [{ kind: 'p', text: 'Example: I **was** at home yesterday.' }],
          bank: ['was', 'were'],
          items: [
            { text: 'We ___ at the clock tower.', answer: 'were' },
            { text: 'The box ___ big.', answer: 'was' },
            { text: 'The letters ___ very old.', answer: 'were' },
            { text: 'Mr Hill ___ a boy in 1976.', answer: 'was' },
            { text: 'You ___ very kind.', answer: 'were' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch10-8', n: 8, type: 'gap', title: 'Write the past.',
          items: [
            { text: 'walk → ___', answer: 'walked' },
            { text: 'play → ___', answer: 'played' },
            { text: 'open → ___', answer: 'opened' },
            { text: 'like → ___', answer: 'liked' },
            { text: 'go → ___', answer: 'went' },
            { text: 'see → ___', answer: 'saw' },
            { text: 'find → ___', answer: 'found' },
            { text: 'have → ___', answer: 'had' },
          ],
        },
        {
          id: 'ch10-9', n: 9, type: 'gap', title: 'Today and yesterday. Write the sentence in the past.',
          items: [
            { q: 'I play football.', text: 'Yesterday, I ___', answer: 'played football' },
            { q: 'We walk to school.', text: 'Yesterday, we ___', answer: 'walked to school' },
            { q: 'Ben goes to the park.', text: 'Yesterday, Ben ___', answer: 'went to the park' },
            { q: 'I see a cat.', text: 'Yesterday, I ___', answer: 'saw a cat' },
            { q: 'It is sunny.', text: 'Yesterday, it ___', answer: 'was sunny' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch10-10', n: 10, type: 'open', title: 'Write a letter for your own time capsule. Use the words in the frame.',
          context: [{ kind: 'p', text: '**Hello, children of the future!**' }],
          frames: [
            { before: 'My name is', hint: 'name. I am ... years old' },
            { before: 'I live in' },
            { before: 'I have', after: '(family)' },
            { before: 'I like', hint: "football, but I don't like carrots" },
            { before: 'Every day, I' },
            { before: 'Now, I am', after: '(-ing)' },
            { before: 'Yesterday, I' },
            { before: 'From,' },
          ],
          talk: 'Tell your adult the story of the time capsule: "First, they walked to the clock tower. Then ..." Then say what you did yesterday.',
          model: "Hello, children of the future! My name is Ahmed. I am ten years old. I live in Sohar. I have two sisters and a brother. I like football, but I don't like carrots. Every day, I go to school at seven o'clock. Now, I am writing this letter. Yesterday, I played with my friends in the park. From, Ahmed",
        },
      ],
    },
    {
      title: 'Chapter 10 Review',
      activities: [
        {
          id: 'ch10-11', n: 11, type: 'gap', review: true, title: 'Write was or were.',
          bank: ['was', 'were'],
          items: [
            { text: 'Yesterday ___ Sunday.', answer: 'was' },
            { text: 'My friends ___ at my house.', answer: 'were' },
            { text: 'I ___ very happy.', answer: 'was' },
            { text: 'There ___ three letters in the box.', answer: 'were' },
          ],
        },
        {
          id: 'ch10-12', n: 12, type: 'gap', review: true, title: 'Write the past.',
          items: [
            { text: 'look → ___', answer: 'looked' },
            { text: 'make → ___', answer: 'made' },
            { text: 'say → ___', answer: 'said' },
            { text: 'put → ___', answer: 'put' },
          ],
        },
        {
          id: 'ch10-13', n: 13, type: 'gap', review: true, title: 'Read. Write one word.',
          context: [{ kind: 'p', cls: 'reading', text: 'Yesterday was Sunday. Lina went to the park with her brothers. It was sunny. They played football and they had a picnic. Zak found a small red ball under a tree.' }],
          items: [
            { text: 'Lina went to the ___.', answer: 'park' },
            { text: 'It was ___.', answer: 'sunny' },
            { text: 'They played ___.', answer: 'football' },
            { text: 'Zak found a small red ___.', answer: 'ball' },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch10-check', [
          'use was and were.',
          'use past verbs (walked, went, saw, found).',
          'read the story "Sam’s Diary".',
          'write a short letter.',
        ]),
      ],
    },
  ],
};
