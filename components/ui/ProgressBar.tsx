'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  color?: string;
}

export default function ProgressBar({ value, className = '', color = 'bg-green-500' }: ProgressBarProps) {
  return (
    <div className={`h-3 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}
