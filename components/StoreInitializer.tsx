'use client';

import { useEffect } from 'react';
import { useProgressStore } from '@/store/progress';

export default function StoreInitializer() {
  const load = useProgressStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return null;
}
