import { computeTotals } from '../lib/fiveCrowns.js';

export default function PlayerTotals({ players, rounds, winnerIds = [] }) {
  const totals = computeTotals(players, rounds);
  const sorted = [...players].sort((a, b) => totals[a.id] - totals[b.id]);

  return (
    <ol className="space-y-2">
      {sorted.map((p, i) => {
        const isWinner = winnerIds.includes(p.id);
        return (
          <li
            key={p.id}
            className={[
              'flex items-center justify-between rounded-xl border p-3',
              isWinner
                ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-950/30'
                : 'border-gray-200 dark:border-gray-800',
            ].join(' ')}
          >
            <span className="flex items-center gap-2 font-medium">
              <span className="text-gray-400 dark:text-gray-500">{i + 1}</span>
              {p.name}
              {isWinner && <span title="Winner">🏆</span>}
            </span>
            <span className="text-lg font-semibold">{totals[p.id]}</span>
          </li>
        );
      })}
    </ol>
  );
}
