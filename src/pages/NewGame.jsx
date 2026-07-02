import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Sparkles, X } from 'lucide-react';
import { MAX_PLAYERS, MIN_PLAYERS } from '../lib/fiveCrowns.js';
import { createGame, listRecentPlayerNames } from '../lib/games.js';
import { CURRENT_GAME_KEY } from '../lib/storageKeys.js';
import { suitForIndex } from '../lib/suits.js';

export default function NewGame() {
  const [names, setNames] = useState(['', '']);
  const [recentNames, setRecentNames] = useState([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    listRecentPlayerNames().then(setRecentNames).catch(() => setRecentNames([]));
  }, []);

  const trimmed = names.map((n) => n.trim());
  const canStart =
    trimmed.length >= MIN_PLAYERS &&
    trimmed.length <= MAX_PLAYERS &&
    trimmed.every((n) => n.length > 0);

  function updateName(index, value) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addPlayer(prefill = '') {
    if (names.length >= MAX_PLAYERS) return;
    setNames((prev) => [...prev, prefill]);
  }

  function removePlayer(index) {
    if (names.length <= MIN_PLAYERS) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index) {
    if (index === 0) return;
    setNames((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index) {
    if (index === names.length - 1) return;
    setNames((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function addRecent(name) {
    const alreadyUsed = trimmed.some((n) => n.toLowerCase() === name.toLowerCase());
    if (alreadyUsed) return;
    const emptyIndex = names.findIndex((n) => n.trim() === '');
    if (emptyIndex !== -1) {
      updateName(emptyIndex, name);
    } else {
      addPlayer(name);
    }
  }

  async function handleStart() {
    if (!canStart) return;
    setStarting(true);
    setError(null);
    try {
      const gameId = await createGame(trimmed);
      localStorage.setItem(CURRENT_GAME_KEY, gameId);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message ?? 'Failed to start game');
      setStarting(false);
    }
  }

  const availableRecent = recentNames.filter(
    (n) => !trimmed.some((t) => t.toLowerCase() === n.toLowerCase()),
  );

  return (
    <div className="space-y-5 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <Sparkles className="text-violet-500" size={24} />
          New Game
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add 2-7 players to get started.</p>
      </div>

      <div className="space-y-2.5">
        {names.map((name, i) => {
          const suit = suitForIndex(i);
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${suit.bg}`}
              >
                {name.trim() ? name.trim().charAt(0).toUpperCase() : i + 1}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white p-3 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-violet-900"
              />
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                aria-label="Move up"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 disabled:opacity-30 dark:border-gray-700"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === names.length - 1}
                aria-label="Move down"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 disabled:opacity-30 dark:border-gray-700"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => removePlayer(i)}
                disabled={names.length <= MIN_PLAYERS}
                aria-label="Remove player"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-red-500 disabled:opacity-30 dark:border-gray-700"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => addPlayer()}
        disabled={names.length >= MAX_PLAYERS}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-gray-300 py-3 font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
      >
        <Plus size={18} />
        Add player
      </button>

      {availableRecent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Recent players</p>
          <div className="flex flex-wrap gap-2">
            {availableRecent.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addRecent(name)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart || starting}
        className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-rose-500 py-3.5 font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
      >
        {starting ? 'Starting…' : 'Start Game'}
      </button>
    </div>
  );
}
