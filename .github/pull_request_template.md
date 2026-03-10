## Change Type

- [ ] style
- [ ] structure
- [ ] logic

## Scope

- Changed paths:
- User-visible behavior changed: (yes/no)

## Rule Baseline (Required)

- [ ] Followed `docs/FE_CODE_STANDARDS.md`
- [ ] Did not add inline `style` or page-level `<style>`
- [ ] Reused existing classes from `tokens.css` / `components.css` / `module-templates.css` first

## Reuse Check (Required)
- [ ] Existing style token reused first
- [ ] Existing component/template reused first
- [ ] If new token/component added, rationale is documented below

Rationale (if any):

## AdSense Safety Check

- [ ] No forced wait before result content
- [ ] No deceptive ad-like CTA styling
- [ ] Ad placement follows `docs/ADSENSE_POLICY_GUARDRAILS.md`

## Validation

- [ ] `npm run build:pages`
- [ ] `bash tests/code_authoring_rules.test.sh`
- [ ] `bash tests/static_generation.test.sh`
- [ ] `bash tests/legacy_cleanup_guard.test.sh`
