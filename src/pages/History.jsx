import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { computeTotals } from '../lib/fiveCrowns.js';
import { deleteGame, listGames } from '../lib/games.js';

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function History() {
  const [games, setGames] = useState(undefined);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  async function handleDelete() {
    await deleteGame(deletingId);
    setGames((prev) => prev.filter((g) => g.id !== deletingId));
    setDeletingId(null);
  }

  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">Couldn't load history: {error}</div>;
  }

  if (games === undefined) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  if (games.length === 0) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">No games yet.</div>;
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-semibold">History</h1>
      {games.map((game) => {
        const totals = computeTotals(game.players, game.rounds);
        const winners = game.players.filter((p) => game.winnerIds?.includes(p.id));
        const winnerSummary = winners.map((w) => `${w.name} (${totals[w.id]})`).join(', ');
        return (
          <div
            key={game.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
          >
            <NavLink to={`/history/${game.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{game.players.map((p) => p.name).join(', ')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(game.createdAt)} · {game.status === 'complete' ? `Winner: ${winnerSummary}` : 'In progress'}
              </p>
            </NavLink>
            <button
              type="button"
              onClick={() => setDeletingId(game.id)}
              aria-label="Delete game"
              className="shrink-0 rounded-lg border border-gray-300 px-2 py-2 text-red-600 dark:border-gray-700"
            >
              ✕
            </button>
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete this game?"
        message="This permanently removes the game and its scores."
        confirmLabel="Delete"
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
