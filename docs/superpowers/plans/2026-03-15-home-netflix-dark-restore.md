# Home Netflix Dark Restore Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the home landing page to the previous Netflix-style dark design exactly.

**Architecture:** Revert only the three home-specific files to their known-good versions from commit `33d8192`. Keep the change isolated from admin, reports, and service-page work already present in the repo.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, git history

---

### Task 1: Restore the home files

**Files:**
- Modify: `fe/public/index.html`
- Modify: `fe/public/assets/css/home.css`
- Modify: `fe/public/js/netflix-ui.js`

- [ ] **Step 1: Restore the exact known-good versions**

Run:
```bash
git restore --source 33d8192 -- fe/public/index.html fe/public/assets/css/home.css fe/public/js/netflix-ui.js
```

- [ ] **Step 2: Confirm only the intended files changed**

Run: `git status --short`
Expected: only the three home files plus spec/plan docs appear

### Task 2: Verify the restored structure

**Files:**
- Test: `fe/public/index.html`
- Test: `fe/public/assets/css/home.css`
- Test: `fe/public/js/netflix-ui.js`

- [ ] **Step 1: Check key dark-home markers**

Run:
```bash
rg -n 'html lang="ko" class="dark"|nflx-page|id="nflx-hero"' fe/public/index.html
rg -n 'nflx-page|nflx-hero-backdrop__core|nflx-rail-container' fe/public/assets/css/home.css
rg -n 'NetflixShell|renderRails|updateHero' fe/public/js/netflix-ui.js
```

- [ ] **Step 2: Confirm diffs are isolated**

Run: `git diff --stat`
Expected: home restore files and the spec/plan docs only

### Task 3: Commit the restore

**Files:**
- Add: `docs/superpowers/specs/2026-03-15-home-netflix-dark-restore-design.md`
- Add: `docs/superpowers/plans/2026-03-15-home-netflix-dark-restore.md`

- [ ] **Step 1: Stage the restore**

Run:
```bash
git add fe/public/index.html fe/public/assets/css/home.css fe/public/js/netflix-ui.js docs/superpowers/specs/2026-03-15-home-netflix-dark-restore-design.md docs/superpowers/plans/2026-03-15-home-netflix-dark-restore.md
```

- [ ] **Step 2: Commit**

Run:
```bash
git commit -m "Restore Netflix-style dark home design"
```
