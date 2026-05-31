'use client';

import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/storage';
import { useProgressStore } from '@/store/progress';
import { loadProgressFromDb } from '@/lib/storage';

export default function SettingsPage() {
  const [userId, setUserId] = useState('');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const store = useProgressStore();

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  async function handleSync() {
    const code = input.trim();
    if (!code || code === userId) return;

    setStatus('loading');
    // Point this device to the entered user ID
    localStorage.setItem('sl_user_id', code);
    setUserId(code);

    const remote = await loadProgressFromDb();
    if (remote) {
      const { saveProgress } = await import('@/lib/storage');
      saveProgress(remote);
      store.load();
      setStatus('success');
    } else {
      setStatus('error');
      // Revert if nothing found
      localStorage.setItem('sl_user_id', userId);
      setUserId(userId);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-28">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sync across devices</h2>
        <p className="text-sm text-gray-600 mb-4">
          Copy your sync code on this device, then paste it on another device to share progress.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">Your sync code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs break-all text-gray-800">{userId}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste sync code from another device"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSync}
            disabled={status === 'loading' || !input.trim()}
            className="shrink-0 px-4 py-2 bg-green-500 disabled:bg-gray-200 text-white text-sm rounded-xl font-medium"
          >
            {status === 'loading' ? '...' : 'Sync'}
          </button>
        </div>
        {status === 'success' && (
          <p className="text-sm text-green-600 mt-2">Progress synced successfully.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500 mt-2">No progress found for that code.</p>
        )}
      </section>
    </div>
  );
}
