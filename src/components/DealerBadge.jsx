import { Shuffle } from 'lucide-react';
import { suitForName } from '../lib/suits.js';

// icon-only: a compact marker for tight spaces (running totals, scorecard
// cells). Otherwise: a small labeled pill, for the score entry row.
export default function DealerBadge({ playerName, iconOnly = false }) {
  const suit = suitForName(playerName);

  if (iconOnly) {
    return (
      <span
        title="Dealer"
        aria-label="Dealer"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${suit.soft}`}
      >
        <Shuffle size={11} className={suit.text} />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${suit.soft} ${suit.text}`}
    >
      <Shuffle size={12} />
      Dealer
    </span>
  );
}
