'use client';

import { useState } from 'react';
import { SRSCard } from '@/lib/types';
import { getSRSStage } from '@/lib/srs';
import { speakSpanish } from '@/lib/utils';
import { format } from 'date-fns';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const stageColors: Record<string, string> = {
  New: 'bg-gray-100 text-gray-600',
  Learning: 'bg-blue-100 text-blue-700',
  Young: 'bg-yellow-100 text-yellow-700',
  Mature: 'bg-green-100 text-green-700',
  Mastered: 'bg-purple-100 text-purple-700',
};

interface VocabCardProps {
  card: SRSCard;
}

export default function VocabCard({ card }: VocabCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stage = getSRSStage(card);
  const accuracy = card.timesSeen > 0 ? Math.round((card.timesCorrect / card.timesSeen) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            speakSpanish(card.phrase);
          }}
          className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors p-1"
        >
          <Volume2 size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{card.phrase}</p>
          <p className="text-sm text-gray-500 truncate">{card.translation}</p>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full shrink-0', stageColors[stage])}>
          {stage}
        </span>
        {expanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl py-2">
              <p className="text-lg font-bold text-gray-800">{card.timesSeen}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-2">
              <p className="text-lg font-bold text-gray-800">{accuracy}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-2">
              <p className="text-lg font-bold text-gray-800">{card.interval}d</p>
              <p className="text-xs text-gray-500">Interval</p>
            </div>
          </div>

          {card.nextReview && (
            <p className="text-xs text-gray-400 text-center">
              Next review:{' '}
              <span className="font-semibold text-gray-600">
                {format(new Date(card.nextReview), 'MMM d, yyyy')}
              </span>
            </p>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{card.timesCorrect}✓ {card.timesWrong}✗</span>
          </div>
        </div>
      )}
    </div>
  );
}
