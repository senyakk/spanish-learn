'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progress';
import { setOnboarded } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';
import CategoryGrid from '@/components/categories/CategoryGrid';
import Button from '@/components/ui/Button';

export default function CategoriesPage() {
  const { selectedCategoryIds, setSelectedCategories, isLoaded } = useProgressStore();
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) setSelected(selectedCategoryIds);
  }, [isLoaded]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    setSelectedCategories(selected);
    setOnboarded();
    router.push('/learn');
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose Categories</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Select the topics you want to practice. You can change this anytime.
        </p>
      </div>

      <CategoryGrid categories={CATEGORIES} selected={selected} onToggle={toggle} />

      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 max-w-lg mx-auto">
        <Button
          onClick={handleStart}
          disabled={selected.length === 0}
          className="w-full"
          size="lg"
        >
          {selected.length === 0
            ? 'Select at least one category'
            : `Practice ${selected.length} categor${selected.length === 1 ? 'y' : 'ies'}`}
        </Button>
      </div>
    </div>
  );
}
