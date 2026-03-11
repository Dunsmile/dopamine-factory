# Root Directory Prune Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the repository root to product-facing directories only by moving tracked reports under `docs/` and removing tool-specific hidden directories from version control.

**Architecture:** Keep application code rooted in `be/`, `fe/`, `scripts/`, `tests/`, `docs/`, and `skills/`. Move tracked operational reports into `docs/reports/`, then update scripts, tests, and docs that reference the old `reports/` path before removing obsolete hidden tool directories from the repo root.

**Tech Stack:** Git, shell scripts, Markdown docs, JSON report artifacts

---

### Task 1: Move tracked reports under `docs/`

**Files:**
- Create: `docs/reports/`
- Move: `reports/*` -> `docs/reports/*`
- Modify: `README.md`

- [ ] **Step 1: Create the target directory**

Run: `mkdir -p docs/reports`
Expected: directory exists

- [ ] **Step 2: Move tracked report files**

Run: `git mv reports docs/reports`
Expected: staged renames from `reports/*` to `docs/reports/reports/*` or equivalent move to final target layout

- [ ] **Step 3: Normalize final layout**

Run: adjust moved files so report files live at `docs/reports/*`
Expected: no tracked top-level `reports/` directory remains

- [ ] **Step 4: Update README structure**

Use `apply_patch` to document the reduced root layout and note `docs/reports/` as the report location.

- [ ] **Step 5: Verify moved files are tracked**

Run: `git status --short`
Expected: staged renames for report files

### Task 2: Update report path references

**Files:**
- Modify: `docs/OPS_WORKFLOW.md`
- Modify: `docs/SCALING_EXECUTION_CHECKLIST.md`
- Modify: `docs/archive/NEXT_CYCLE_EXECUTION_PLAN.md`
- Modify: `docs/archive/SCALING_EXECUTION_CHECKLIST.md`
- Modify: `docs/archive/ASTRO_PILOT_GATE.md`
- Modify: `scripts/generate-next-actions.js`
- Modify: `tests/ops_reporting.test.sh`

- [ ] **Step 1: Replace documentation references**

Use `apply_patch` so docs point to `docs/reports/...` instead of `reports/...`.

- [ ] **Step 2: Replace script input paths**

Use `apply_patch` in `scripts/generate-next-actions.js` so generated reports read from `docs/reports/...`.

- [ ] **Step 3: Replace test expectations**

Use `apply_patch` in `tests/ops_reporting.test.sh` so ops report checks read from `docs/reports/...`.

- [ ] **Step 4: Re-scan for stale top-level report paths**

Run: `rg -n "reports/" README.md docs scripts tests`
Expected: only intentional references to `docs/reports/`

### Task 3: Remove tool-specific hidden directories from the repo root

**Files:**
- Delete: `.adal/`, `.agent/`, `.agents/`, `.augment/`, `.claude/`, `.codebuddy/`, `.commandcode/`, `.continue/`, `.cortex/`, `.crush/`, `.factory/`, `.goose/`, `.iflow/`, `.junie/`, `.kilocode/`, `.kiro/`, `.kode/`, `.mcpjam/`, `.mux/`, `.neovate/`, `.openhands/`, `.pi/`, `.pochi/`, `.qoder/`, `.qwen/`, `.roo/`, `.trae/`, `.vibe/`, `.windsurf/`, `.zencoder/`
- Modify: `docs/FRONTEND_COLLAB_RULES.md`

- [ ] **Step 1: Update collaboration rules**

Use `apply_patch` so the rules say in-repo skills live only in `skills/` and tool-specific hidden directories are not kept in the repository.

- [ ] **Step 2: Remove tracked hidden directories**

Run: `git rm -r <dirs...>`
Expected: staged deletions for all tool-specific hidden directories

- [ ] **Step 3: Verify canonical directories remain**

Run: `git ls-tree --name-only HEAD | sort`
Expected after commit: root keeps product directories plus necessary config files only

### Task 4: Verify and commit

**Files:**
- Test: `tests/ops_reporting.test.sh`
- Test: root directory listing / grep checks

- [ ] **Step 1: Run targeted verification**

Run: `bash tests/ops_reporting.test.sh`
Expected: PASS using `docs/reports/...`

- [ ] **Step 2: Verify root directory set**

Run: `find . -maxdepth 1 -mindepth 1 -type d | sort`
Expected: only intentional root directories remain

- [ ] **Step 3: Commit**

Run:
```bash
git add README.md docs/FRONTEND_COLLAB_RULES.md docs/OPS_WORKFLOW.md docs/SCALING_EXECUTION_CHECKLIST.md docs/archive/NEXT_CYCLE_EXECUTION_PLAN.md docs/archive/SCALING_EXECUTION_CHECKLIST.md docs/archive/ASTRO_PILOT_GATE.md docs/reports scripts/generate-next-actions.js tests/ops_reporting.test.sh
git commit -m "Prune root directories and relocate reports"
```
Expected: clean commit for the root cleanup only
