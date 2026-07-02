import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { TOTAL_ROUNDS, computeCurrentRound, computeTotals, createPlayerId } from './fiveCrowns.js';

const GAMES_COLLECTION = 'fiveCrowns_games';
const PLAYERS_COLLECTION = 'fiveCrowns_players';
const RECENT_PLAYERS_LIMIT = 30;

export function subscribeToGame(gameId, onChange, onError) {
  return onSnapshot(
    doc(db, GAMES_COLLECTION, gameId),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    onError,
  );
}

export async function createGame(playerNames) {
  const players = playerNames.map((name) => ({ id: createPlayerId(), name }));
  const ref = await addDoc(collection(db, GAMES_COLLECTION), {
    players,
    rounds: [],
    currentRound: 1,
    status: 'in_progress',
    winnerIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });
  await Promise.all(playerNames.map((name) => saveRecentPlayerName(name)));
  return ref.id;
}

// Handles both a brand-new round and editing a past round through the same
// path: the round list is always fully recomputed (current round, status,
// winners) from whichever rounds exist afterward, so there's no separate
// "advance" vs "edit" branch to keep in sync.
export async function submitRoundScores(gameId, roundNumber, scoresByPlayerId) {
  const ref = doc(db, GAMES_COLLECTION, gameId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Game not found');
    const game = snap.data();

    const rounds = game.rounds.filter((r) => r.roundNumber !== roundNumber);
    rounds.push({ roundNumber, scores: scoresByPlayerId });
    rounds.sort((a, b) => a.roundNumber - b.roundNumber);

    tx.update(ref, buildRoundsUpdate(game, rounds));
  });
}

export async function undoLastRound(gameId) {
  const ref = doc(db, GAMES_COLLECTION, gameId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Game not found');
    const game = snap.data();
    if (game.rounds.length === 0) return;

    const lastRoundNumber = Math.max(...game.rounds.map((r) => r.roundNumber));
    const rounds = game.rounds.filter((r) => r.roundNumber !== lastRoundNumber);

    tx.update(ref, buildRoundsUpdate(game, rounds));
  });
}

function buildRoundsUpdate(game, rounds) {
  const complete = rounds.length === TOTAL_ROUNDS;
  const update = {
    rounds,
    currentRound: computeCurrentRound(rounds),
    updatedAt: serverTimestamp(),
  };

  if (complete) {
    const totals = computeTotals(game.players, rounds);
    const lowest = Math.min(...Object.values(totals));
    update.status = 'complete';
    update.winnerIds = Object.keys(totals).filter((id) => totals[id] === lowest);
    update.completedAt = game.completedAt ?? serverTimestamp();
  } else {
    update.status = 'in_progress';
    update.winnerIds = [];
    update.completedAt = null;
  }

  return update;
}

export async function deleteGame(gameId) {
  await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
}

export async function listGames() {
  const q = query(collection(db, GAMES_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveRecentPlayerName(name) {
  const trimmed = name.trim();
  const id = trimmed.toLowerCase();
  if (!id) return;
  await setDoc(
    doc(db, PLAYERS_COLLECTION, id),
    { name: trimmed, lastUsedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function listRecentPlayerNames() {
  const q = query(collection(db, PLAYERS_COLLECTION), orderBy('lastUsedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.slice(0, RECENT_PLAYERS_LIMIT).map((d) => ({ name: d.data().name, lastUsedAt: d.data().lastUsedAt }));
}
