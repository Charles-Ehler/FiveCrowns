import { Shuffle } from 'lucide-react';
import { dealerForRound, TOTAL_ROUNDS, wildRankForRound } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="sticky left-0 bg-white p-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 dark:bg-gray-900 dark:text-gray-500">
              Round
            </th>
            {players.map((p) => {
              const suit = suitForName(p.name);
              return (
                <th key={p.id} className="p-2.5 text-center font-semibold">
                  <span className="flex flex-col items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${suit.bg}`} />
                    {p.name}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((roundNumber, idx) => {
            const round = roundsByNumber.get(roundNumber);
            const dealer = dealerForRound(roundNumber, players);
            return (
              <tr
                key={roundNumber}
                className={[
                  'border-b border-gray-100 last:border-0 dark:border-gray-800',
                  idx % 2 === 1 ? 'bg-gray-50/60 dark:bg-gray-800/30' : '',
                ].join(' ')}
              >
                <td className="sticky left-0 bg-inherit p-2.5 text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{roundNumber}</span>
                  <span className="ml-1 text-xs">· {wildRankForRound(roundNumber)}s</span>
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  const isDealer = entry && dealer?.id === p.id;
                  const suit = suitForName(p.name);
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 font-semibold">
                            {isDealer && <Shuffle size={10} className={suit.text} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-emerald-500">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 font-semibold transition-colors hover:bg-violet-50 dark:hover:bg-violet-950/40"
                          >
                            {isDealer && <Shuffle size={10} className={suit.text} />}
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-emerald-500">●</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
