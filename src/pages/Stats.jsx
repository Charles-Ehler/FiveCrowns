import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { listGames } from '../lib/games.js';
import { computeStats } from '../lib/stats.js';

function GameLink({ gameId, children }) {
  return (
    <NavLink to={`/history/${gameId}`} className="text-blue-600 dark:text-blue-400">
      {children}
    </NavLink>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase text-gray-400">{title}</h2>
      {children}
    </section>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    listGames()
      .then((games) => setStats(computeStats(games)))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">Couldn't load stats: {error}</div>;
  }

  if (stats === undefined) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  if (stats.totalGames === 0) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">No completed games yet.</div>;
  }

  const byWins = [...stats.players].sort((a, b) => b.wins - a.wins);
  const byLosses = [...stats.players].sort((a, b) => b.losses - a.losses);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-semibold">Stats</h1>

      <Section title="Most wins">
        <ol className="space-y-1">
          {byWins.map((p) => (
            <li key={p.name} className="flex justify-between">
              <span>{p.name}</span>
              <span className="font-medium">{p.wins}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Most losses (finished last)">
        <ol className="space-y-1">
          {byLosses.map((p) => (
            <li key={p.name} className="flex justify-between">
              <span>{p.name}</span>
              <span className="font-medium">{p.losses}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Games played & average score">
        <ol className="space-y-1">
          {stats.players.map((p) => (
            <li key={p.name} className="flex justify-between">
              <span>{p.name}</span>
              <span className="font-medium">
                {p.gamesPlayed} games · avg {p.average.toFixed(1)}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Best & worst single round, per player">
        <ol className="space-y-2">
          {stats.players.map((p) => (
            <li key={p.name}>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Best: {p.bestRound?.score ?? '–'}
                {p.bestRound && (
                  <>
                    {' '}
                    (round {p.bestRound.roundNumber}, <GameLink gameId={p.bestRound.gameId}>game</GameLink>)
                  </>
                )}
                {' · '}
                Worst: {p.worstRound?.score ?? '–'}
                {p.worstRound && (
                  <>
                    {' '}
                    (round {p.worstRound.roundNumber}, <GameLink gameId={p.worstRound.gameId}>game</GameLink>)
                  </>
                )}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Best & worst full game, per player">
        <ol className="space-y-2">
          {stats.players.map((p) => (
            <li key={p.name}>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Best: {p.bestGame?.total ?? '–'}
                {p.bestGame && (
                  <>
                    {' '}
                    (<GameLink gameId={p.bestGame.gameId}>game</GameLink>)
                  </>
                )}
                {' · '}
                Worst: {p.worstGame?.total ?? '–'}
                {p.worstGame && (
                  <>
                    {' '}
                    (<GameLink gameId={p.worstGame.gameId}>game</GameLink>)
                  </>
                )}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="All-time full-game records">
        <p className="text-sm">
          Best full game: {stats.bestGame?.playerName} scored {stats.bestGame?.total} (
          <GameLink gameId={stats.bestGame?.gameId}>game</GameLink>)
        </p>
        <p className="text-sm">
          Worst full game: {stats.worstGame?.playerName} scored {stats.worstGame?.total} (
          <GameLink gameId={stats.worstGame?.gameId}>game</GameLink>)
        </p>
      </Section>

      {stats.headToHead.length > 0 && (
        <Section title="Head-to-head (2-player games)">
          <ol className="space-y-1">
            {stats.headToHead.map((h2h) => (
              <li key={h2h.names.join('|')}>
                {h2h.wins.map((w) => `${w.name}: ${w.wins}`).join(' vs ')} ({h2h.games} games)
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
