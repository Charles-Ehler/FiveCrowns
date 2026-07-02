import { Crown } from 'lucide-react';
import { suitForName } from '../lib/suits.js';

const PODIUM_STYLE = [
  { order: 'order-2', pad: 'pt-0', ring: 'ring-amber-400', badge: 'bg-amber-400 text-amber-950', medal: '🥇' },
  { order: 'order-1', pad: 'pt-5', ring: 'ring-gray-300 dark:ring-gray-600', badge: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100', medal: '🥈' },
  { order: 'order-3', pad: 'pt-8', ring: 'ring-orange-400', badge: 'bg-orange-400 text-orange-950', medal: '🥉' },
];

export default function Leaderboard({ players }) {
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div>
      <div className="flex items-end justify-center gap-3">
        {top3.map((p, i) => {
          const style = PODIUM_STYLE[i];
          const suit = suitForName(p.name);
          return (
            <div key={p.name} className={`flex ${style.pad} ${style.order} flex-col items-center`}>
              <div className="relative">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ring-4 ${style.ring} ${suit.bg}`}
                >
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="absolute -bottom-1 -right-1 text-lg leading-none">{style.medal}</span>
              </div>
              <p className="mt-2 max-w-[5.5rem] truncate text-center text-sm font-semibold">{p.name}</p>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Crown size={12} />
                {p.wins} {p.wins === 1 ? 'win' : 'wins'}
              </p>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <ol className="mt-5 space-y-1.5">
          {rest.map((p, i) => (
            <li
              key={p.name}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-center font-semibold text-gray-400">{i + 4}</span>
                {p.name}
              </span>
              <span className="font-semibold">{p.wins} wins</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
