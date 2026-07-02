import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CloudRain,
  Flame,
  Frown,
  Gem,
  Medal,
  Swords,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import Leaderboard from '../components/Leaderboard.jsx';
import StatCard from '../components/StatCard.jsx';
import WinBar from '../components/WinBar.jsx';
import { listGames } from '../lib/games.js';
import { computeStats } from '../lib/stats.js';

const ACCENT = {
  amber: { soft: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-500' },
  rose: { soft: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-500' },
  emerald: { soft: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-500' },
  violet: { soft: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-500' },
  indigo: { soft: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-500' },
  slate: { soft: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-500' },
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return null;
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400 dark:text-gray-500">
        <BarChart3 size={32} />
        <p>No stats yet — finish a game to see records here.</p>
      </div>
    );
  }

  const byWins = [...stats.players].sort((a, b) => b.wins - a.wins);
  const byLosses = [...stats.players].sort((a, b) => b.losses - a.losses)[0];
  const byMostActive = [...stats.players].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0];
  const byHighestAvg = [...stats.players].sort((a, b) => b.average - a.average)[0];
  const byLowestAvg = [...stats.players].sort((a, b) => a.average - b.average)[0];
  const showHeadToHead = stats.players.length === 2 && stats.headToHead.length === 1;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-extrabold">Stats</h1>

      <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Leaderboard · wins</p>
        <Leaderboard players={byWins} />
      </section>

      <WinBar
        title="Average score comparison (lower is better)"
        entries={[...stats.players].sort((a, b) => a.average - b.average).map((p) => ({ name: p.name, value: Math.round(p.average * 10) / 10 }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Trophy}
          accent={ACCENT.amber}
          label="Most wins"
          value={byWins[0].wins}
          playerName={byWins[0].name}
        />
        <StatCard
          icon={Frown}
          accent={ACCENT.rose}
          label="Most losses"
          value={byLosses.losses}
          playerName={byLosses.name}
        />
        {stats.bestRound && (
          <StatCard
            icon={Gem}
            accent={ACCENT.emerald}
            label="Best round"
            value={stats.bestRound.score}
            playerName={stats.bestRound.playerName}
            context={
              <GameContext
                gameId={stats.bestRound.gameId}
                createdAt={stats.bestRound.createdAt}
                extra={`Round ${stats.bestRound.roundNumber} ·`}
              />
            }
          />
        )}
        {stats.worstRound && (
          <StatCard
            icon={Flame}
            accent={ACCENT.rose}
            label="Rough round"
            value={stats.worstRound.score}
            playerName={stats.worstRound.playerName}
            context={
              <GameContext
                gameId={stats.worstRound.gameId}
                createdAt={stats.worstRound.createdAt}
                extra={`Round ${stats.worstRound.roundNumber} ·`}
              />
            }
          />
        )}
        {stats.bestGame && (
          <StatCard
            icon={Medal}
            accent={ACCENT.violet}
            label="Best game"
            value={stats.bestGame.total}
            playerName={stats.bestGame.playerName}
            context={<GameContext gameId={stats.bestGame.gameId} createdAt={stats.bestGame.createdAt} />}
          />
        )}
        {stats.worstGame && (
          <StatCard
            icon={CloudRain}
            accent={ACCENT.slate}
            label="The struggle"
            value={stats.worstGame.total}
            playerName={stats.worstGame.playerName}
            context={<GameContext gameId={stats.worstGame.gameId} createdAt={stats.worstGame.createdAt} />}
          />
        )}
        <StatCard
          icon={TrendingUp}
          accent={ACCENT.amber}
          label="Highest average"
          value={byHighestAvg.average.toFixed(1)}
          playerName={byHighestAvg.name}
        />
        <StatCard
          icon={TrendingDown}
          accent={ACCENT.emerald}
          label="Lowest average"
          value={byLowestAvg.average.toFixed(1)}
          playerName={byLowestAvg.name}
        />
        <StatCard
          icon={Users}
          accent={ACCENT.indigo}
          label="Most active"
          value={byMostActive.gamesPlayed}
          unit="games"
          playerName={byMostActive.name}
        />
      </div>

      {showHeadToHead && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Swords size={14} />
            Head-to-head
          </p>
          <p className="text-lg font-bold">
            {stats.headToHead[0].wins.map((w) => `${w.name} ${w.wins}`).join(' – ')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats.headToHead[0].games} games played</p>
        </section>
      )}
    </div>
  );
}
