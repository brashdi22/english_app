// Points an activity is worth in the book.
export function activityPoints(a) {
  if (a.points) return a.points;
  if (['gap', 'choice', 'mixed'].includes(a.type)) return a.items.reduce((s, it) => s + (it.points ?? Math.max(1, (it.answers || []).length)), 0);
  if (a.type === 'match') return a.left.length;
  if (a.type === 'tap') return a.mode === 'letter' ? a.words.length : a.answer.length;
  if (a.type === 'order') return a.items.length;
  if (a.type === 'adult') return a.items.reduce((s, it) => s + (it.max ?? 1), 0);
  if (a.type === 'speak') return a.items.length;
  if (a.type === 'sort') return a.bins.reduce((s, b) => s + b.words.length, 0);
  if (a.type === 'sequence') return a.events.length;
  if (a.type === 'multi') return a.options.length;
  if (a.type === 'ask') return a.items.length * (a.scoring?.sentence ?? 1);
  if (a.type === 'open' && a.rubric) return a.rubric.reduce((s, r) => s + r.max, 0);
  if (a.type === 'write') return a.items.reduce((s, it) => s + (it.fullSentence ? 2 : it.points ?? 1), 0);
  return 0;
}
