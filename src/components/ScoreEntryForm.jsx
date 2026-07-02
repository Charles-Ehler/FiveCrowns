import { useState } from 'react';

function initialEntries(players, initialData) {
  const entries = {};
  players.forEach((p) => {
    const existing = initialData?.[p.id];
    entries[p.id] = {
      score: existing ? String(existing.score) : '',
      wentOut: existing?.wentOut ?? false,
    };
  });
  return entries;
}

export default function ScoreEntryForm({ players, initialData, submitLabel, onSubmit, onCancel }) {
  const [entries, setEntries] = useState(() => initialEntries(players, initialData));

  const allValid = players.every((p) => {
    const value = entries[p.id]?.score;
    return value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0;
  });

  function updateScore(playerId, score) {
    setEntries((prev) => ({ ...prev, [playerId]: { ...prev[playerId], score } }));
  }

  function toggleWentOut(playerId) {
    setEntries((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], wentOut: !prev[playerId].wentOut },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) return;
    const scoresByPlayerId = {};
    players.forEach((p) => {
      scoresByPlayerId[p.id] = {
        score: Number(entries[p.id].score),
        wentOut: entries[p.id].wentOut,
      };
    });
    onSubmit(scoresByPlayerId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {players.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
        >
          <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
          <button
            type="button"
            onClick={() => toggleWentOut(p.id)}
            className={[
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
              entries[p.id].wentOut
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
            ].join(' ')}
          >
            Went out
          </button>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={entries[p.id].score}
            onChange={(e) => updateScore(p.id, e.target.value)}
            placeholder="0"
            className="w-20 shrink-0 rounded-xl border border-gray-300 p-3 text-center text-2xl font-semibold dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
      ))}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-medium dark:border-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!allValid}
          className="flex-1 rounded-xl bg-blue-600 py-3 font-medium text-white disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
