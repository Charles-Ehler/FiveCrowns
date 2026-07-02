# CLAUDE.md

Autonomy rules for this project:

- Do not stop to ask for approval on implementation choices, library
  selection, file structure, or styling decisions. Make the best call
  and note it in your summary.
- Only stop and ask if a fix requires a Firestore schema change, a
  security rules change, or risks real data loss.
- Do not present multiple options and wait for a response. Pick the
  best option, implement it, and state what you chose and why in one
  line.
- If something is ambiguous, note your assumption inline in the
  summary instead of pausing to ask.
- Proceed through a full task in one pass without stopping between
  files or components.

After completing any task in this repository:

1. Bump the version: `npm version patch --no-git-tag-version` (updates
   `package.json` and `package-lock.json` only, no git tag/commit of
   its own). This is what the version indicator in the app header
   reads at build time, so every deploy shows a distinct version.
2. `git add`, commit with a clear message (including the version bump),
   and `git push`.

Do this without asking for confirmation, unless the user explicitly
says otherwise for that task.
