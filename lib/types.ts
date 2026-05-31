export interface SRSCard {
  id: string;
  phrase: string;
  translation: string;
  categoryIds: string[];
  interval: number;
  repetition: number;
  efactor: number;
  nextReview: string;
  lastReview: string | null;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  description: string;
  seedPhrases: Array<{ phrase: string; translation: string }>;
}

export type ExerciseType = 'multiple-choice' | 'fill-in-blank' | 'translation';

export interface Exercise {
  type: ExerciseType;
  targetPhrase: string;
  targetTranslation: string;
  sentence: string;
  sentenceTranslation: string;
  options?: string[];
  blankWord?: string;
  hint?: string;
  correctAnswer: string;
  acceptableVariants?: string[];
  highlightedWord?: string; // exact substring as it appears in sentence (may differ from targetPhrase due to conjugation)
}

export interface UserProgress {
  cards: Record<string, SRSCard>;
  xp: number;
  streak: number;
  lastStudyDate: string;
  selectedCategoryIds: string[];
  totalExercisesCompleted: number;
}
