import { Crown } from 'lucide-react';
import { computeTotals } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

// draftRound lets the caller preview totals with the in-progress (unsaved)
// round's scores overlaid, so the leader delta updates live as someone types
// — without writing anything early.
export default function PlayerTotals({ players, rounds, winnerIds = [], complete = false, draftRound = null }) {
  const previewRounds = draftRound ? [...rounds, draftRound] : rounds;
  const totals = computeTotals(players, previewRounds);
  const sorted = [...players].sort((a, b) => totals[a.id] - totals[b.id]);
  const lowestTotal = sorted.length ? totals[sorted[0].id] : null;
  const hasScores = previewRounds.length > 0;

  return (
    <ol className="space-y-2">
      {sorted.map((p, i) => {
        const suit = suitForName(p.name);
        const isWinner = winnerIds.includes(p.id);
        const isLeader = !complete && hasScores && totals[p.id] === lowestTotal;
        const highlighted = isWinner || isLeader;
        const behindLeader = hasScores ? totals[p.id] - lowestTotal : 0;
        return (
          <li
            key={p.id}
            className={[
              'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
              isWinner
                ? 'border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/30'
                : isLeader
                  ? 'border-violet-200 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-950/20'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
            ].join(' ')}
          >
            <span className="w-5 shrink-0 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">
              {i + 1}
            </span>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${suit.bg}`}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
            {highlighted && (
              <Crown
                size={18}
                className={isWinner ? 'text-amber-500' : 'text-violet-500'}
                fill="currentColor"
              />
            )}
            <span className="flex flex-col items-end">
              <span className="text-xl font-bold tabular-nums">{totals[p.id]}</span>
              {!highlighted && behindLeader > 0 && (
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  +{behindLeader} behind
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
