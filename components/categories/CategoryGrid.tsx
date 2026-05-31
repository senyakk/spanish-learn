'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress';

interface CategoryGridProps {
  categories: Category[];
  selected: string[];
  onToggle: (id: string) => void;
}

export default function CategoryGrid({ categories, selected, onToggle }: CategoryGridProps) {
  const cards = useProgressStore((s) => s.cards);

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const isSelected = selected.includes(cat.id);
        const learnedCount = Object.values(cards).filter(
          (c) => c.categoryIds.includes(cat.id) && c.repetition > 0
        ).length;

        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onToggle(cat.id)}
            className={cn(
              'relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all min-h-[100px]',
              isSelected
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            {isSelected && (
              <span className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
                <Check size={14} className="text-white" strokeWidth={3} />
              </span>
            )}
            <span className="text-3xl mb-2">{cat.emoji}</span>
            <p className={cn('text-sm font-bold leading-tight', isSelected ? 'text-green-700' : 'text-gray-800')}>
              {cat.label}
            </p>
            {learnedCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">{learnedCount} learned</p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
