import { computeTotals } from './fiveCrowns.js';

function playerKey(name) {
  return name.trim().toLowerCase();
}

function emptyPlayerStat(name) {
  return {
    name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    gameTotals: [], // { total, gameId }
    roundScores: [], // { score, gameId, roundNumber }
  };
}

// Only completed games count toward records; players are matched across
// games by (trimmed, lowercased) name since player ids are per-game UUIDs.
export function computeStats(games) {
  const completed = games.filter((g) => g.status === 'complete');
  const perPlayer = new Map();
  const headToHead = new Map(); // sorted pair key -> { names: [a,b], wins: {a:0,b:0}, games: 0 }
  let bestGame = null; // lowest total ever recorded
  let worstGame = null; // highest total ever recorded

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
      stat.gameTotals.push({ total: totals[p.id], gameId: game.id });
      if (game.winnerIds?.includes(p.id)) stat.wins += 1;
      if (isOutrightLoss && losers.includes(p)) stat.losses += 1;

      for (const round of game.rounds) {
        const entry = round.scores[p.id];
        if (entry) {
          stat.roundScores.push({ score: entry.score, gameId: game.id, roundNumber: round.roundNumber });
        }
      }

      const record = { playerName: p.name, gameId: game.id, total: totals[p.id] };
      if (!bestGame || record.total < bestGame.total) bestGame = record;
      if (!worstGame || record.total > worstGame.total) worstGame = record;
    }

    if (game.players.length === 2) {
      const [a, b] = game.players;
      const pairKey = [playerKey(a.name), playerKey(b.name)].sort().join('|');
      if (!headToHead.has(pairKey)) {
        headToHead.set(pairKey, { names: [a.name, b.name], wins: { [a.id]: 0, [b.id]: 0 }, games: 0 });
      }
      const h2h = headToHead.get(pairKey);
      h2h.games += 1;
      // Re-key wins by name in case ids differ from a previous game between the same two people.
      const winnerName = game.players.find((p) => game.winnerIds?.includes(p.id))?.name;
      if (winnerName) {
        h2h.wins[winnerName] = (h2h.wins[winnerName] ?? 0) + 1;
      }
    }
  }

  const players = [...perPlayer.values()].map((stat) => {
    const bestRound = stat.roundScores.reduce(
      (min, r) => (min === null || r.score < min.score ? r : min),
      null,
    );
    const worstRound = stat.roundScores.reduce(
      (max, r) => (max === null || r.score > max.score ? r : max),
      null,
    );
    const bestPlayerGame = stat.gameTotals.reduce(
      (min, g) => (min === null || g.total < min.total ? g : min),
      null,
    );
    const worstPlayerGame = stat.gameTotals.reduce(
      (max, g) => (max === null || g.total > max.total ? g : max),
      null,
    );
    const average = stat.gameTotals.length
      ? stat.gameTotals.reduce((sum, g) => sum + g.total, 0) / stat.gameTotals.length
      : 0;

    return {
      name: stat.name,
      gamesPlayed: stat.gamesPlayed,
      wins: stat.wins,
      losses: stat.losses,
      average,
      bestRound,
      worstRound,
      bestGame: bestPlayerGame,
      worstGame: worstPlayerGame,
    };
  });

  const headToHeadList = [...headToHead.values()].map((h2h) => ({
    names: h2h.names,
    games: h2h.games,
    wins: h2h.names.map((name) => ({ name, wins: h2h.wins[name] ?? 0 })),
  }));

  return {
    players: players.sort((a, b) => b.gamesPlayed - a.gamesPlayed),
    bestGame,
    worstGame,
    headToHead: headToHeadList,
    totalGames: completed.length,
  };
}
