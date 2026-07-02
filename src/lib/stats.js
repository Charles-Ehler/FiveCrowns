import { computeTotals } from './fiveCrowns.js';

function playerKey(name) {
  return name.trim().toLowerCase();
}

function emptyPlayerStat(name) {
  return { name, gamesPlayed: 0, wins: 0, losses: 0, gameTotals: [] };
}

// Only completed games count toward records; players are matched across
// games by (trimmed, lowercased) name since player ids are per-game UUIDs.
// Each "record" (bestGame, worstRound, etc.) is a single global stat with the
// player/game/date attached, for the Stats page's leaderboard-style cards.
export function computeStats(games) {
  const completed = games.filter((g) => g.status === 'complete');
  const perPlayer = new Map();
  const headToHead = new Map(); // sorted pair key -> { names: [a,b], wins: {a,b}, games }
  let bestGame = null; // lowest total ever recorded
  let worstGame = null; // highest total ever recorded
  let bestRound = null; // lowest single-round score ever recorded
  let worstRound = null; // highest single-round score ever recorded

  for (const game of completed) {
    const totals = computeTotals(game.players, game.rounds);
    const totalValues = Object.values(totals);
    const lastPlaceTotal = Math.max(...totalValues);
    const losers = game.players.filter((p) => totals[p.id] === lastPlaceTotal);
    const isOutrightLoss = game.players.length > 1;

    for (const p of game.players) {
      const key = playerKey(p.name);
      if (!perPlayer.has(key)) perPlayer.set(key, emptyPlayerStat(p.name));
      const stat = perPlayer.get(key);

      stat.gamesPlayed += 1;
      stat.gameTotals.push(totals[p.id]);
      if (game.winnerIds?.includes(p.id)) stat.wins += 1;
      if (isOutrightLoss && losers.includes(p)) stat.losses += 1;

      for (const round of game.rounds) {
        const entry = round.scores[p.id];
        if (!entry) continue;
        const roundRecord = {
          playerName: p.name,
          gameId: game.id,
          createdAt: game.createdAt,
          roundNumber: round.roundNumber,
          score: entry.score,
        };
        if (!bestRound || roundRecord.score < bestRound.score) bestRound = roundRecord;
        if (!worstRound || roundRecord.score > worstRound.score) worstRound = roundRecord;
      }

      const gameRecord = { playerName: p.name, gameId: game.id, createdAt: game.createdAt, total: totals[p.id] };
      if (!bestGame || gameRecord.total < bestGame.total) bestGame = gameRecord;
      if (!worstGame || gameRecord.total > worstGame.total) worstGame = gameRecord;
    }

    if (game.players.length === 2) {
      const [a, b] = game.players;
      const pairKey = [playerKey(a.name), playerKey(b.name)].sort().join('|');
      if (!headToHead.has(pairKey)) {
        headToHead.set(pairKey, { names: [a.name, b.name], wins: {}, games: 0 });
      }
      const h2h = headToHead.get(pairKey);
      h2h.games += 1;
      // Key wins by name (not id) since ids are per-game UUIDs.
      const winnerName = game.players.find((p) => game.winnerIds?.includes(p.id))?.name;
      if (winnerName) {
        h2h.wins[winnerName] = (h2h.wins[winnerName] ?? 0) + 1;
      }
    }
  }

  const players = [...perPlayer.values()].map((stat) => ({
    name: stat.name,
    gamesPlayed: stat.gamesPlayed,
    wins: stat.wins,
    losses: stat.losses,
    average: stat.gameTotals.length ? stat.gameTotals.reduce((sum, t) => sum + t, 0) / stat.gameTotals.length : 0,
  }));

  const headToHeadList = [...headToHead.values()].map((h2h) => ({
    names: h2h.names,
    games: h2h.games,
    wins: h2h.names.map((name) => ({ name, wins: h2h.wins[name] ?? 0 })),
  }));

  return {
    players: players.sort((a, b) => b.gamesPlayed - a.gamesPlayed),
    bestGame,
    worstGame,
    bestRound,
    worstRound,
    headToHead: headToHeadList,
    totalGames: completed.length,
  };
}
