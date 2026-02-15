# Home Refactor Checklist (Collab Standard)

## Scope
- Path: `fe/public/index.html`, `fe/public/js/home.js`
- Goal: remove ad-hoc patterns (inline style, repeated magic structure), stabilize maintainable collaboration format.

## Styling Policy
- Tailwind CSS usage is allowed.
- Avoid arbitrary one-off color values (`[#xxxxxx]` style or repeated hardcoded hex/rgba).
- Prefer shared tokens/semantic variables for color, radius, spacing, and shadows.

## Phase 1: Baseline Hygiene
- [x] Remove inline style strings in JS-rendered sidebar footer
- [x] Replace dynamic `style="--stack-offset"` with semantic classes (`offset-0/1/2`)
- [x] Keep required external inline style only (`noscript` GTM iframe)

## Phase 2: Markup/Behavior Separation
- [x] Reduce inline `onclick` in static HTML header/nav
- [x] Move event binding to `initHome()` delegated handlers
- [x] Keep public behavior parity (home/fortune/my/profile/search)

## Phase 3: CSS Structure Consistency
- [x] Group section styles by feature block (hero/latest/catalog/profile/footer)
- [x] Consolidate repeated values into shared tokens
- [x] Normalize mobile overrides to avoid duplicate declarations

## Phase 4: Verification
- [ ] Desktop: dark/light, tab switching
- [ ] Mobile: bottom nav, search overlay, hero autoplay/progress
- [ ] No JS syntax errors (`node --check`)

## Commit Plan
1. `chore(ui): remove inline style patterns and normalize sidebar/footer classes`
2. `refactor(ui): move inline onclick handlers to JS event bindings`
3. `refactor(css): normalize section structure and mobile override consistency`
4. `chore(qa): verify dark/light and responsive interaction parity`
