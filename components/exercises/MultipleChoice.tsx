'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Exercise } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MultipleChoiceProps {
  exercise: Exercise;
  onAnswer: (result: import('@/lib/utils').AnswerResult) => void;
  hideTranslation?: boolean;
}

export default function MultipleChoice({ exercise, onAnswer, hideTranslation = false }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === exercise.correctAnswer;
    setTimeout(() => onAnswer(correct ? 'correct' : 'wrong'), 800);
  };

  const getOptionStyle = (option: string) => {
    if (selected === null) return 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50';
    if (option === exercise.correctAnswer) return 'border-green-500 bg-green-50 text-green-700';
    if (option === selected) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-gray-200 bg-gray-50 text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Spanish</p>
        <p className="text-xl font-bold text-gray-800">
          {(() => {
            const target = exercise.highlightedWord ?? exercise.targetPhrase;
            const regex = new RegExp(`(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
            const parts = exercise.sentence.split(regex);
            return parts.map((part, i) =>
              regex.test(part) ? (
                <span key={i} className="underline decoration-blue-400 decoration-2 text-blue-700">
                  {part}
                </span>
              ) : part
            );
          })()}
        </p>
        {!hideTranslation && <p className="text-sm text-gray-500 mt-1 italic">{exercise.sentenceTranslation}</p>}
      </div>

      <p className="text-sm font-semibold text-gray-500">What does the highlighted word mean?</p>

      <div className="grid grid-cols-1 gap-3">
        {(exercise.options ?? []).map((option) => (
          <motion.button
            key={option}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(option)}
            className={cn(
              'w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-gray-800 transition-all duration-150 min-h-[56px]',
              getOptionStyle(option)
            )}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
