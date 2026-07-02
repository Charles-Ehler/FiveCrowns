# CLAUDE.md

After completing any task in this repository:

1. Bump the version: `npm version patch --no-git-tag-version` (updates
   `package.json` and `package-lock.json` only, no git tag/commit of
   its own). This is what the version indicator in the app header
   reads at build time, so every deploy shows a distinct version.
2. `git add`, commit with a clear message (including the version bump),
   and `git push`.

Do this without asking for confirmation, unless the user explicitly
says otherwise for that task.
