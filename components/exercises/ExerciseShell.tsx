'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise, SRSCard } from '@/lib/types';
import { useProgressStore } from '@/store/progress';
import { getExerciseType, createNewCard, isDue } from '@/lib/srs';
import { CATEGORIES } from '@/lib/categories';
import { getCachedExercise, setCachedExercise } from '@/lib/storage';
import { playSound, AnswerResult } from '@/lib/utils';
import { Quality } from '@/lib/srs';
import ProgressBar from '../ui/ProgressBar';
import XPToast from '../ui/XPToast';
import MultipleChoice from './MultipleChoice';
import FillInBlank from './FillInBlank';
import TranslationInput from './TranslationInput';
import Button from '../ui/Button';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

const SESSION_SIZE = 10;
const XP_CORRECT = 10;
const XP_HINT = 5;

async function fetchExercise(
  card: SRSCard,
  exerciseType: string,
  categoryIds: string[]
): Promise<Exercise | null> {
  const cached = getCachedExercise(card.id, exerciseType);
  if (cached) return cached as Exercise;

  const categoryLabels = categoryIds
    .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
    .filter(Boolean);

  try {
    const res = await fetch('/api/generate-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phrase: card.phrase,
        translation: card.translation,
        categoryLabels,
        exerciseType,
        difficulty: card.repetition <= 1 ? 'beginner' : card.repetition <= 3 ? 'intermediate' : 'advanced',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.exercise) {
      setCachedExercise(card.id, exerciseType, data.exercise);
      return data.exercise as Exercise;
    }
    return null;
  } catch {
    return null;
  }
}

interface SessionCompleteProps {
  xpEarned: number;
  correct: number;
  total: number;
  onContinue: () => void;
}

function SessionComplete({ xpEarned, correct, total, onContinue }: SessionCompleteProps) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-6"
    >
      <Trophy size={72} className="text-yellow-400" />
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Session Complete!</h2>
        <p className="text-gray-500 text-lg">{correct} / {total} correct</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-8 py-4">
        <p className="text-4xl font-extrabold text-yellow-500">+{xpEarned} XP</p>
        <p className="text-sm text-yellow-600 mt-1">earned this session</p>
      </div>
      <Button onClick={onContinue} size="lg" className="w-full max-w-xs">
        Keep Going
      </Button>
    </motion.div>
  );
}

