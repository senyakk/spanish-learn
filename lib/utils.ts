import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export type AnswerResult = 'correct' | 'almost' | 'wrong';

function stripPunctuation(s: string): string {
  return s.replace(/[¿¡.,!?;:'"()\-]/g, '').replace(/\s+/g, ' ').trim();
}

function wordJaccard(a: string, b: string): number {
  const wa = a.split(/\s+/).filter(Boolean);
  const wb = new Set(b.split(/\s+/).filter(Boolean));
  const intersection = wa.filter((w) => wb.has(w)).length;
  const allWords = new Set([...wa, ...Array.from(wb)]);
  const union = allWords.size;
  return union === 0 ? 1 : intersection / union;
}

export function checkAnswer(userAnswer: string, correct: string, variants?: string[]): AnswerResult {
  const candidates = [correct, ...(variants ?? [])];

  // Exact match (accent-insensitive)
  const n = normalize(userAnswer);
  if (candidates.some((c) => n === normalize(c))) return 'correct';

  // Punctuation-stripped match
  const ns = normalize(stripPunctuation(userAnswer));
  if (candidates.some((c) => ns === normalize(stripPunctuation(c)))) return 'almost';

  // High word-overlap match (≥75% Jaccard on normalized, punctuation-stripped words)
  if (candidates.some((c) => wordJaccard(normalize(stripPunctuation(userAnswer)), normalize(stripPunctuation(c))) >= 0.75)) return 'almost';

  return 'wrong';
}

// Keep for fill-in-blank (single word, no "almost" needed)
export function isCorrectTranslation(userAnswer: string, correct: string, variants?: string[]): boolean {
  const n = normalize(userAnswer);
  if (n === normalize(correct)) return true;
  if (variants) return variants.some((v) => n === normalize(v));
  return false;
}

export function safeParseJSON(text: string): unknown | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

export function playSound(type: 'correct' | 'incorrect') {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    } else {
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
    }
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore audio errors
  }
}

export function speakSpanish(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
