// Simple inline SVG illustration (a stack of blank playing cards) — no image
// assets, just a handful of paths, used for empty History/Stats states.
function CardsIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="18" y="18" width="56" height="72" rx="8" transform="rotate(-8 18 18)" className="fill-violet-100 dark:fill-violet-950/50" />
      <rect x="34" y="10" width="56" height="72" rx="8" transform="rotate(6 34 10)" className="fill-rose-100 dark:fill-rose-950/50" />
      <rect x="30" y="14" width="56" height="72" rx="8" className="fill-white stroke-gray-200 dark:fill-gray-900 dark:stroke-gray-700" strokeWidth="2" />
      <text x="58" y="58" textAnchor="middle" fontSize="30" className="fill-gray-300 dark:fill-gray-700" fontWeight="700">
        ?
      </text>
    </svg>
  );
}

export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <CardsIllustration />
      <p className="font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      {message && <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">{message}</p>}
    </div>
  );
}
