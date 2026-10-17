// Prints every word and sentence the app may listen for, as JSON.
import { BOOK } from '../js/content/index.js';

const out = new Set();
for (const unit of BOOK.units) {
  for (const section of unit.sections) {
    for (const a of section.activities) {
      if (a.type === 'words') a.groups.forEach((g) => g.words.forEach((w) => out.add(w.word)));
      if (a.type === 'speak') a.items.forEach((i) => [i.text, ...(i.accept || [])].forEach((t) => out.add(t)));
      if (a.type === 'story' || a.type === 'dialogue') a.lines.forEach((l) => l.text && out.add(l.text));
    }
  }
}
console.log(JSON.stringify([...out]));
