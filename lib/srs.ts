import { addDays } from 'date-fns';
import { SRSCard } from './types';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export function sm2(card: SRSCard, quality: Quality): SRSCard {
  let { interval, repetition, efactor } = card;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);
    repetition += 1;
  }

  efactor = Math.max(
    1.3,
    efactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...card,
    interval,
    repetition,
    efactor,
    nextReview: addDays(new Date(), interval).toISOString(),
    lastReview: new Date().toISOString(),
    timesSeen: card.timesSeen + 1,
    timesCorrect: quality >= 3 ? card.timesCorrect + 1 : card.timesCorrect,
    timesWrong: quality < 3 ? card.timesWrong + 1 : card.timesWrong,
  };
}

export function isDue(card: SRSCard): boolean {
  return new Date(card.nextReview) <= new Date();
}

export function getSRSStage(card: SRSCard): string {
  if (card.repetition === 0) return 'New';
  if (card.interval <= 1) return 'Learning';
  if (card.interval <= 7) return 'Young';
  if (card.interval <= 21) return 'Mature';
  return 'Mastered';
}

const EXERCISE_TYPES: Array<'multiple-choice' | 'fill-in-blank' | 'translation'> = [
  'multiple-choice',
  'fill-in-blank',
  'translation',
];

export function getExerciseType(card: SRSCard): 'multiple-choice' | 'fill-in-blank' | 'translation' {
  // First encounter: always multiple-choice so the learner sees the word in context first
  if (card.repetition === 0) return 'multiple-choice';
  // After that: random across all three types for variety
  return EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
}

export function createNewCard(
  id: string,
  phrase: string,
  translation: string,
  categoryIds: string[]
): SRSCard {
  return {
    id,
    phrase,
    translation,
    categoryIds,
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    nextReview: new Date().toISOString(),
    lastReview: null,
    timesSeen: 0,
    timesCorrect: 0,
    timesWrong: 0,
  };
}
