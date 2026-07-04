import { computeTotals } from './fiveCrowns.js';

const CLOSER_MIN_ROUNDS = 11; // roughly one full game's worth of rounds
const IMPROVED_MIN_GAMES = 4; // need real history before "last 3 vs overall" means anything

export function playerKey(name) {
  return name.trim().toLowerCase();
}

function emptyPlayerStat(name) {
  return {
    name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    gameTotals: [],
    timeline: [], // { createdAtMs, won, total } — chronological, for streaks + most-improved
    wentOutCount: 0,
    roundsPlayed: 0,
    bestRound: null,
    worstRound: null,
    bestGame: null,
    worstGame: null,
    history: [], // { gameId, createdAt, total, placement, won, opponentNames } — for the player detail page
  };
}

function pairKeyFor(nameA, nameB) {
  return [playerKey(nameA), playerKey(nameB)].sort().join('|');
}

function timestampMs(ts) {
  return ts?.toMillis ? ts.toMillis() : 0;
}

function computeStreaks(timeline) {
  const sorted = [...timeline].sort((a, b) => a.createdAtMs - b.createdAtMs);
  let longest = 0;
  let running = 0;
  for (const entry of sorted) {
    running = entry.won ? running + 1 : 0;
    if (running > longest) longest = running;
  }
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (!sorted[i].won) break;
    current += 1;
  }
  return { longest, current };
}

// Positive = recent games are scoring lower (better) than this player's
// overall average; null if there isn't enough history to mean anything.
function computeImprovement(timeline) {
  if (timeline.length < IMPROVED_MIN_GAMES) return null;
  const sorted = [...timeline].sort((a, b) => a.createdAtMs - b.createdAtMs);
  const overallAvg = sorted.reduce((sum, t) => sum + t.total, 0) / sorted.length;
  const recent = sorted.slice(-3);
  const recentAvg = recent.reduce((sum, t) => sum + t.total, 0) / recent.length;
  return overallAvg - recentAvg;
}

