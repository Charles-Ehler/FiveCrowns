export const TOTAL_ROUNDS = 11;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 7;

const RANK_LABELS = { 11: 'J', 12: 'Q', 13: 'K' };

// Round 1 deals 3 cards with 3s wild; round 11 deals 13 cards with Kings wild.
export function cardsDealtForRound(round) {
  return round + 2;
}

export function wildRankForRound(round) {
  const rank = round + 2;
  return RANK_LABELS[rank] ?? String(rank);
}

export function createPlayerId() {
  return crypto.randomUUID();
}

export function computeTotals(players, rounds) {
  const totals = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });
  rounds.forEach((round) => {
    players.forEach((p) => {
      totals[p.id] += round.scores[p.id]?.score ?? 0;
    });
  });
  return totals;
}

// The active round is always the lowest round number with no recorded score yet,
// so editing an earlier round never has to fight with sequential "next round" advancement.
export function computeCurrentRound(rounds) {
  const present = new Set(rounds.map((r) => r.roundNumber));
  for (let round = 1; round <= TOTAL_ROUNDS; round += 1) {
    if (!present.has(round)) return round;
  }
  return TOTAL_ROUNDS;
}

export function sortPlayersByTotal(players, rounds) {
  const totals = computeTotals(players, rounds);
  return [...players].sort((a, b) => totals[a.id] - totals[b.id]);
}
