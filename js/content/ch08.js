import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck, tf } from './helpers.js';

const groups = [
  {
    title: 'Market Day words',
    words: [
      w('market', 'market', 'a lot of small shops in a street or square', 'There is a **market** in the square.', 'Say: MAR-kit'),
      w('buy', 'buy', 'get a thing from a shop with money', 'I **buy** apples at the market.', 'Rhymes with my'),
      w('picnic', 'picnic', 'food you eat outside, in a park', 'We have a **picnic** in the park.', 'Say: PIK-nik'),
      w('apple', 'apple', 'a round fruit; it is red or green', 'I like **apples**.', 'Say: AP-ul'),
      w('banana', 'banana', 'a long yellow fruit', 'Ben likes **bananas**.', 'Say: buh-NAH-nuh'),
      w('orange', 'orange', 'a round orange fruit', 'Lina likes **oranges**.', 'Say: OR-inj'),
      w('carrot', 'carrot', 'a long orange vegetable', "Max doesn't like **carrots**!", 'Say: KA-rut'),
      w('tomato', 'tomato', 'a round, red, soft food', 'Dina likes **tomatoes**.', 'Say: tuh-MAH-toh'),
      w('bread', 'bread', 'a brown or white food; we eat it every day', 'We have **bread** for the picnic.', 'Say: bred'),
      w('cheese', 'cheese', 'a yellow or white food from milk', 'Dad likes **cheese**.', 'Say: cheez'),
      w('juice', 'juice', 'a drink from fruit', 'I like orange **juice**.', 'Say: jooss'),
      w('fruit', 'fruit', 'sweet food from trees and plants', 'Apples and bananas are **fruit**.', 'Say: froot'),
      w('vegetables', 'vegetables', 'food from plants, like carrots', 'I eat **vegetables** every day.', 'Say: VEJ-tuh-bulz'),
    ],
  },
];

const short = (yes, who) => (yes ? [`Yes, ${who} ${who === 'they' || who === 'I' ? 'do' : 'does'}.`] : [`No, ${who} ${who === 'they' || who === 'I' ? "don't" : "doesn't"}.`, `No, ${who} ${who === 'they' || who === 'I' ? 'do not' : 'does not'}.`]);

