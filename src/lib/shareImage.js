import { computeTotals } from './fiveCrowns.js';

const WIDTH = 640;

// Draws a simple summary card to an offscreen canvas — no html-to-image or
// similar dependency, plain 2D canvas drawing is enough for a scorecard image.
export function generateShareImage(game) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = 200 + 90 * game.players.length;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, canvas.height);
  gradient.addColorStop(0, '#7c3aed');
  gradient.addColorStop(1, '#f43f5e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  const margin = 24;
  ctx.fillRect(margin, margin, WIDTH - margin * 2, canvas.height - margin * 2);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.fillText('🏆 Five Crowns', margin + 28, margin + 56);

  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6b7280';
  const dateLabel = game.completedAt?.toDate
    ? game.completedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  ctx.fillText(`Final standings${dateLabel ? ' · ' + dateLabel : ''}`, margin + 28, margin + 84);

  const totals = computeTotals(game.players, game.rounds);
  const sorted = [...game.players].sort((a, b) => totals[a.id] - totals[b.id]);

  let y = margin + 130;
  sorted.forEach((p, i) => {
    const isWinner = game.winnerIds?.includes(p.id);
    ctx.fillStyle = isWinner ? '#fef3c7' : '#f9fafb';
    ctx.fillRect(margin + 20, y - 40, WIDTH - margin * 2 - 40, 66);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(String(i + 1), margin + 36, y);

    ctx.fillStyle = '#111827';
    ctx.font = `bold 24px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`${p.name}${isWinner ? ' 👑' : ''}`, margin + 70, y);

    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(totals[p.id]), WIDTH - margin - 40, y);
    ctx.textAlign = 'left';

    y += 90;
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
