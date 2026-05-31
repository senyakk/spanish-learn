'use client';

import { create } from 'zustand';
import { SRSCard, UserProgress } from '@/lib/types';
import { loadProgress, saveProgress, loadProgressFromDb, saveProgressToDb } from '@/lib/storage';
import { sm2, Quality } from '@/lib/srs';

interface ProgressStore extends UserProgress {
  isLoaded: boolean;
  load: () => void;
  updateCard: (card: SRSCard) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  setSelectedCategories: (ids: string[]) => void;
  incrementCompleted: () => void;
  applyAnswer: (card: SRSCard, quality: Quality) => SRSCard;
  introduceCard: (card: SRSCard) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  cards: {},
  xp: 0,
  streak: 0,
  lastStudyDate: '',
  selectedCategoryIds: [],
  totalExercisesCompleted: 0,
  isLoaded: false,

  load: async () => {
    const local = loadProgress();
    set({ ...local, isLoaded: true });
    const remote = await loadProgressFromDb();
    if (remote) {
      saveProgress(remote);
      set({ ...remote, isLoaded: true });
    }
  },

  updateCard: (card: SRSCard) => {
    set((state) => {
      const cards = { ...state.cards, [card.id]: card };
      const next = { ...state, cards };
      saveProgress(next);
      saveProgressToDb(next);
      return { cards };
    });
  },

  applyAnswer: (card: SRSCard, quality: Quality) => {
    const updated = sm2(card, quality);
    get().updateCard(updated);
    return updated;
  },

  introduceCard: (card: SRSCard) => {
    set((state) => {
      if (state.cards[card.id]) return state;
      const cards = { ...state.cards, [card.id]: card };
      const next = { ...state, cards };
      saveProgress(next);
      saveProgressToDb(next);
      return { cards };
    });
  },

  addXP: (amount: number) => {
    set((state) => {
      const xp = state.xp + amount;
      const next = { ...state, xp };
      saveProgress(next);
      saveProgressToDb(next);
      return { xp };
    });
  },

  updateStreak: () => {
    set((state) => {
      const today = new Date().toDateString();
      const last = state.lastStudyDate;
      let streak = state.streak;

      if (last === today) return state;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (last === yesterday.toDateString()) {
        streak += 1;
      } else if (last !== today) {
        streak = 1;
      }

      const next = { ...state, streak, lastStudyDate: today };
      saveProgress(next);
      saveProgressToDb(next);
      return { streak, lastStudyDate: today };
    });
  },

  setSelectedCategories: (ids: string[]) => {
    set((state) => {
      const next = { ...state, selectedCategoryIds: ids };
      saveProgress(next);
      saveProgressToDb(next);
      return { selectedCategoryIds: ids };
    });
  },

  incrementCompleted: () => {
    set((state) => {
      const total = state.totalExercisesCompleted + 1;
      const next = { ...state, totalExercisesCompleted: total };
      saveProgress(next);
      saveProgressToDb(next);
      return { totalExercisesCompleted: total };
    });
  },
}));
