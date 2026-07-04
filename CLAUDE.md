# CLAUDE.md

## Autonomy rules

- Do not stop to ask for approval on implementation choices, library selection, file structure, or styling decisions. Make the best call and note it in your summary.
- Do not present multiple options and wait for a response. Pick the best option, implement it, and state what you chose and why in one line.
- If something is ambiguous, note your assumption inline in the summary instead of pausing to ask.
- Proceed through a full task in one pass without stopping between files or components.
- Batch any genuine open questions into one message at the end of the task, not mid-task pauses.

## When to stop and ask (exceptions to autonomy)

Stop and ask only if a task requires one of these:

- A Firestore or Storage schema change (new field, new collection, new document structure)
- A Firestore or Storage security rules change
- Any action that risks real data loss (deleting real records, overwriting production data)
- A new paid dependency or a new billing-relevant service (e.g. anything that could affect Firebase Blaze usage/cost)

## Version and deploy workflow

After completing any task in this repository:

1. Bump the version: `npm version patch --no-git-tag-version` (updates `package.json` and `package-lock.json` only, no git tag/commit of its own). This is what the version indicator in the app header reads at build time, so every deploy shows a distinct version.
2. `git add`, commit with a clear message (include the version bump in the commit), and `git push`.

Do this without asking for confirmation, unless explicitly told otherwise for that specific task.

## Testing before push

- Verify locally with `npm run build && npm run preview` before pushing when a task touches build config, routing, or Firebase integration.
- Confirm mobile widths (375px, 414px) after any UI or layout change.
- Confirm dark mode contrast after any styling change.

## Data safety

- Never write test/dummy data (e.g. "SmokeTestA," "Test Player") into real Firestore collections during verification. If a live smoke test is unavoidable, clean up the test records immediately after and note this in the summary.
- Never modify or delete real game history without explicit confirmation, even if a task seems to imply it.