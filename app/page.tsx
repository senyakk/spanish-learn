'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboarded } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isOnboarded()) {
      router.replace('/learn');
    } else {
      router.replace('/categories');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