// Only completed games count toward records; players are matched across
// games by (trimmed, lowercased) name since player ids are per-game UUIDs.
// Each "record" (bestGame, worstRound, etc.) is a single global stat with the
// player/game/date attached, for the Stats page's leaderboard-style cards.
export function computeStats(games) {
  const completed = games.filter((g) => g.status === 'complete');
  const perPlayer = new Map();
  const pairStats = new Map(); // pairKey -> { names: [a,b], games, wins: {name: n}, matches: [] }
  let bestGame = null;
  let worstGame = null;
  let bestRound = null;
  let worstRound = null;
  // Biggest gap closed between a player's worst round (relative to the rest
  // of the table that round) and their final placement (relative to the
  // winner) — a rough but self-contained "comeback" measure.
  let bestComeback = null;

  for (const game of completed) {
    const totals = computeTotals(game.players, game.rounds);
    const totalValues = Object.values(totals);
    const lastPlaceTotal = Math.max(...totalValues);
    const lowestTotal = Math.min(...totalValues);
    const losers = game.players.filter((p) => totals[p.id] === lastPlaceTotal);
    const isOutrightLoss = game.players.length > 1;
    const winners = game.players.filter((p) => game.winnerIds?.includes(p.id));
    const createdAtMs = timestampMs(game.createdAt);

    const roundMinByNumber = new Map();
    for (const round of game.rounds) {
      const scoresThisRound = game.players
        .map((p) => round.scores[p.id]?.score)
        .filter((s) => s !== undefined);
      if (scoresThisRound.length) roundMinByNumber.set(round.roundNumber, Math.min(...scoresThisRound));
    }

    for (const p of game.players) {
      const key = playerKey(p.name);
      if (!perPlayer.has(key)) perPlayer.set(key, emptyPlayerStat(p.name));
      const stat = perPlayer.get(key);

      const won = game.winnerIds?.includes(p.id) ?? false;
      stat.gamesPlayed += 1;
      stat.gameTotals.push(totals[p.id]);
      stat.timeline.push({ createdAtMs, won, total: totals[p.id] });
      if (won) stat.wins += 1;
      if (isOutrightLoss && losers.includes(p)) stat.losses += 1;

      let worstRoundGap = null;
      for (const round of game.rounds) {
        const entry = round.scores[p.id];
        if (!entry) continue;
        stat.roundsPlayed += 1;
        if (entry.wentOut) stat.wentOutCount += 1;

        const roundRecord = {
          playerName: p.name,
          gameId: game.id,
          createdAt: game.createdAt,
          roundNumber: round.roundNumber,
          score: entry.score,
        };
        if (!bestRound || roundRecord.score < bestRound.score) bestRound = roundRecord;
        if (!worstRound || roundRecord.score > worstRound.score) worstRound = roundRecord;
        if (!stat.bestRound || roundRecord.score < stat.bestRound.score) stat.bestRound = roundRecord;
        if (!stat.worstRound || roundRecord.score > stat.worstRound.score) stat.worstRound = roundRecord;

        const roundMin = roundMinByNumber.get(round.roundNumber) ?? entry.score;
        const gap = entry.score - roundMin;
        if (worstRoundGap === null || gap > worstRoundGap.gap) {
          worstRoundGap = { gap, roundNumber: round.roundNumber };
        }
      }

      if (worstRoundGap && worstRoundGap.gap > 0) {
        const finalGap = totals[p.id] - lowestTotal;
        const comebackSize = worstRoundGap.gap - finalGap;
        if (comebackSize > 0 && (!bestComeback || comebackSize > bestComeback.comebackSize)) {
          bestComeback = {
            playerName: p.name,
            gameId: game.id,
            createdAt: game.createdAt,
            roundNumber: worstRoundGap.roundNumber,
            comebackSize,
          };
        }
      }

      const gameRecord = { playerName: p.name, gameId: game.id, createdAt: game.createdAt, total: totals[p.id] };
      if (!bestGame || gameRecord.total < bestGame.total) bestGame = gameRecord;
      if (!worstGame || gameRecord.total > worstGame.total) worstGame = gameRecord;
      if (!stat.bestGame || gameRecord.total < stat.bestGame.total) stat.bestGame = gameRecord;
      if (!stat.worstGame || gameRecord.total > stat.worstGame.total) stat.worstGame = gameRecord;

      const placement = 1 + game.players.filter((other) => totals[other.id] < totals[p.id]).length;
      stat.history.push({
        gameId: game.id,
        createdAt: game.createdAt,
        total: totals[p.id],
        placement,
        won,
        opponentNames: game.players.filter((other) => other.id !== p.id).map((other) => other.name),
      });
    }

    // Pairwise record for every two players who shared this game — not just
    // strict 2-player games — so nemesis/head-to-head work in group games too.
    for (let i = 0; i < game.players.length; i += 1) {
      for (let j = i + 1; j < game.players.length; j += 1) {
        const a = game.players[i];
        const b = game.players[j];
        const key = pairKeyFor(a.name, b.name);
        if (!pairStats.has(key)) {
          pairStats.set(key, { names: [a.name, b.name], games: 0, wins: {}, matches: [] });
        }
        const pair = pairStats.get(key);
        pair.games += 1;
        const aWon = winners.some((w) => w.id === a.id);
        const bWon = winners.some((w) => w.id === b.id);
        let winnerName = null;
        if (aWon && !bWon) {
          pair.wins[a.name] = (pair.wins[a.name] ?? 0) + 1;
          winnerName = a.name;
        } else if (bWon && !aWon) {
          pair.wins[b.name] = (pair.wins[b.name] ?? 0) + 1;
          winnerName = b.name;
        }
        pair.matches.push({ gameId: game.id, createdAt: game.createdAt, winnerName });
      }
    }
  }

  const players = [...perPlayer.values()].map((stat) => {
    const { longest, current } = computeStreaks(stat.timeline);

    let nemesis = null;
    for (const pair of pairStats.values()) {
      const idx = pair.names.findIndex((name) => playerKey(name) === playerKey(stat.name));
      if (idx === -1) continue;
      const me = pair.names[idx];
      const opponent = pair.names[1 - idx];
      const theirWins = pair.wins[opponent] ?? 0;
      const myWins = pair.wins[me] ?? 0;
      if (theirWins > 0 && (!nemesis || theirWins > nemesis.theirWins)) {
        nemesis = { name: opponent, theirWins, myWins, games: pair.games };
      }
    }

    return {
      name: stat.name,
      gamesPlayed: stat.gamesPlayed,
      wins: stat.wins,
      losses: stat.losses,
      average: stat.gameTotals.length ? stat.gameTotals.reduce((sum, t) => sum + t, 0) / stat.gameTotals.length : 0,
      longestStreak: longest,
      currentStreak: current,
      nemesis,
      improvement: computeImprovement(stat.timeline),
      wentOutRate: stat.roundsPlayed >= CLOSER_MIN_ROUNDS ? stat.wentOutCount / stat.roundsPlayed : null,
      bestRound: stat.bestRound,
      worstRound: stat.worstRound,
      bestGame: stat.bestGame,
      worstGame: stat.worstGame,
      history: [...stat.history].sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt)),
    };
  });

  const mostImprovedCandidate = players
    .filter((p) => p.improvement !== null && p.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)[0];
  const mostImproved = mostImprovedCandidate
    ? { name: mostImprovedCandidate.name, improvement: mostImprovedCandidate.improvement }
    : null;

  const closerCandidate = players
    .filter((p) => p.wentOutRate !== null && p.wentOutRate > 0)
    .sort((a, b) => b.wentOutRate - a.wentOutRate)[0];
  const closer = closerCandidate ? { name: closerCandidate.name, rate: closerCandidate.wentOutRate } : null;

  const pairs = [...pairStats.values()]
    .map((pair) => ({
      names: pair.names,
      games: pair.games,
      wins: pair.names.map((name) => ({ name, wins: pair.wins[name] ?? 0 })),
      matches: [...pair.matches].sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt)),
    }))
    .sort((a, b) => b.games - a.games);

  return {
    players: players.sort((a, b) => b.gamesPlayed - a.gamesPlayed),
    pairs,
    bestGame,
    worstGame,
    bestRound,
    worstRound,
    bestComeback,
    mostImproved,
    closer,
    totalGames: completed.length,
  };
}
