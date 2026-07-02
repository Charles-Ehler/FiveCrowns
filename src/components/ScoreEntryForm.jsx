import { useState } from 'react';
import { Check } from 'lucide-react';
import { suitForIndex } from '../lib/suits.js';

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

  // Going out is always a 0-point round, and it's a common mis-tap to leave a
  // stale number in the box after toggling this on — so lock the field instead
  // of just defaulting it, and hand control back with a clean slate if toggled off.
  function toggleWentOut(playerId) {
    setEntries((prev) => {
      const wentOut = !prev[playerId].wentOut;
      return {
        ...prev,
        [playerId]: { score: wentOut ? '0' : '', wentOut },
      };
    });
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
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {players.map((p, i) => {
        const suit = suitForIndex(i);
        const wentOut = entries[p.id].wentOut;
        return (
          <div
            key={p.id}
            className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${suit.bg}`}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
            <button
              type="button"
              onClick={() => toggleWentOut(p.id)}
              className={[
                'flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors',
                wentOut
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
              ].join(' ')}
            >
              {wentOut && <Check size={14} />}
              Went out
            </button>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              readOnly={wentOut}
              value={entries[p.id].score}
              onChange={(e) => updateScore(p.id, e.target.value)}
              placeholder="0"
              className={[
                'w-16 shrink-0 rounded-xl border p-2.5 text-center text-2xl font-bold',
                wentOut
                  ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-500'
                  : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900',
              ].join(' ')}
            />
          </div>
        );
      })}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!allValid}
          className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
