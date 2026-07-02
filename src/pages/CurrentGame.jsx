import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Check, PartyPopper, Share2, Shuffle, Undo2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ConfettiBurst from '../components/ConfettiBurst.jsx';
import PlayerTotals from '../components/PlayerTotals.jsx';
import ScoreEntryForm from '../components/ScoreEntryForm.jsx';
import ScorecardGrid from '../components/ScorecardGrid.jsx';
import ShareResultButton from '../components/ShareResultButton.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { dealerForRound, TOTAL_ROUNDS, wildRankWordForRound } from '../lib/fiveCrowns.js';
import { subscribeToGame, submitRoundScores, undoLastRound } from '../lib/games.js';
import { vibrate } from '../lib/haptics.js';
import { playGameComplete, playRoundComplete } from '../lib/sound.js';
import { CURRENT_GAME_KEY } from '../lib/storageKeys.js';
import { suitForIndex, suitForName } from '../lib/suits.js';

export default function CurrentGame() {
  const { gameId: paramGameId } = useParams();
  const navigate = useNavigate();
  const { enabled: feedbackEnabled } = useFeedback();
  const [game, setGame] = useState(undefined);
  const [error, setError] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftRound, setDraftRound] = useState(null);

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
        <NavLink to="/" className="mt-3 inline-block font-medium text-violet-600 dark:text-violet-400">
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
        <NavLink to="/" className="mt-3 inline-block font-medium text-violet-600 dark:text-violet-400">
          Start a new game →
        </NavLink>
      </div>
    );
  }

  const isComplete = game.status === 'complete';
  const editingRoundData = editingRound
    ? game.rounds.find((r) => r.roundNumber === editingRound)?.scores
    : null;
  const roundSuit = suitForIndex(game.currentRound - 1);
  const progressPct = Math.round((game.currentRound - 1) / TOTAL_ROUNDS * 100);
  const dealer = dealerForRound(game.currentRound, game.players);
  const dealerSuit = suitForName(dealer.name);
  const editingDealer = editingRound ? dealerForRound(editingRound, game.players) : null;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMainSubmit(scores) {
    const round = game.currentRound;
    const isFinalRound = round === TOTAL_ROUNDS;
    await submitRoundScores(game.id, round, scores);

    if (feedbackEnabled) {
      vibrate(isFinalRound ? [30, 60, 30, 60, 60] : 15);
      if (isFinalRound) playGameComplete();
      else playRoundComplete();
    }
  }

  return (
    <div className="relative space-y-4 p-4">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isComplete && <ConfettiBurst />}
        <div className="relative flex items-center justify-between">
          {isComplete ? (
            <h1 className="flex items-center gap-2 text-2xl font-extrabold">
              <PartyPopper className="text-amber-500" size={26} />
              Game complete
            </h1>
          ) : (
            <div className="flex-1">
              <p className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${dealerSuit.text}`}>
                <Shuffle size={12} />
                Dealer: <span className="normal-case">{dealer.name}</span>
              </p>
              <p className={`text-3xl font-extrabold uppercase ${roundSuit.text}`}>
                {wildRankWordForRound(game.currentRound)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${roundSuit.bg}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="shrink-0 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  Round {game.currentRound} of {TOTAL_ROUNDS}
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <PlayerTotals
        players={game.players}
        rounds={game.rounds}
        winnerIds={isComplete ? game.winnerIds : []}
        complete={isComplete}
        draftRound={isComplete ? null : draftRound}
        dealerRound={isComplete ? null : game.currentRound}
      />

      {isComplete && <ShareResultButton game={game} />}

      {!isComplete && (
        <div>
          <ScoreEntryForm
            key={game.currentRound}
            players={game.players}
            roundNumber={game.currentRound}
            onDraftChange={setDraftRound}
            submitLabel={game.currentRound === TOTAL_ROUNDS ? 'Finish Game' : 'Next Round'}
            onSubmit={handleMainSubmit}
          />
          <button
            type="button"
            onClick={() => setConfirmingUndo(true)}
            disabled={game.rounds.length === 0}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            <Undo2 size={15} />
            Undo last entry
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Scorecard (tap to edit)</p>
        <ScorecardGrid players={game.players} rounds={game.rounds} onEditRound={setEditingRound} />
      </div>

      {editingRound && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div className="animate-pop-in max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
            <h2 className="mb-3 flex flex-wrap items-center gap-x-2 text-lg font-semibold">
              <span>Edit {wildRankWordForRound(editingRound)}</span>
              <span className={`flex items-center gap-1 text-sm font-medium ${suitForName(editingDealer.name).text}`}>
                <Shuffle size={12} />
                Dealer: {editingDealer.name}
              </span>
            </h2>
            <ScoreEntryForm
              players={game.players}
              initialData={editingRoundData}
              roundNumber={editingRound}
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
