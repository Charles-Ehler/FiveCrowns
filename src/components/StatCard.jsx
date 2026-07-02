export default function StatCard({ icon: Icon, label, accent, value, unit, playerName, context }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${accent.soft}`}>
          <Icon size={16} className={accent.text} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-extrabold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-gray-400">{unit}</span>}
      </p>
      {playerName && <p className="truncate text-sm font-semibold">{playerName}</p>}
      {context && <div className="text-xs text-gray-400 dark:text-gray-500">{context}</div>}
    </div>
  );
}
