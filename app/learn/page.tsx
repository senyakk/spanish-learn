'use client';

import { useEffect, useState } from 'react';
import { useProgressStore } from '@/store/progress';
import { useRouter } from 'next/navigation';
import ExerciseShell from '@/components/exercises/ExerciseShell';
import { Flame, Zap } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

const DAILY_XP_GOAL = 50;

export default function LearnPage() {
  const { streak, xp, selectedCategoryIds, isLoaded } = useProgressStore();
  const router = useRouter();
  const [reviewOnly, setReviewOnly] = useState(false);

  useEffect(() => {
    if (isLoaded && selectedCategoryIds.length === 0) {
      router.replace('/categories');
    }
  }, [isLoaded, selectedCategoryIds, router]);

  const dailyProgress = Math.min(100, (xp % DAILY_XP_GOAL) / DAILY_XP_GOAL * 100);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 space-y-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame size={22} className="text-orange-500" />
            <span className="font-extrabold text-gray-800">{streak}</span>
            <span className="text-gray-400 text-sm">day streak</span>
          </div>
          <div className="flex items-center gap-2 flex-1 mx-4">
            <Zap size={16} className="text-yellow-500 shrink-0" />
            <ProgressBar value={dailyProgress} className="flex-1" color="bg-yellow-400" />
            <span className="text-xs text-gray-400 shrink-0">{xp} XP</span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="max-w-lg mx-auto flex rounded-xl bg-gray-100 p-1 gap-1">
          <button
            onClick={() => setReviewOnly(false)}
            className={cn(
              'flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all',
              !reviewOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            )}
          >
            Learn + Review
          </button>
          <button
            onClick={() => setReviewOnly(true)}
            className={cn(
              'flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all',
              reviewOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            )}
          >
            Review Only
          </button>
        </div>
      </div>

      <ExerciseShell key={reviewOnly ? 'review' : 'learn'} reviewOnly={reviewOnly} />
    </div>
  );
}
