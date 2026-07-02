import { suitForIndex } from '../lib/suits.js';

// Lightweight CSS-bar comparison — deliberately not a charting library, just
// a handful of divs sized by percentage of the max value.
export default function WinBar({ title, entries, formatValue = (v) => v }) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-2.5">
        {entries.map((entry, i) => {
          const suit = suitForIndex(i);
          const pct = Math.max(4, Math.round((entry.value / max) * 100));
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-xs font-medium">{entry.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className={`h-full rounded-full ${suit.bg}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