export default function ExerciseShell({ reviewOnly = false }: { reviewOnly?: boolean }) {
  const store = useProgressStore();
  const [queue, setQueue] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState<AnswerResult | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [showXPToast, setShowXPToast] = useState(false);
  const [lastXP, setLastXP] = useState(XP_CORRECT);
  const [prefetchCache, setPrefetchCache] = useState<Record<string, Exercise>>({});

  // Build session queue
  useEffect(() => {
    if (!store.isLoaded) return;

    const selected = store.selectedCategoryIds;
    const allPhrases: Array<{ phrase: string; translation: string; categoryId: string }> = [];
    selected.forEach((catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId);
      cat?.seedPhrases.forEach((sp) => allPhrases.push({ ...sp, categoryId: catId }));
    });

    const dueCards: SRSCard[] = [];
    const newCards: SRSCard[] = [];

    allPhrases.forEach(({ phrase, translation, categoryId }) => {
      const id = `${categoryId}-${phrase.replace(/\s+/g, '-')}`;
      const existing = store.cards[id];
      if (existing) {
        if (reviewOnly || isDue(existing)) dueCards.push(existing);
      } else if (!reviewOnly) {
        const card = createNewCard(id, phrase, translation, [categoryId]);
        store.introduceCard(card);
        newCards.push(card);
      }
    });

    dueCards.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

    const sessionCards = reviewOnly
      ? dueCards.slice(0, SESSION_SIZE)
      : [...dueCards, ...newCards].slice(0, SESSION_SIZE);
    setQueue(sessionCards);
    setCurrentIndex(0);
    setLoading(true);
  }, [store.isLoaded, store.selectedCategoryIds, reviewOnly]);

  const currentCard = queue[currentIndex];

  // Load exercise for current card
  useEffect(() => {
    if (!currentCard) return;
    setAnswered(null);
    setExercise(null);
    setLoading(true);

    const exType = getExerciseType(currentCard);
    const key = `${currentCard.id}:${exType}`;

    if (prefetchCache[key]) {
      setExercise(prefetchCache[key]);
      setLoading(false);
      return;
    }

    fetchExercise(currentCard, exType, currentCard.categoryIds).then((ex) => {
      if (ex) setExercise(ex);
      setLoading(false);
    });
  }, [currentCard?.id]);

  // Prefetch next 2
  useEffect(() => {
    if (!queue.length) return;
    const next = queue.slice(currentIndex + 1, currentIndex + 3);
    next.forEach((card) => {
      const exType = getExerciseType(card);
      const key = `${card.id}:${exType}`;
      if (!prefetchCache[key]) {
        fetchExercise(card, exType, card.categoryIds).then((ex) => {
          if (ex) setPrefetchCache((prev) => ({ ...prev, [key]: ex }));
        });
      }
    });
  }, [currentIndex, queue]);

  const handleAnswer = useCallback(
    (result: AnswerResult) => {
      if (!currentCard) return;
      const quality: Quality = result === 'correct' ? 4 : result === 'almost' ? 3 : 1;
      store.applyAnswer(currentCard, quality);
      store.incrementCompleted();

      const xp = result === 'correct' ? XP_CORRECT : result === 'almost' ? Math.floor(XP_CORRECT / 2) : 0;
      if (result !== 'wrong') {
        store.addXP(xp);
        setSessionXP((p) => p + xp);
        setLastXP(xp);
        if (result === 'correct') setSessionCorrect((p) => p + 1);
        playSound('correct');
        setShowXPToast(true);
        setTimeout(() => setShowXPToast(false), 1200);
      } else {
        playSound('incorrect');
      }

      setAnswered(result);
    },
    [currentCard, store]
  );

  const handleContinue = useCallback(() => {
    if (currentIndex + 1 >= queue.length) {
      store.updateStreak();
      setSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, queue.length, store]);

  const handleRestartSession = () => {
    setSessionComplete(false);
    setSessionXP(0);
    setSessionCorrect(0);
    setCurrentIndex(0);
    setAnswered(null);
    setExercise(null);
    setLoading(true);
    // Re-trigger queue build
    store.load();
  };

  if (!store.isLoaded || (queue.length === 0 && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <p className="text-6xl">📚</p>
        <h2 className="text-2xl font-bold text-gray-800">
          {reviewOnly ? 'No learned cards yet!' : 'No cards due!'}
        </h2>
        <p className="text-gray-500">
          {reviewOnly
            ? 'Switch to "Learn + Review" mode to start learning new words first.'
            : 'Great job! Come back tomorrow for your next review, or select more categories to practice.'}
        </p>
        <Button variant="secondary" onClick={() => window.location.href = '/categories'}>
          Choose Categories
        </Button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <SessionComplete
        xpEarned={sessionXP}
        correct={sessionCorrect}
        total={queue.length}
        onContinue={handleRestartSession}
      />
    );
  }

  const progress = ((currentIndex) / SESSION_SIZE) * 100;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
      <XPToast amount={lastXP} visible={showXPToast} />

      <div className="flex items-center gap-3">
        <ProgressBar value={progress} className="flex-1" />
        <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
          {currentIndex}/{SESSION_SIZE}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-400 text-sm">Generating exercise...</p>
          </motion.div>
        ) : exercise ? (
          <motion.div
            key={`${currentCard?.id}-${currentIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {exercise.type === 'multiple-choice' && (
              <MultipleChoice exercise={exercise} onAnswer={handleAnswer} hideTranslation={reviewOnly} />
            )}
            {exercise.type === 'fill-in-blank' && (
              <FillInBlank exercise={exercise} onAnswer={handleAnswer} hideTranslation={reviewOnly} />
            )}
            {exercise.type === 'translation' && (
              <TranslationInput exercise={exercise} onAnswer={handleAnswer} />
            )}

            <AnimatePresence>
              {answered !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 rounded-2xl p-4 flex items-center gap-3 ${
                    answered === 'correct'
                      ? 'bg-green-50 border border-green-200'
                      : answered === 'almost'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {answered === 'correct' ? (
                    <CheckCircle className="text-green-500 shrink-0" size={28} />
                  ) : answered === 'almost' ? (
                    <CheckCircle className="text-amber-400 shrink-0" size={28} />
                  ) : (
                    <XCircle className="text-red-500 shrink-0" size={28} />
                  )}
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${
                      answered === 'correct' ? 'text-green-700' : answered === 'almost' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {answered === 'correct' ? 'Correct!' : answered === 'almost' ? 'Almost!' : 'Not quite'}
                    </p>
                    {answered === 'almost' && (
                      <p className="text-sm text-amber-600">
                        Full answer: <strong>{exercise.correctAnswer}</strong>
                      </p>
                    )}
                    {answered === 'wrong' && (
                      <p className="text-sm text-red-600">
                        Answer: <strong>{exercise.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleContinue}
                    variant={answered === 'correct' ? 'primary' : answered === 'almost' ? 'secondary' : 'danger'}
                    size="sm"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
          >
            <p className="text-gray-400">Could not load exercise. Check your API key.</p>
            <Button variant="secondary" onClick={() => setLoading(true)}>
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
