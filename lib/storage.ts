import { UserProgress } from './types';

const PROGRESS_KEY = 'sl_progress';
const ONBOARDED_KEY = 'sl_onboarded';
const EXERCISE_CACHE_KEY = 'sl_exercise_cache';
const CACHE_TTL_DAYS = 7;

// Cards removed when switching to Castilian-only content
const REMOVED_CARD_IDS = new Set([
  'slang-chévere',
  'slang-pibe',
  'slang-buena-onda',
  'slang-estar-al-pedo',
  'slang-no-mames',
  'slang-órale',
  'slang-de-pelos',
]);

const defaultProgress: UserProgress = {
  cards: {},
  xp: 0,
  streak: 0,
  lastStudyDate: '',
  selectedCategoryIds: [],
  totalExercisesCompleted: 0,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const progress: UserProgress = raw ? { ...defaultProgress, ...JSON.parse(raw) } : { ...defaultProgress };
    // Purge removed cards and persist if any were found
    const removedKeys = Object.keys(progress.cards).filter((id) => REMOVED_CARD_IDS.has(id));
    if (removedKeys.length > 0) {
      removedKeys.forEach((id) => delete progress.cards[id]);
      saveProgress(progress);
    }
    return progress;
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

export function setOnboarded(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDED_KEY, 'true');
}

interface CacheEntry {
  exercise: unknown;
  createdAt: string;
}

export function getCachedExercise(phraseId: string, exerciseType: string): unknown | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EXERCISE_CACHE_KEY);
    if (!raw) return null;
    const cache: Record<string, CacheEntry> = JSON.parse(raw);
    const key = `${phraseId}:${exerciseType}`;
    const entry = cache[key];
    if (!entry) return null;
    const age = (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (age > CACHE_TTL_DAYS) return null;
    return entry.exercise;
  } catch {
    return null;
  }
}

export function setCachedExercise(phraseId: string, exerciseType: string, exercise: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(EXERCISE_CACHE_KEY);
    const cache: Record<string, CacheEntry> = raw ? JSON.parse(raw) : {};
    cache[`${phraseId}:${exerciseType}`] = { exercise, createdAt: new Date().toISOString() };
    localStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

export function clearExerciseCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXERCISE_CACHE_KEY);
}
