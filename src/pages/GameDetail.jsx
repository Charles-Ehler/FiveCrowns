import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import PlayerTotals from '../components/PlayerTotals.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import { subscribeToGame } from '../lib/games.js';

export default function GameDetail() {
  const { gameId } = useParams();
  const [game, setGame] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    setGame(undefined);
    setError(null);
    return subscribeToGame(gameId, setGame, (err) => setError(err.message));
  }, [gameId]);

  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">Couldn't load this game: {error}</div>;
  }

  if (game === undefined) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  if (game === null) {
    return (
      <div className="p-4 text-center">
        <p className="mt-8 text-gray-500 dark:text-gray-400">This game no longer exists.</p>
        <NavLink to="/history" className="mt-3 inline-block font-medium text-violet-600 dark:text-violet-400">
          ← Back to history
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';

  return (
    <div className="space-y-4 p-4">
      <NavLink
        to="/history"
        className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400"
      >
        <ArrowLeft size={16} />
        Back to history
      </NavLink>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        {isComplete && <Trophy size={20} className="text-amber-500" />}
        {isComplete ? 'Final standings' : `In progress · round ${game.currentRound}`}
      </h1>
      <PlayerTotals
        players={game.players}
        rounds={game.rounds}
        winnerIds={game.winnerIds ?? []}
        complete={isComplete}
      />
      <ScorecardGrid players={game.players} rounds={game.rounds} />
    </div>
  );
}
