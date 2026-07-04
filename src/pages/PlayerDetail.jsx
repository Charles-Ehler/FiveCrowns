import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CloudRain,
  Flag,
  Flame,
  Gem,
  Medal,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import RivalryCard from '../components/RivalryCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { listGames } from '../lib/games.js';
import { computeStats, playerKey } from '../lib/stats.js';
import { suitForName } from '../lib/suits.js';

const ACCENT = {
  amber: { soft: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-500' },
  rose: { soft: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-500' },
  emerald: { soft: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-500' },
  violet: { soft: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-500' },
  slate: { soft: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-500' },
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function GameContext({ gameId, createdAt, extra }) {
  return (
    <p className="flex items-center gap-1">
      {extra && <span>{extra}</span>}
      <NavLink to={`/history/${gameId}`} className="font-medium text-violet-600 dark:text-violet-400">
        View game
      </NavLink>
      {formatDate(createdAt) && <span>· {formatDate(createdAt)}</span>}
    </p>
  );
}

export default function PlayerDetail() {
  const { playerName } = useParams();
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

  const decodedName = decodeURIComponent(playerName);
  const player = stats.players.find((p) => playerKey(p.name) === playerKey(decodedName));

  if (!player) {
    return (
      <div className="p-4">
        <NavLink to="/stats" className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
          <ArrowLeft size={16} />
          Back to stats
        </NavLink>
        <EmptyState title="Player not found" message={`No stats for "${decodedName}" — they may have been removed.`} />
      </div>
    );
  }

  const suit = suitForName(player.name);
  const pairs = stats.pairs.filter((pair) => pair.names.some((n) => playerKey(n) === playerKey(player.name)));
  const winRate = player.gamesPlayed ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      <NavLink to="/stats" className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
        <ArrowLeft size={16} />
        Back to stats
      </NavLink>

      <div className="flex items-center gap-4">
        <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${suit.bg}`}>
          {player.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">{player.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'} played
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="flex items-center gap-1 text-2xl font-extrabold tabular-nums">
            <Trophy size={16} className="text-amber-500" />
            {player.wins}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-gray-400">Wins</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="text-2xl font-extrabold tabular-nums">{winRate}%</span>
          <span className="text-[11px] uppercase tracking-wide text-gray-400">Win rate</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-3">
          <span className="text-2xl font-extrabold tabular-nums">{player.average.toFixed(1)}</span>
          <span className="text-[11px] uppercase tracking-wide text-gray-400">Avg score</span>
        </div>
      </div>

      {(player.currentStreak >= 2 || player.longestStreak >= 2) && (
        <div className="flex gap-2.5">
          {player.currentStreak >= 2 && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Zap size={14} />
              {player.currentStreak}-game streak
            </span>
          )}
          {player.longestStreak >= 2 && (
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Best: {player.longestStreak} wins
            </span>
          )}
        </div>
      )}

      {player.nemesis && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
            <Target size={14} />
            Nemesis
          </p>
          <p className="text-lg font-bold">
            {player.nemesis.myWins}-{player.nemesis.theirWins}{' '}
            <span className="font-normal text-gray-500 dark:text-gray-400">vs</span>{' '}
            <NavLink to={`/stats/${encodeURIComponent(player.nemesis.name)}`} className="underline decoration-dotted">
              {player.nemesis.name}
            </NavLink>
          </p>
        </div>
      )}

      {pairs.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Swords size={18} className="text-violet-500" />
            Head-to-head
          </h2>
          <div className="space-y-2.5">
            {pairs.map((pair) => (
              <RivalryCard key={pair.names.join('|')} pair={pair} />
            ))}
          </div>
        </section>
      )}

      {(player.bestRound || player.worstRound || player.bestGame || player.worstGame) && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Trophy size={18} className="text-violet-500" />
            Personal records
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {player.bestRound && (
              <StatCard
                icon={Gem}
                accent={ACCENT.emerald}
                label="Cleanest round"
                value={player.bestRound.score}
                context={
                  <GameContext
                    gameId={player.bestRound.gameId}
                    createdAt={player.bestRound.createdAt}
                    extra={`Round ${player.bestRound.roundNumber} ·`}
                  />
                }
              />
            )}
            {player.worstRound && (
              <StatCard
                icon={Flame}
                accent={ACCENT.rose}
                label="Rough round"
                value={player.worstRound.score}
                context={
                  <GameContext
                    gameId={player.worstRound.gameId}
                    createdAt={player.worstRound.createdAt}
                    extra={`Round ${player.worstRound.roundNumber} ·`}
                  />
                }
              />
            )}
            {player.bestGame && (
              <StatCard
                icon={Medal}
                accent={ACCENT.violet}
                label="Best game"
                value={player.bestGame.total}
                context={<GameContext gameId={player.bestGame.gameId} createdAt={player.bestGame.createdAt} />}
              />
            )}
            {player.worstGame && (
              <StatCard
                icon={CloudRain}
                accent={ACCENT.slate}
                label="Worst game"
                value={player.worstGame.total}
                context={<GameContext gameId={player.worstGame.gameId} createdAt={player.worstGame.createdAt} />}
              />
            )}
            {player.improvement !== null && player.improvement > 0 && (
              <StatCard
                icon={Sparkles}
                accent={ACCENT.violet}
                label="Trending"
                value={player.improvement.toFixed(1)}
                unit="pts better"
                context={<p>Last 3 games vs. overall average</p>}
              />
            )}
            {player.wentOutRate !== null && (
              <StatCard
                icon={Flag}
                accent={ACCENT.emerald}
                label="Goes out"
                value={Math.round(player.wentOutRate * 100)}
                unit="% of rounds"
              />
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Game history</h2>
        <ul className="space-y-2">
          {player.history.map((g) => (
            <li key={g.gameId}>
              <NavLink
                to={`/history/${g.gameId}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    vs {g.opponentNames.join(', ') || '—'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(g.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      g.won
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                    ].join(' ')}
                  >
                    {g.won ? 'Won' : `#${g.placement}`}
                  </span>
                  <span className="text-lg font-bold tabular-nums">{g.total}</span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
