import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAX_PLAYERS, MIN_PLAYERS } from '../lib/fiveCrowns.js';
import { createGame, listRecentPlayerNames } from '../lib/games.js';
import { CURRENT_GAME_KEY } from '../lib/storageKeys.js';

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
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">New Game</h1>

      <div className="space-y-2">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900"
            />
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              aria-label="Move up"
              className="rounded-lg border border-gray-300 px-2 py-2 disabled:opacity-30 dark:border-gray-700"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === names.length - 1}
              aria-label="Move down"
              className="rounded-lg border border-gray-300 px-2 py-2 disabled:opacity-30 dark:border-gray-700"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removePlayer(i)}
              disabled={names.length <= MIN_PLAYERS}
              aria-label="Remove player"
              className="rounded-lg border border-gray-300 px-2 py-2 text-red-600 disabled:opacity-30 dark:border-gray-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addPlayer()}
        disabled={names.length >= MAX_PLAYERS}
        className="w-full rounded-xl border border-dashed border-gray-300 py-3 font-medium text-gray-500 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
      >
        + Add player
      </button>

      {availableRecent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-gray-400">Recent players</p>
          <div className="flex flex-wrap gap-2">
            {availableRecent.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addRecent(name)}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
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
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40"
      >
        {starting ? 'Starting…' : 'Start Game'}
      </button>
    </div>
  );
}
