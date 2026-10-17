// Scores and summaries worked out from a child's saved progress. Shared by
// the child's own pages, the parent dashboard and the family scoreboard.

import { BOOK } from './content/index.js';
import { activityPoints } from './points.js';
import { starsForResult } from './scoring.js';

export const UNITS = BOOK.units;
export const unitActivities = (unit) => unit.sections.flatMap((s) => s.activities);

const ALL_ACTIVITIES = UNITS.flatMap((u) => unitActivities(u).map((a) => ({ unit: u, act: a })));
const STORIES = ALL_ACTIVITIES.filter(({ act }) => act.type === 'story' && act.record);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function unitProgress(unit, progress) {
  const acts = unitActivities(unit);
  const done = acts.filter((a) => progress[a.id]?.completed).length;
  return { done, total: acts.length };
}

export function reviewScore(unit, progress, filter = (a) => a.review) {
  const acts = unitActivities(unit).filter(filter);
  if (!acts.length) return null;
  let earned = 0;
  let possible = 0;
  let finished = 0;
  for (const a of acts) {
    const rec = progress[a.id];
    possible += activityPoints(a);
    if (rec?.completed) {
      earned += rec.earned || 0;
      finished++;
    }
  }
  return { earned, possible, finished, count: acts.length };
}

export function bandFor(unit, score) {
  const bands = unit.review?.bands;
  if (!bands) return { stars: starsForResult(score.earned, score.possible), text: '' };
  const i = bands.findIndex(([min]) => score.earned >= min);
  return { stars: Math.max(1, 3 - i), text: bands[i][1] };
}

function latestUpdate(progress) {
  let latest = 0;
  for (const rec of Object.values(progress)) latest = Math.max(latest, Date.parse(rec.updatedAt || 0) || 0);
  return latest;
}

// Everything the parent dashboard and the scoreboard show about one child.
export function computeSummary(progress, now = Date.now()) {
  let stars = 0;
  let starsThisWeek = 0;
  let done = 0;
  let wordsSaid = 0;
  for (const { act } of ALL_ACTIVITIES) {
    const rec = progress[act.id];
    if (!rec) continue;
    stars += rec.bestStars || 0;
    if (rec.completed) done++;
    if (rec.completedAt && now - Date.parse(rec.completedAt) < WEEK_MS) starsThisWeek += rec.bestStars || 0;
    if (act.type === 'speak') wordsSaid += (rec.answers || []).filter((a) => (a?.stars || 0) >= 1).length;
  }

  const units = {};
  let reviewEarned = 0;
  let reviewPossible = 0;
  let unitsFinished = 0;
  for (const unit of UNITS) {
    const p = unitProgress(unit, progress);
    const score = reviewScore(unit, progress);
    const finished = Boolean(score && score.finished === score.count);
    units[unit.id] = {
      done: p.done,
      total: p.total,
      score,
      stars: finished ? bandFor(unit, score).stars : 0,
    };
    if (finished) {
      reviewEarned += score.earned;
      reviewPossible += score.possible;
      unitsFinished++;
    }
  }

  const reading = {};
  let bestWpm = 0;
  for (const { act } of STORIES) {
    const records = progress[act.id]?.data?.keep?.records || [];
    if (!records.length) continue;
    const last = records[records.length - 1];
    const wpm = (r) => (r.seconds ? Math.round(((r.words || act.words) / r.seconds) * 60) : 0);
    reading[act.id] = { title: act.storyTitle, words: act.words, count: records.length, last, bestWpm: Math.max(...records.map(wpm)) };
    bestWpm = Math.max(bestWpm, reading[act.id].bestWpm);
  }

  const notYet = [];
  for (const { unit, act } of ALL_ACTIVITIES) {
    if (act.type !== 'check') continue;
    const marks = progress[act.id]?.data?.marks || {};
    act.items.forEach((text, i) => {
      if (marks[i] && marks[i] !== 'yes') notYet.push({ unit: unit.label, text, mark: marks[i] });
    });
  }

  const latest = latestUpdate(progress);
  return {
    stars,
    starsThisWeek,
    done,
    total: ALL_ACTIVITIES.length,
    wordsSaid,
    unitsFinished,
    reviewPercent: reviewPossible ? Math.round((reviewEarned / reviewPossible) * 100) : null,
    bestWpm,
    units,
    reading,
    notYet,
    lastActive: latest ? new Date(latest).toISOString() : null,
    updatedAt: latest ? new Date(latest).toISOString() : null,
  };
}

// A child's summary: worked out from the progress on this device, unless the
// summary saved by another device is newer.
export function summaryFor(profile, now = Date.now()) {
  const local = latestUpdate(profile.progress || {});
  const saved = profile.summary;
  if (saved && (Date.parse(saved.updatedAt || 0) || 0) > local) return saved;
  return computeSummary(profile.progress || {}, now);
}
