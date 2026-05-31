'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface XPToastProps {
  amount: number;
  visible: boolean;
}

export default function XPToast({ amount, visible }: XPToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="xp-toast"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -60 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.6 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        >
          <span className="text-2xl font-extrabold text-yellow-500 drop-shadow">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
