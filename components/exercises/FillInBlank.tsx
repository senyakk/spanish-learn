'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/types';
import { isCorrectTranslation } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

interface FillInBlankProps {
  exercise: Exercise;
  onAnswer: (result: import('@/lib/utils').AnswerResult) => void;
  hideTranslation?: boolean;
}

export default function FillInBlank({ exercise, onAnswer, hideTranslation = false }: FillInBlankProps) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (submitted || !value.trim()) return;
    const isRight = isCorrectTranslation(value, exercise.correctAnswer, exercise.acceptableVariants);
    setCorrect(isRight);
    setSubmitted(true);
    setTimeout(() => onAnswer(isRight ? 'correct' : 'wrong'), 1000);
  };

  const displaySentence = exercise.sentence.replace('___', '_____');

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Fill in the blank</p>
        <p className="text-xl font-bold text-gray-800">{displaySentence}</p>
        {(!hideTranslation || submitted) && (
          <p className="text-sm text-gray-500 mt-1 italic">{exercise.sentenceTranslation}</p>
        )}
      </div>

      {exercise.hint && !submitted && (
        <div className="flex items-center gap-2">
          {showHint ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
              💡 {exercise.hint}
            </p>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-amber-500 underline"
            >
              Show hint
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={submitted}
          placeholder="Type in Spanish..."
          autoCapitalize="none"
          autoCorrect="off"
          className={cn(
            'w-full px-4 py-3 rounded-2xl border-2 text-lg font-semibold outline-none transition-colors',
            submitted
              ? correct
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 focus:border-blue-400 bg-white'
          )}
        />

        {submitted && !correct && (
          <p className="text-sm text-red-600 font-medium">
            Correct answer: <span className="font-bold">{exercise.correctAnswer}</span>
          </p>
        )}

        {!submitted && (
          <Button onClick={handleSubmit} disabled={!value.trim()} className="w-full">
            Check
          </Button>
        )}
      </div>
    </div>
  );
}
