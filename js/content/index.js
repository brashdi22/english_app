// The whole book, in the order of the 12-week plan.
import begin from './begin.js';
import starter from './starter.js';
import ch1 from './ch01.js';
import ch2 from './ch02.js';
import ch3 from './ch03.js';
import cp1 from './cp1.js';
import ch4 from './ch04.js';
import ch5 from './ch05.js';
import ch6 from './ch06.js';
import cp2 from './cp2.js';
import ch7 from './ch07.js';
import ch8 from './ch08.js';
import ch9 from './ch09.js';
import cp3 from './cp3.js';
import ch10 from './ch10.js';
import final from './final.js';

const chapters = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10];

// Word Bank: every New Word from the chapters, from A to Z.
const wordBank = chapters
  .flatMap((ch, i) => ch.sections.flatMap((s) => s.activities)
    .filter((a) => a.type === 'words')
    .flatMap((a) => a.groups.flatMap((g) => g.words))
    .map((w) => ({ ...w, hint: `Ch ${i + 1}` })))
  .sort((a, b) => a.word.localeCompare(b.word));

const reference = {
  id: 'ref',
  kind: 'reference',
  label: 'Reference',
  title: 'Grammar Summary and Word Bank',
  week: 12,
  color: '#7f8c8d',
  icon: 'i-find',
  intro: 'All the grammar and all the new words in this book. Use them in Week 12 and when you are not sure.',
  sections: [
    {
      title: 'Grammar Summary',
      activities: [
        {
          id: 'ref-grammar', type: 'info', title: 'Grammar Summary', doneLabel: 'Done ✓',
          blocks: [{
            kind: 'table', head: ['Grammar (chapter)', 'Rule', 'Examples'],
            rows: [
              ['am / is / are (1)', 'I am · he / she / it is · you / we / they are', 'I am Sam. She is ten. They are my friends.'],
              ["my, your, his, her, our, their; 's (2)", 'I → my · you → your · he → his · she → her · we → our · they → their', "His name is Karim. Sam's mum is a teacher."],
              ['a / an, plurals (3)', 'an before a, e, i, o, u · plural: -s, -es (s, x, ch, sh) · child → children', 'a pen, an egg · books, boxes, children'],
              ["isn't / aren't, questions (4)", "not: isn't, aren't, I'm not · question: Is it …? Are they …?", "It isn't my bag. Is it your key? Yes, it is. / No, it isn't."],
              ['this, that, these, those (4)', 'near: this (one), these (many) · far: that (one), those (many)', 'this pen, these pens, that cap, those caps'],
              ['have / has (5)', 'I / you / we / they have · he / she / it has', 'I have a sister. Lina has glasses.'],
              ['describing words (5)', 'before the thing; no -s', 'long black hair, a big smile, two big bags'],
              ['there is / there are (6)', 'there is + one · there are + two or more', 'There is a park. There are two shops.'],
              ['in, on, under … (6)', 'in · on · under · next to · between · behind · in front of', 'The cat is under the table.'],
              ['present simple (7)', 'I / you / we / they play · he / she / it plays (goes, does, has)', 'I get up at seven. Ben plays football.'],
              ["don't / doesn't, Do …? Does …? (8)", "I don't like … · she doesn't like … · Do you …? Does he …?", "She doesn't like cheese. Do you like apples? Yes, I do."],
              ['and, but, because (8, 9)', 'and = more · but = different · because = the reason', "I like apples, but I don't like bananas."],
              ['now: am / is / are + -ing (9)', 'read → reading · write → writing · sit → sitting', 'She is reading. They are walking.'],
              ['who, what, where, when, why (9)', 'person · thing · place · time · reason', 'Where is the library? Why? Because ...'],
              ['past: was / were, -ed (10)', 'I / he / she / it was · you / we / they were · walk → walked', 'It was sunny. We walked to the park.'],
              ['special past verbs (10)', 'go → went · see → saw · find → found · say → said · make → made · put → put · have → had', 'Ben found a box. We went to the clock tower.'],
            ],
          }],
        },
      ],
    },
    {
      title: 'Word Bank',
      activities: [
        { id: 'ref-words', type: 'words', title: 'Word Bank', groups: [{ title: 'All the new words in this book, from A to Z. Tap the words you know!', words: wordBank }] },
      ],
    },
  ],
};

export const BOOK = {
  title: 'English Adventures in Greenhill',
  subtitle: 'A 12-week English reading and writing course for beginners aged 10. Words · Reading · Grammar · Writing · Speaking',
  credits: 'English Adventures in Greenhill — interactive edition. Pictures: Twemoji icons (© Twitter, Inc. and other contributors, licensed CC-BY 4.0) and drawings made for the book. Characters, places and events in the story are made up. Offline listening: vosk-browser (Ciaran O\u2019Reilly) and the Vosk English model (Alpha Cephei), licensed Apache-2.0.',
  units: [begin, starter, ch1, ch2, ch3, cp1, ch4, ch5, ch6, cp2, ch7, ch8, ch9, cp3, ch10, final, reference],
};
