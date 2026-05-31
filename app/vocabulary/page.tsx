'use client';

import { useState, useMemo } from 'react';
import { useProgressStore } from '@/store/progress';
import { SRSCard } from '@/lib/types';
import { isDue, getSRSStage } from '@/lib/srs';
import VocabCard from '@/components/vocabulary/VocabCard';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'due' | 'mastered' | 'new';

const filters: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Due Today', value: 'due' },
  { label: 'Mastered', value: 'mastered' },
  { label: 'New', value: 'new' },
];

export default function VocabularyPage() {
  const cards = useProgressStore((s) => s.cards);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const sorted = useMemo(() => {
    const all: SRSCard[] = Object.values(cards);

    return all
      .filter((c) => {
        const q = search.toLowerCase();
        if (q && !c.phrase.toLowerCase().includes(q) && !c.translation.toLowerCase().includes(q))
          return false;
        if (filter === 'due') return isDue(c);
        if (filter === 'mastered') return getSRSStage(c) === 'Mastered';
        if (filter === 'new') return c.repetition === 0;
        return true;
      })
      .sort((a, b) => a.phrase.localeCompare(b.phrase));
  }, [cards, search, filter]);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Vocabulary</h1>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border',
              filter === f.value
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-4xl">📖</p>
          <p className="text-gray-500 text-sm">
            {search ? 'No words match your search.' : 'No words here yet. Start practicing!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium">{sorted.length} word{sorted.length !== 1 ? 's' : ''}</p>
          {sorted.map((card) => (
            <VocabCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
