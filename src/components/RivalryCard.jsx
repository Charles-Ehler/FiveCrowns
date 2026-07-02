import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Swords } from 'lucide-react';
import { suitForName } from '../lib/suits.js';

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Tappable — expands to the shared match history between this pair.
export default function RivalryCard({ pair, featured = false }) {
  const [expanded, setExpanded] = useState(false);
  const [a, b] = pair.wins;
  const suitA = suitForName(a.name);
  const suitB = suitForName(b.name);

  return (
    <div
      className={[
        'overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors dark:bg-gray-900',
        featured ? 'border-violet-300 dark:border-violet-600' : 'border-gray-200 dark:border-gray-800',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 p-4 text-left transition-colors active:bg-gray-50 dark:active:bg-gray-800"
      >
        <div className="flex flex-1 flex-col items-center gap-1">
          {featured && (
            <span className="mb-1 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <Swords size={10} />
              Current rivalry
            </span>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${suitA.bg}`}
              >
                {a.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[5rem] truncate text-xs font-medium">{a.name}</span>
            </div>
            <span className="text-xl font-extrabold tabular-nums">
              {a.wins}
              <span className="text-gray-300 dark:text-gray-700">-</span>
              {b.wins}
            </span>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${suitB.bg}`}
              >
                {b.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[5rem] truncate text-xs font-medium">{b.name}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">{pair.games} games played</p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <ul className="space-y-1.5 border-t border-gray-100 p-3 text-sm dark:border-gray-800">
          {pair.matches.map((m) => (
            <li key={m.gameId} className="flex items-center justify-between">
              <NavLink to={`/history/${m.gameId}`} className="font-medium text-violet-600 dark:text-violet-400">
                {formatDate(m.createdAt)}
              </NavLink>
              <span className="text-gray-500 dark:text-gray-400">
                {m.winnerName ? `${m.winnerName} won` : 'No clear winner'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
