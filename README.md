# Five Crowns Score Keeper

A mobile-first score keeper for the card game Five Crowns. No login —
anyone with the link can start a game or enter scores, with live sync
across devices via Firestore.

## Game rules recap

11 rounds, dealing 3 cards in round 1 up to 13 cards in round 11. Each
round's wild rank is `round number + 2` (round 1 = 3s, round 11 =
Kings). Lowest total penalty points after 11 rounds wins.

## Stack

- React + Vite
- Tailwind CSS v4
- Firebase Firestore (data + real-time sync)
- React Router (`HashRouter`, for GitHub Pages compatibility)
- GitHub Actions → GitHub Pages

## Local setup

```bash
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev
```

### `.env`

This project reuses the existing **tritip-taco-bar** Firebase project
(no new Firebase project created). Firestore is scoped with two
dedicated collections — `fiveCrowns_games` and `fiveCrowns_players` —
so this app's data never mixes with anything else in that project.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` is git-ignored; never commit real values.

### Firestore project setup (one-time, do this before anything else works)

1. **Enable Firestore** in the tritip-taco-bar project if it isn't
   already: Firebase Console → Firestore Database → Create database
   (Native mode). This project previously only had a Realtime
   Database, which is a separate product — Firestore reads/writes will
   hang or fail with `PERMISSION_DENIED` / `SERVICE_DISABLED` until a
   Firestore database actually exists.
2. Deploy `firestore.rules` (open read/write scoped to
   `fiveCrowns_games` and `fiveCrowns_players` only):
   ```bash
   firebase deploy --only firestore:rules --project tritip-taco-bar
   ```
   or paste the contents of `firestore.rules` into Firebase Console →
   Firestore Database → Rules.

## Data model

One document per game in `fiveCrowns_games`:

```js
{
  players: [{ id, name }],           // 2-7 entries, in display order
  rounds: [                          // one entry per completed round
    { roundNumber, scores: { [playerId]: { score, wentOut } } }
  ],
  currentRound: 1,                   // lowest round number with no score yet
  status: 'in_progress' | 'complete',
  winnerIds: [],                     // player ids tied for lowest total, set on completion
  createdAt, updatedAt, completedAt,
}
```

Recent player names for autocomplete live in `fiveCrowns_players/{lowercased-name}`.

## Deploying

Push to `main` and GitHub Actions builds and deploys to GitHub Pages
automatically (see `.github/workflows/deploy.yml`).

One-time repo setup required:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions**, add these repository
   secrets (same names as the `.env` keys above):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

The Vite `base` in `vite.config.js` is set to `/FiveCrowns/` to match
this repo's GitHub Pages URL.
