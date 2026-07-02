import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PlayerTotals from '../components/PlayerTotals.jsx';
import ScoreEntryForm from '../components/ScoreEntryForm.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import { TOTAL_ROUNDS, wildRankForRound } from '../lib/fiveCrowns.js';
import { subscribeToGame, submitRoundScores, undoLastRound } from '../lib/games.js';
import { CURRENT_GAME_KEY } from '../lib/storageKeys.js';

export default function CurrentGame() {
  const { gameId: paramGameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(undefined);
  const [error, setError] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paramGameId) return;
    const stored = localStorage.getItem(CURRENT_GAME_KEY);
    if (stored) navigate(`/game/${stored}`, { replace: true });
  }, [paramGameId, navigate]);

  useEffect(() => {
    if (!paramGameId) return;
    localStorage.setItem(CURRENT_GAME_KEY, paramGameId);
    setGame(undefined);
    setError(null);
    const unsubscribe = subscribeToGame(paramGameId, setGame, (err) => setError(err.message));
    return unsubscribe;
  }, [paramGameId]);

  if (!paramGameId) {
    return (
      <div className="p-4 text-center">
        <p className="mt-8 text-gray-500 dark:text-gray-400">No active game yet.</p>
        <NavLink to="/" className="mt-3 inline-block font-medium text-blue-600 dark:text-blue-400">
          Start a new game →
        </NavLink>
      </div>
    );
  }

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
        <NavLink to="/" className="mt-3 inline-block font-medium text-blue-600 dark:text-blue-400">
          Start a new game →
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';
  const editingRoundData = editingRound
    ? game.rounds.find((r) => r.roundNumber === editingRound)?.scores
    : null;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          {isComplete ? (
            <h1 className="text-xl font-semibold">Game complete</h1>
          ) : (
            <h1 className="text-xl font-semibold">
              Round {game.currentRound} of {TOTAL_ROUNDS} · Wild: {wildRankForRound(game.currentRound)}s
            </h1>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
        >
          {copied ? 'Copied!' : 'Share link'}
        </button>
      </div>

      <PlayerTotals players={game.players} rounds={game.rounds} winnerIds={isComplete ? game.winnerIds : []} />

      {!isComplete && (
        <div>
          <ScoreEntryForm
            key={game.currentRound}
            players={game.players}
            submitLabel={game.currentRound === TOTAL_ROUNDS ? 'Finish Game' : 'Next Round'}
            onSubmit={(scores) => submitRoundScores(game.id, game.currentRound, scores)}
          />
          <button
            type="button"
            onClick={() => setConfirmingUndo(true)}
            disabled={game.rounds.length === 0}
            className="mt-3 w-full rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
          >
            Undo last entry
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Scorecard (tap to edit)</p>
        <ScorecardGrid players={game.players} rounds={game.rounds} onEditRound={setEditingRound} />
      </div>

      {editingRound && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-gray-900 sm:rounded-2xl">
            <h2 className="mb-3 text-lg font-semibold">
              Edit round {editingRound} · Wild: {wildRankForRound(editingRound)}s
            </h2>
            <ScoreEntryForm
              players={game.players}
              initialData={editingRoundData}
              submitLabel="Save"
              onCancel={() => setEditingRound(null)}
              onSubmit={async (scores) => {
                await submitRoundScores(game.id, editingRound, scores);
                setEditingRound(null);
              }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingUndo}
        title="Undo last entry?"
        message="This removes the most recently entered round's scores."
        confirmLabel="Undo"
        onCancel={() => setConfirmingUndo(false)}
        onConfirm={async () => {
          await undoLastRound(game.id);
          setConfirmingUndo(false);
        }}
      />
    </div>
  );
}
