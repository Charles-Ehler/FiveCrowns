import { SUITS } from '../lib/suits.js';

const PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: (i * 41) % 100,
  delay: (i % 8) * 60,
  duration: 900 + (i % 5) * 120,
  suit: SUITS[i % SUITS.length],
}));

// Pure CSS keyframe animation (see .animate-confetti in index.css) — no
// confetti library, just a handful of absolutely-positioned spans that fall
// and fade once on mount.
export default function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 overflow-hidden">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className={`animate-confetti absolute top-0 h-2.5 w-2.5 rounded-sm ${piece.suit.bg}`}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
