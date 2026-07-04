import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock3, Trash2, Trophy } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
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
    return <EmptyState title="No games yet" message="Start one to see it show up here." />;
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-extrabold">History</h1>
      {games.map((game) => {
        const totals = computeTotals(game.players, game.rounds);
        const winners = game.players.filter((p) => game.winnerIds?.includes(p.id));
        const winnerSummary = winners.map((w) => `${w.name} (${totals[w.id]})`).join(', ');
        const isComplete = game.status === 'complete';
        return (
          <div
            key={game.id}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <NavLink to={`/history/${game.id}`} className="min-w-0 flex-1">
              <div className="mb-1 flex -space-x-2">
                {game.players.slice(0, 5).map((p) => (
                  <Avatar
                    key={p.id}
                    name={p.name}
                    sizeClass="h-6 w-6 text-[10px]"
                    className="border-2 border-white dark:border-gray-900"
                  />
                ))}
              </div>
              <p className="truncate font-semibold">{game.players.map((p) => p.name).join(', ')}</p>
              <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {isComplete ? <Trophy size={12} className="text-amber-500" /> : <Clock3 size={12} />}
                {formatDate(game.createdAt)} · {isComplete ? `Winner: ${winnerSummary}` : 'In progress'}
              </p>
            </NavLink>
            <button
              type="button"
              onClick={() => setDeletingId(game.id)}
              aria-label="Delete game"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 transition-colors hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
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
