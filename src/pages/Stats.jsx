import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CloudRain,
  Flag,
  Flame,
  Gem,
  Medal,
  PartyPopper,
  Rocket,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import RivalryCard from '../components/RivalryCard.jsx';
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

function SectionHeader({ icon: Icon, children }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
      <Icon size={18} className="text-violet-500" />
      {children}
    </h2>
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
    return <EmptyState title="No stats yet" message="Finish a game to see records here." />;
  }

  const byWins = [...stats.players].sort((a, b) => b.wins - a.wins);
  const byHighestAvg = [...stats.players].sort((a, b) => b.average - a.average)[0];
  const byLowestAvg = [...stats.players].sort((a, b) => a.average - b.average)[0];
  const byMostActive = [...stats.players].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0];
  const byLongestStreak = [...stats.players].sort((a, b) => b.longestStreak - a.longestStreak)[0];
  const activeStreaks = stats.players
    .filter((p) => p.currentStreak >= 2)
    .sort((a, b) => b.currentStreak - a.currentStreak);
  const playersWithNemesis = stats.players.filter((p) => p.nemesis);

  const isDuo = stats.players.length === 2;
  const duoPair = isDuo ? stats.pairs[0] : null;
  const featuredPair = !isDuo ? stats.pairs[0] : null;
  const otherPairs = !isDuo ? stats.pairs.slice(1, 8) : [];

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-extrabold">Stats</h1>

      {/* Hero: podium leaderboard */}
      <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Leaderboard · wins</p>
        <Leaderboard players={byWins} />
        <div className="mt-5">
          <WinBar
            title="Average score comparison (lower is better)"
            entries={[...stats.players]
              .sort((a, b) => a.average - b.average)
              .map((p) => ({ name: p.name, value: Math.round(p.average * 10) / 10 }))}
          />
        </div>
      </section>

      {/* Rivalries: the fan favorites */}
      <section>
        <SectionHeader icon={Swords}>Rivalries</SectionHeader>
        <div className="space-y-2.5">
          {isDuo && duoPair && <RivalryCard pair={duoPair} featured />}
          {!isDuo && featuredPair && <RivalryCard pair={featuredPair} featured />}
          {!isDuo && otherPairs.map((pair) => <RivalryCard key={pair.names.join('|')} pair={pair} />)}
        </div>

        {playersWithNemesis.length > 0 && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Target size={14} />
              Nemesis
            </p>
            <ul className="space-y-1.5 text-sm">
              {playersWithNemesis.map((p) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span>
                    <span className="font-bold tabular-nums">
                      {p.nemesis.myWins}-{p.nemesis.theirWins}
                    </span>
                    <span className="text-gray-400"> vs </span>
                    <span className="font-semibold">{p.nemesis.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Records: grid of stat cards */}
      <section>
        <SectionHeader icon={Trophy}>Records</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          {stats.bestRound && (
            <StatCard
              icon={Gem}
              accent={ACCENT.emerald}
              label="Cleanest round"
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
              label="Best game ever"
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
          {byLongestStreak.longestStreak > 0 && (
            <StatCard
              icon={Zap}
              accent={ACCENT.amber}
              label="Longest streak"
              value={byLongestStreak.longestStreak}
              unit="wins"
              playerName={byLongestStreak.name}
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

        {activeStreaks.length > 0 && (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Zap size={14} />
              Current streaks
            </p>
            <ul className="space-y-1 text-sm">
              {activeStreaks.map((p) => (
                <li key={p.name} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="font-semibold">{p.currentStreak}-game win streak</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Fun extras: lighthearted, derived from existing data only */}
      {(stats.mostImproved || stats.closer || stats.bestComeback) && (
        <section>
          <SectionHeader icon={PartyPopper}>Fun Extras</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            {stats.mostImproved && (
              <StatCard
                icon={Sparkles}
                accent={ACCENT.violet}
                label="Most improved"
                value={stats.mostImproved.improvement.toFixed(1)}
                unit="pts"
                playerName={stats.mostImproved.name}
                context={<p>Last 3 games vs. their overall average</p>}
              />
            )}
            {stats.closer && (
              <StatCard
                icon={Flag}
                accent={ACCENT.emerald}
                label="The closer"
                value={Math.round(stats.closer.rate * 100)}
                unit="%"
                playerName={stats.closer.name}
                context={<p>Rounds gone out first</p>}
              />
            )}
            {stats.bestComeback && (
              <StatCard
                icon={Rocket}
                accent={ACCENT.amber}
                label="Comeback kid"
                value={stats.bestComeback.comebackSize}
                unit="pts"
                playerName={stats.bestComeback.playerName}
                context={
                  <GameContext
                    gameId={stats.bestComeback.gameId}
                    createdAt={stats.bestComeback.createdAt}
                    extra={`Round ${stats.bestComeback.roundNumber} ·`}
                  />
                }
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
