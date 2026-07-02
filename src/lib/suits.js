// Five Crowns' five suits, used purely as a decorative accent system
// (player badges, headers, icons) — never tied to actual game logic.
export const SUITS = [
  { key: 'hearts', symbol: '♥', text: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500', soft: 'bg-rose-50 dark:bg-rose-950/40', ring: 'ring-rose-400' },
  { key: 'diamonds', symbol: '♦', text: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-950/40', ring: 'ring-amber-400' },
  { key: 'clubs', symbol: '♣', text: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'ring-emerald-400' },
  { key: 'spades', symbol: '♠', text: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500', soft: 'bg-indigo-50 dark:bg-indigo-950/40', ring: 'ring-indigo-400' },
  { key: 'stars', symbol: '★', text: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500', soft: 'bg-violet-50 dark:bg-violet-950/40', ring: 'ring-violet-400' },
];

export function suitForIndex(index) {
  return SUITS[index % SUITS.length];
}