export default {
  id: 'ch8',
  kind: 'chapter',
  label: 'Chapter 8',
  title: 'Market Day',
  week: 9,
  color: '#e74c3c',
  icon: 'apple',
  intro: 'It is Saturday! The Map Club goes to the market. The friends want food for a picnic. At the market, they meet Mr Hill. Does he know about the old key?',
  goals: ['I can name food.', "I can say what I like and don't like.", 'I can ask and answer: Do you like apples? Does she like cheese?', 'I can join ideas with **and** and **but**.'],
  endGoal: 'At the end of this chapter, you can go shopping in English and talk about food you like.',
  review: { title: 'Chapter 8 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      blocks: [{ kind: 'words', title: 'At the market:', words: ['How much is it?', "It's two pounds.", 'Here you are.', 'Thank you!'] }],
      activities: [
        { id: 'ch8-words', type: 'words', title: 'New Words', groups },
        sayWords('ch8-say', groups, [
          { text: 'How much is it?' }, { text: "It's two pounds." }, { text: 'Here you are.' }, { text: 'Thank you!' },
        ]),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch8-1', n: 1, type: 'sort', title: 'Fruit, vegetables or other food? Write the words in the table.',
          words: ['apple', 'carrot', 'banana', 'bread', 'orange', 'cheese', 'juice'],
          bins: [
            { label: 'fruit', words: ['apple', 'banana', 'orange'] },
            { label: 'vegetables', words: ['carrot'] },
            { label: 'other food and drink', words: ['bread', 'cheese', 'juice'] },
          ],
        },
        {
          id: 'ch8-2', n: 2, type: 'gap', title: 'Choose a word from the box. Write it.',
          bank: ['market', 'buy', 'picnic'],
          items: [
            { text: 'On Saturday, there is a ___ in the square.', answer: 'market' },
            { text: 'We have a ___ in the park. We eat bread and fruit.', answer: 'picnic' },
            { text: 'I ___ apples and bread at the shop.', answer: 'buy' },
          ],
        },
      ],
    },
    {
      title: 'Sound Spot: igh and y',
      activities: [
        soundSpot('ch8-sound', 'Read the igh and y words', '**igh** and **y** (at the end of short words) say the sound in **my**.',
          ['night', 'light', 'right', 'high', 'my', 'by', 'why', 'fly', 'sky']),
        {
          id: 'ch8-3', n: 3, type: 'multi', title: 'Circle the five words with the sound in my.',
          options: ['light', 'sit', 'why', 'fly', 'big', 'night', 'sky', 'pin'],
          answer: [0, 2, 3, 5, 6],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch8-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'Market Day', words: 162,
          helpers: 'like = think it is nice · want = would like to have · some = a number of · know = have the answer in your head · about = on the subject of · ask = say a question to a person',
          lines: [
            { text: 'On Saturday morning, there is a market in the square. Sam, Dina, Lina and Ben are at the market. They want food for a picnic.' },
            { speaker: 'Mr Hill', text: 'Good morning! Do you want some apples?' },
            { speaker: 'Lina', text: 'Yes, please! How much are they?' },
            { speaker: 'Mr Hill', text: 'They are two pounds.' },
            { speaker: 'Ben', text: "Oh, I don't like apples. Do you have bananas?" },
            { speaker: 'Mr Hill', text: 'Yes, I do. Here you are.' },
            { speaker: 'Sam', text: 'Lina, do you like bananas?' },
            { speaker: 'Lina', text: "No, I don't. I like oranges." },
            { speaker: 'Ben', text: 'Does Dina like cheese?' },
            { speaker: 'Sam', text: "No, she doesn't. She likes bread and tomatoes, but she doesn't like cheese!" },
            { text: 'The friends buy bread, cheese, juice, bananas and oranges. Then Sam has a question.' },
            { speaker: 'Sam', text: 'Mr Hill, do you know this key?' },
            { text: 'Mr Hill looks at the key for a long time. Then he smiles.' },
            { speaker: 'Mr Hill', text: 'Hmm ... Ask Ms Rose at the library. She knows a lot about Greenhill.' },
            { speaker: 'Ben', text: 'Does Ms Rose work on Saturday?' },
            { speaker: 'Mr Hill', text: "No, she doesn't. Go on Monday!" },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch8-4', n: 4, type: 'choice', tf: true, title: 'True or false? Circle T or F.',
          items: [
            tf('Ben likes apples.', false, "He doesn't like apples."),
            tf('Lina likes oranges.', true),
            tf('Lina likes bananas.', false, "She doesn't like bananas."),
            tf('Dina likes cheese.', false, "She doesn't like cheese."),
          ],
        },
        {
          id: 'ch8-5', n: 5, type: 'write', title: "Answer with a short answer: Yes, he does. / No, she doesn't. / Yes, they do.",
          items: [
            { prompt: 'Does Ben like apples?', answer: short(false, 'he') },
            { prompt: 'Does Lina like oranges?', answer: short(true, 'she') },
            { prompt: 'Does Ms Rose work on Saturday?', answer: short(false, 'she') },
            { prompt: 'Do the friends want food for a picnic?', answer: short(true, 'they') },
          ],
        },
        {
          id: 'ch8-6', n: 6, type: 'choice', abc: true, title: 'Mr Hill says, "Here you are." What does it mean? Circle a, b or c.',
          items: [{ q: '"Here you are."', options: ['Take this. It is for you.', 'Where are you?', 'Goodbye.'], answer: 'Take this. It is for you.' }],
        },
        {
          id: 'ch8-7', n: 7, type: 'mixed', title: 'Think! Read the story again. Answer.',
          items: [
            {
              kind: 'choice', abc: true, q: 'Mr Hill looks at the key for a long time. Then he smiles. What do you think?',
              options: ['He knows something about the key.', "He doesn't like the key.", 'He wants an apple.'], answer: 'He knows something about the key.',
            },
            { kind: 'write', prompt: 'Who can help the Map Club now?', answer: 'Ms Rose (at the library)', keywords: ['Rose'] },
          ],
        },
      ],
    },
    {
      title: "Grammar: don't, doesn't, Do ...? Does ...?",
      activities: [
        {
          id: 'ch8-grammar', type: 'info', title: "Grammar: don't, doesn't, Do ...? Does ...?",
          blocks: [
            {
              kind: 'list',
              items: [
                "Not sentences: I / you / we / they **don't** (do not) + verb. He / she / it **doesn't** (does not) + verb.",
                'Questions: **Do** you like apples? **Does** she like cheese?',
                "Short answers: Yes, I do. / No, I don't. · Yes, she does. / No, she doesn't.",
              ],
            },
            {
              kind: 'table', head: ['', '✗ (not)', '?', 'Short answers'],
              rows: [
                ['I, you, we, they', "I don't like apples.", 'Do you like apples?', "Yes, I do. / No, I don't."],
                ['he, she, it', "She doesn't like cheese.", 'Does she like cheese?', "Yes, she does. / No, she doesn't."],
              ],
            },
            { kind: 'mistakes', pairs: [["She doesn't likes cheese.", "She doesn't like cheese."], ["He don't like apples.", "He doesn't like apples."], ['You like bananas?', 'Do you like bananas?']] },
            { kind: 'note', text: "**and** adds more: I like apples and oranges. **but** shows something different: I like apples, but I don't like bananas." },
          ],
        },
        {
          id: 'ch8-8', n: 8, type: 'gap', title: "Look at the example. Write don't or doesn't.",
          context: [{ kind: 'p', text: "Example: I **don't** like carrots." }],
          bank: ["don't", "doesn't"],
          items: [
            { text: 'Ben ___ like apples.', answer: "doesn't" },
            { text: 'We ___ go to school on Saturday.', answer: "don't" },
            { text: 'Dina ___ like cheese.', answer: "doesn't" },
            { text: 'They ___ have a dog.', answer: "don't" },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch8-9', n: 9, type: 'gap', title: 'Write the question. Then answer it.',
          context: [{ kind: 'p', text: 'Example: you / like / bananas → **Do you like bananas? Yes, I do.**' }],
          items: [
            { q: 'Lina / like / oranges', text: 'Question: ___   Answer: ___', answers: [['Does Lina like oranges?'], short(true, 'she')] },
            { q: 'Ben / like / apples', text: 'Question: ___   Answer: ___', answers: [['Does Ben like apples?'], short(false, 'he')] },
            { q: 'Sam and Lina / go / to the market', text: 'Question: ___   Answer: ___', answers: [['Do Sam and Lina go to the market?'], short(true, 'they')] },
          ],
        },
        {
          id: 'ch8-10', n: 10, type: 'gap', title: 'Write and or but.',
          bank: ['and', 'but'],
          items: [
            { text: 'I like bread ___ cheese.', answer: 'and' },
            { text: "Lina likes oranges, ___ she doesn't like bananas.", answer: 'but' },
            { text: 'Ben is funny ___ kind.', answer: 'and' },
            { text: 'The clock tower is tall, ___ the clock is broken.', answer: 'but' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch8-11', n: 11, type: 'open', title: 'Ask two people in your family: "Do you like ...?" Then write about them.',
          context: [{ kind: 'pics', items: [{ img: 'apple', text: 'apples' }, { img: 'carrot', text: 'carrots' }, { img: 'cheese', text: 'cheese' }, { img: 'banana', text: 'bananas' }, { img: 'juice', text: 'juice' }] }],
          frames: [
            { before: '', hint: "Mum likes cheese, but she doesn't like bananas." },
            { before: '', hint: 'Dad likes apples and juice.' },
          ],
          talk: 'At the market. You are the shopper. Your adult has the shop. Say: "Good morning! Do you have apples? How much are they? Here you are. Thank you!" Then change places.',
          model: "Mum likes cheese, but she doesn't like bananas. Dad likes apples and juice.",
        },
        {
          id: 'ch8-market', type: 'dialogue', title: 'Talk: At the market',
          roles: ['Shopper', 'Shopkeeper'],
          lines: [
            { speaker: 'Shopper', text: 'Good morning! Do you have apples?' },
            { speaker: 'Shopkeeper', text: 'Yes, I do.' },
            { speaker: 'Shopper', text: 'How much are they?' },
            { speaker: 'Shopkeeper', text: 'They are two pounds.' },
            { speaker: 'Shopper', text: 'Here you are.' },
            { speaker: 'Shopkeeper', text: 'Thank you!' },
          ],
        },
      ],
    },
    {
      title: 'Chapter 8 Review',
      activities: [
        {
          id: 'ch8-12', n: 12, type: 'gap', review: true, title: 'Look and write the food.',
          items: [
            { img: 'apple', answer: ['apple', 'an apple'] },
            { img: 'bread', answer: 'bread' },
            { img: 'carrot', answer: ['carrot', 'a carrot'] },
            { img: 'cheese', answer: 'cheese' },
          ],
        },
        {
          id: 'ch8-13', n: 13, type: 'gap', review: true, title: "Write do, does, don't or doesn't.",
          bank: ['Do', 'Does', "don't", "doesn't"],
          items: [
            { text: '___ you like juice? Yes, I do.', answer: 'Do' },
            { text: '___ Ben like football? Yes, he does.', answer: 'Does' },
            { text: 'I ___ like carrots. They are not nice!', answer: "don't" },
            { text: 'Lina ___ like bananas.', answer: "doesn't" },
          ],
        },
        {
          id: 'ch8-14', n: 14, type: 'write', review: true, title: 'Read. Answer with a short answer.',
          context: [{ kind: 'p', cls: 'reading', text: "Mia has a picnic in the park with her dad. They have bread, cheese and apples. Mia likes apples, but she doesn't like cheese. Her dad likes cheese. They don't have juice. They have water." }],
          items: [
            { prompt: 'Does Mia like apples?', answer: short(true, 'she') },
            { prompt: 'Does Mia like cheese?', answer: short(false, 'she') },
            { prompt: 'Does her dad like cheese?', answer: short(true, 'he') },
            { prompt: 'Do they have juice?', answer: short(false, 'they') },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch8-check', [
          'name food.',
          "say what I like and don't like.",
          'ask and answer: Do you ...? Does she ...?',
          'use and and but.',
        ]),
      ],
    },
  ],
};
