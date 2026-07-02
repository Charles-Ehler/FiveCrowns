# CLAUDE.md
Autonomy rules for this project:
- Do not stop to ask for confirmation on implementation choices, library selection, file structure, or styling decisions. Make the best call and note it in your summary.
- Only stop and ask if the fix requires touching Firestore rules, the data model, or anything that could cause data loss.
- Do not present multiple options and wait for me to pick. Pick the best option yourself, implement it, tell me what you chose and why in one line.
- Batch questions. If something is genuinely ambiguous, note your assumption inline in the summary instead of pausing to ask.
- Proceed through the full build in one pass without stopping between files or components.
After completing any task in this repository:

1. Bump the version: `npm version patch --no-git-tag-version` (updates
   `package.json` and `package-lock.json` only, no git tag/commit of
   its own). This is what the version indicator in the app header
   reads at build time, so every deploy shows a distinct version.
2. `git add`, commit with a clear message (including the version bump),
   and `git push`.

Do this without asking for confirmation, unless the user explicitly
says otherwise for that task.
