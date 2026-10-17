import { CHAPTER_REVIEW_BANDS, w, sayWords, soundSpot, progressCheck } from './helpers.js';

const groups = [
  {
    title: 'My day',
    words: [
      w('get up', 'get-up', 'get out of bed', "I **get up** at seven o'clock."),
      w('breakfast', 'breakfast', 'the food you eat in the morning', 'I have **breakfast** with my family.', 'Say: BREK-fust'),
      w('go to school', 'go-to-school', 'go from your house to school', "I **go to school** at eight o'clock."),
      w('lunch', 'lunch', 'the food you eat in the middle of the day', "We have **lunch** at twelve o'clock."),
      w('come home', 'come-home', 'go back to your house', "I **come home** at three o'clock."),
      w('homework', 'homework', 'school work you do at home', 'I do my **homework** after school.', 'Say: HOME-work'),
      w('play', 'ball', 'do fun things like games and sport', 'I **play** football with Ben.'),
      w('go to bed', 'go-to-bed', 'get into bed to sleep', "I **go to bed** at nine o'clock."),
    ],
  },
  {
    title: 'Time words',
    words: [
      w('morning', 'morning', 'the first part of the day', 'I go to school in the **morning**.', 'Say: MOR-ning'),
      w('afternoon', 'afternoon', 'the part of the day after lunch', 'I play in the **afternoon**.', 'Say: ahf-ter-NOON'),
      w('evening', 'evening', 'the part of the day before bed', 'I read in the **evening**.', 'Say: EEV-ning'),
      w('week', 'week', 'seven days', 'There are seven days in a **week**.', 'Rhymes with seek'),
    ],
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const time = (words) => [words, `It is ${words}`, `It's ${words}`];

export default {
  id: 'ch7',
  kind: 'chapter',
  label: 'Chapter 7',
  title: "Sam's Busy Week",
  week: 8,
  color: '#2980b9',
  icon: 'get-up',
  intro: 'The Map Club wants to go to the small door behind the clock tower. But every day, the friends are very busy! When can they go?',
  goals: ['I can talk about my day: I get up, I go to school.', 'I can use **he gets up**, **she goes** (add -s or -es).', "I can tell the time: seven o'clock, half past six.", 'I can say the days of the week.'],
  endGoal: 'At the end of this chapter, you can tell a friend about your day and your week.',
  review: { title: 'Chapter 7 Review', bands: CHAPTER_REVIEW_BANDS },
  sections: [
    {
      title: 'New Words',
      activities: [
        { id: 'ch7-words', type: 'words', title: 'New Words', groups, strip: DAYS.map((d) => ({ text: d })) },
        sayWords('ch7-say', groups, DAYS.map((d) => ({ text: d }))),
      ],
    },
    {
      title: 'Word Practice',
      activities: [
        {
          id: 'ch7-1', n: 1, type: 'gap', title: 'Look at the pictures. Write the words.',
          bank: ['get up', 'have breakfast', 'go to school', 'have lunch', 'do homework', 'go to bed'],
          items: [
            { img: 'get-up', answer: 'get up' },
            { img: 'breakfast', answer: 'have breakfast' },
            { img: 'bus', answer: 'go to school' },
            { img: 'lunch', answer: 'have lunch' },
            { img: 'homework', answer: 'do homework' },
            { img: 'bed', answer: 'go to bed' },
          ],
        },
        {
          id: 'ch7-2', n: 2, type: 'gap', title: 'Write the missing days.',
          items: [{ text: 'Monday, ___, Wednesday, ___, Friday, ___, Sunday', answers: ['Tuesday', 'Thursday', 'Saturday'] }],
        },
        {
          id: 'ch7-3', n: 3, type: 'open', title: 'Morning, afternoon or evening? Write about you.',
          frames: [
            { before: 'I have breakfast in the' },
            { before: 'I do my homework in the' },
            { before: 'I read a book in the' },
          ],
          model: 'I have breakfast in the morning. I do my homework in the afternoon. I read a book in the evening.',
        },
      ],
    },
    {
      title: 'Sound Spot: er, ir, ur',
      activities: [
        soundSpot('ch7-sound', 'Read the er, ir and ur words', '**er**, **ir** and **ur** all say the same sound. Learn which one each word has! er: teacher · sister · brother · her. ir: girl · first · bird · thirteen. ur: Thursday · turn · purple · Saturday.',
          ['teacher', 'sister', 'brother', 'her', 'girl', 'first', 'bird', 'thirteen', 'Thursday', 'turn', 'purple', 'Saturday']),
        {
          id: 'ch7-4', n: 4, type: 'gap', title: 'Write er, ir or ur.',
          bank: ['er', 'ir', 'ur'],
          items: [
            { text: 'sist___', answer: 'er' },
            { text: 'g___l', answer: 'ir' },
            { text: 'Th___sday', answer: 'ur' },
            { text: 'f___st', answer: 'ir' },
            { text: 'teach___', answer: 'er' },
            { text: 'p___ple', answer: 'ur' },
          ],
        },
      ],
    },
    {
      title: 'Read the Story',
      activities: [
        {
          id: 'ch7-story', type: 'story', record: true, title: 'Read the Story', storyTitle: 'My Busy Week', words: 158,
          helpers: 'busy = with a lot to do · every day = all the days · after school = when school ends · free = not busy · market = a lot of small shops',
          lines: [
            { text: "Every day, I get up at seven o'clock. I have breakfast with my family. Then Dad goes to the hospital and Mum goes to her school." },
            { text: "I go to school at eight o'clock. Lina goes to school with me. We have lunch at twelve o'clock. I come home at three o'clock." },
            { text: "In the afternoon, I do my homework. In the evening, I play with Dina and I read a book. I go to bed at nine o'clock." },
            { text: 'My friends are very busy too. On Monday, Lina goes to the library. On Tuesday and Thursday, Ben plays football in the park.' },
            { text: 'On Wednesday, the Map Club meets at the café after school. On Friday, Gran comes to our house. On Sunday, I go to the park with Dina and Gran.' },
            { text: 'But on Saturday morning, we are free! We go to the market in the square. Then we can go to the clock tower and look for the small door!' },
          ],
        },
      ],
    },
    {
      title: 'Questions',
      activities: [
        {
          id: 'ch7-5', n: 5, type: 'sequence', title: "Put Sam's day in order. Write 1 to 6.",
          events: ['He goes to bed.', 'He has lunch.', 'He gets up.', 'He does his homework.', 'He goes to school.', 'He has breakfast.'],
          order: [6, 4, 1, 5, 3, 2],
        },
        {
          id: 'ch7-6', n: 6, type: 'gap', title: 'Write the time.',
          items: [
            { text: 'Sam gets up at ___.', answer: ["seven o'clock", "7 o'clock", 'seven', '7:00'] },
            { text: 'He goes to school at ___.', answer: ["eight o'clock", "8 o'clock", 'eight', '8:00'] },
            { text: 'He comes home at ___.', answer: ["three o'clock", "3 o'clock", 'three', '3:00'] },
            { text: 'He goes to bed at ___.', answer: ["nine o'clock", "9 o'clock", 'nine', '9:00'] },
          ],
        },
        {
          id: 'ch7-7', n: 7, type: 'match', title: 'Who? When? Match.',
          left: ['Lina goes to the library ...', 'Ben plays football ...', 'The Map Club meets at the café ...', "Gran comes to Sam's house ..."],
          right: ['on Friday.', 'on Wednesday.', 'on Monday.', 'on Tuesday and Thursday.'],
          answer: 'cdba',
        },
        {
          id: 'ch7-8', n: 8, type: 'open', lines: 2, title: 'Think! When can the friends go to the clock tower? Why then?',
          model: "On Saturday morning. They are free on Saturday. / They aren't busy on Saturday.",
        },
      ],
    },
    {
      title: 'Grammar: I get up, he gets up',
      activities: [
        {
          id: 'ch7-grammar', type: 'info', title: 'Grammar: I get up, he gets up',
          blocks: [
            { kind: 'p', text: 'We use these verbs for things we do every day or every week.' },
            { kind: 'list', items: ['**I, you, we, they + verb**: I get up at seven. We play football.', '**he, she, it + verb + s**: Ben plays football. Lina gets up at seven.'] },
            {
              kind: 'table', head: ['+s', '+es', 'special'],
              rows: [['play → plays', 'go → goes', 'have → has'], ['get → gets', 'do → does', ''], ['read → reads', 'watch → watches', '']],
            },
            { kind: 'mistakes', pairs: [['She get up at seven.', 'She gets up at seven.'], ['I goes to school.', 'I go to school.'], ['He haves lunch.', 'He has lunch.']] },
            { kind: 'p', text: '**Time words**' },
            { kind: 'pics', items: [{ img: 't-0700', text: "seven o'clock" }, { img: 't-0630', text: 'half past six' }, { img: 't-1200', text: "twelve o'clock" }] },
            { kind: 'table', head: ['on + day', 'at + time', 'in + part of the day'], rows: [['on Monday', "at seven o'clock", 'in the morning']] },
          ],
        },
        {
          id: 'ch7-9', n: 9, type: 'gap', title: 'Look at the example. Write the verb for he or she.',
          context: [{ kind: 'p', text: 'Example: I play → he **plays**' }],
          items: [
            { text: 'I get → she ___', answer: 'gets' },
            { text: 'I go → he ___', answer: 'goes' },
            { text: 'I read → she ___', answer: 'reads' },
            { text: 'I do → he ___', answer: 'does' },
            { text: 'I have → she ___', answer: 'has' },
            { text: 'I come → he ___', answer: 'comes' },
            { text: 'I watch → she ___', answer: 'watches' },
          ],
        },
      ],
    },
    {
      title: 'Grammar Practice',
      activities: [
        {
          id: 'ch7-10', n: 10, type: 'choice', title: 'Circle the right word.',
          items: [
            { q: 'Lina ___ to the library on Monday.', options: ['go', 'goes'], answer: 'goes' },
            { q: "I ___ up at seven o'clock.", options: ['get', 'gets'], answer: 'get' },
            { q: 'Ben and Sam ___ football.', options: ['play', 'plays'], answer: 'play' },
            { q: 'Dad ___ breakfast at seven.', options: ['have', 'has'], answer: 'has' },
            { q: 'We ___ our homework in the afternoon.', options: ['do', 'does'], answer: 'do' },
          ],
        },
        {
          id: 'ch7-11', n: 11, type: 'gap', title: 'What time is it? Write.',
          items: [
            { img: 't-0200', answer: time("two o'clock") },
            { img: 't-0530', answer: time('half past five') },
            { img: 't-1000', answer: time("ten o'clock") },
            { img: 't-1130', answer: time('half past eleven') },
            { img: 't-0430', answer: time('half past four') },
            { img: 't-0100', answer: time("one o'clock") },
          ],
        },
        {
          id: 'ch7-12', n: 12, type: 'gap', title: 'Write on, at or in.',
          bank: ['on', 'at', 'in'],
          items: [
            { text: '___ Monday', answer: 'on' },
            { text: "___ seven o'clock", answer: 'at' },
            { text: '___ the morning', answer: 'in' },
            { text: '___ Saturday', answer: 'on' },
            { text: '___ the evening', answer: 'in' },
            { text: '___ half past three', answer: 'at' },
          ],
        },
      ],
    },
    {
      title: 'Write and Speak',
      activities: [
        {
          id: 'ch7-13', n: 13, type: 'open', title: 'Write about your day.',
          frames: [
            { before: 'I get up at' },
            { before: 'I have breakfast at' },
            { before: 'I go to school at' },
            { before: 'In the afternoon, I' },
            { before: 'I go to bed at' },
          ],
          talk: 'Ask your adult: "What time do you get up?" Then tell your adult about them: "My mum gets up at six o’clock. She goes to work at seven."',
          model: "I get up at half past six. I have breakfast at seven o'clock. I go to school at seven o'clock. In the afternoon, I play football. I go to bed at nine o'clock.",
        },
      ],
    },
    {
      title: 'Chapter 7 Review',
      activities: [
        {
          id: 'ch7-14', n: 14, type: 'gap', review: true, title: 'Write the days.',
          items: [
            { text: 'Monday, ___, Wednesday', answer: 'Tuesday' },
            { text: 'Wednesday, ___, Friday', answer: 'Thursday' },
            { text: 'Friday, ___, Sunday', answer: 'Saturday' },
            { text: 'There are ___ days in a week.', answer: ['seven', '7'] },
          ],
        },
        {
          id: 'ch7-15', n: 15, type: 'gap', review: true, title: 'Write the right form of the verb.',
          items: [
            { text: "Dina (go) ___ to bed at eight o'clock.", answer: 'goes' },
            { text: "We (have) ___ lunch at twelve o'clock.", answer: 'have' },
            { text: 'Mum (read) ___ in the evening.', answer: 'reads' },
            { text: 'Ben (do) ___ his homework.', answer: 'does' },
          ],
        },
        {
          id: 'ch7-16', n: 16, type: 'gap', review: true, title: 'What time is it?',
          items: [
            { img: 't-0900', answer: time("nine o'clock") },
            { img: 't-0730', answer: time('half past seven') },
            { img: 't-1200', answer: time("twelve o'clock") },
            { img: 't-0300', answer: time("three o'clock") },
          ],
        },
      ],
    },
    {
      title: 'Progress Check',
      activities: [
        progressCheck('ch7-check', [
          'talk about my day (I get up, I go to school).',
          'use he gets up, she goes.',
          "tell the time (o'clock, half past).",
          'say the days of the week.',
        ]),
      ],
    },
  ],
};
