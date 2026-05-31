'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/types';
import { checkAnswer, AnswerResult } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

interface TranslationInputProps {
  exercise: Exercise;
  onAnswer: (result: AnswerResult) => void;
}

export default function TranslationInput({ exercise, onAnswer }: TranslationInputProps) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);

  const handleSubmit = () => {
    if (submitted || !value.trim()) return;
    const r = checkAnswer(value, exercise.correctAnswer, exercise.acceptableVariants);
    setResult(r);
    setSubmitted(true);
    setTimeout(() => onAnswer(r), 1100);
  };

  const borderColor = !submitted
    ? 'border-gray-300 focus:border-blue-400 bg-white'
    : result === 'correct'
    ? 'border-green-500 bg-green-50 text-green-700'
    : result === 'almost'
    ? 'border-amber-400 bg-amber-50 text-amber-700'
    : 'border-red-500 bg-red-50 text-red-700';

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Translate to Spanish</p>
        <p className="text-xl font-bold text-gray-800">{exercise.sentence}</p>
      </div>

      <div className="space-y-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={submitted}
          placeholder="Write in Spanish..."
          rows={3}
          autoCapitalize="none"
          autoCorrect="off"
          className={cn(
            'w-full px-4 py-3 rounded-2xl border-2 text-lg font-semibold outline-none transition-colors resize-none',
            borderColor
          )}
        />

        {submitted && result !== 'correct' && (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Correct answer:</p>
            <p className="text-base font-bold text-gray-700">{exercise.correctAnswer}</p>
            {exercise.acceptableVariants && exercise.acceptableVariants.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Also accepted: {exercise.acceptableVariants.join(', ')}
              </p>
            )}
          </div>
        )}

        {!submitted && (
          <Button onClick={handleSubmit} disabled={!value.trim()} className="w-full">
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}
