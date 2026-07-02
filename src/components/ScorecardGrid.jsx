import { TOTAL_ROUNDS, wildRankForRound } from '../lib/fiveCrowns.js';

export default function ScorecardGrid({ players, rounds, onEditRound }) {
  const readOnly = !onEditRound;
  const roundsByNumber = new Map(rounds.map((r) => [r.roundNumber, r]));

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="sticky left-0 bg-white p-2 text-left dark:bg-gray-950">Round</th>
            {players.map((p) => (
              <th key={p.id} className="p-2 text-center font-medium">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((roundNumber) => {
            const round = roundsByNumber.get(roundNumber);
            return (
              <tr key={roundNumber} className="border-b border-gray-100 last:border-0 dark:border-gray-900">
                <td className="sticky left-0 bg-white p-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  {roundNumber} · {wildRankForRound(roundNumber)}s
                </td>
                {players.map((p) => {
                  const entry = round?.scores?.[p.id];
                  return (
                    <td key={p.id} className="p-1 text-center">
                      {entry ? (
                        readOnly ? (
                          <span className="inline-block w-full px-2 py-1">
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-blue-500">●</span>}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEditRound(roundNumber)}
                            className="w-full rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {entry.score}
                            {entry.wentOut && <span className="ml-1 text-blue-500">●</span>}
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
