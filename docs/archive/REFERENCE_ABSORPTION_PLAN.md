# Reference Absorption Plan (Good Only)

## Scope
- Target references:
  - https://poomang.com/
  - https://testmoa.com/
  - https://www.banggooso.com/
  - https://testevery.com/
  - https://home.smore.im/
- Goal: absorb only scalable patterns aligned with current SSG architecture.

## Site-by-site Decision

### 1) Poomang
- Adopt:
  - Home sections by intent: `New`, `Trending`, themed collections.
  - Popularity-based ordering metadata (view/like counters).
  - Large thumbnail card listing for rapid content scanning.
- Reject:
  - Infinite homepage section sprawl.
  - Heavy visual carousel dependence without clear information hierarchy.

### 2) Testmoa
- Adopt:
  - Strong taxonomy by test theme/category.
  - Question count + expected duration display before start.
  - Dense index page with quick discoverability.
- Reject:
  - Overlong single-page listing without progressive filtering.
  - Excessive long-tail content blocks harming first-screen focus.

### 3) Banggooso
- Adopt:
  - Category chips (`MBTI/Typology`, `Chemistry`, `Love`, `Mini game`, etc.).
  - HOT labels + social proof counts for ranking cards.
  - Mixed content types (quiz, compatibility, mini game) under one feed.
- Reject:
  - Login-first/engagement-first elements for core browsing.
  - Over-gamified feed blocks that hide utility-oriented services.

### 4) Testevery
- Adopt:
  - None for current product direction.
- Reject:
  - Education-center positioning is different from utility/test portal direction.

### 5) Smore
- Adopt:
  - Template-first onboarding (start from prebuilt templates).
  - No-code builder framing and end-page CTA thinking.
  - Analytics/funnel mindset for drop-off and conversion.
- Reject:
  - SaaS pricing/integration complexity in early phase.
  - Builder UX depth before service catalog quality is stabilized.

## Product Principles to Keep
- Keep homepage concise: featured + trending + category sections only.
- Show service metadata consistently: category, short description, freshness/popularity signals.
- Preserve SSG-first architecture (`fe/src -> build -> fe/public`) and avoid runtime content rendering for core pages.

## Implementation Roadmap

### Phase A: Discoverability (Home IA)
- Add 3 home sections:
  - `Latest`
  - `Trending`
  - `Category Picks`
- Extend source manifest fields:
  - `featuredRank`
  - `trendingScore`
  - `updatedAt`
  - `estimatedDuration`
  - `questionCount`

### Phase B: Service Card Standard
- Standard card schema (all services):
  - title, emoji/icon, one-line desc
  - category badge
  - optional `questionCount`, `estimatedDuration`
  - optional `socialProof` (views/likes)
- Keep visual size system fixed to avoid card drift.

### Phase C: Template Operating Model
- Expand `create-service` scaffold to include:
  - metadata stub in source manifest
  - default card meta fields
  - default FAQ/SEO section placeholders
- Maintain generated-file guardrails in tests.

### Phase D: Analytics Readiness
- Add event naming convention for funnel steps:
  - impression -> click -> start -> complete -> share
- Add drop-off report script (weekly) based on existing analytics events.

## Success Metrics
- Home CTR to service detail: +20%
- Service start rate from card click: +15%
- Completion rate on top 10 services: +10%
- Time-to-publish for new service: under 15 minutes
- Mobile LCP: under 2.5s
- CLS: under 0.1
- JS runtime errors: 0

## Guardrails
- Do not reintroduce CSR-generated core body content.
- Do not add new style tokens/components without reuse validation.
- Do not expand homepage sections beyond 3 primary blocks until metrics justify it.
- Do not use forced wait-flow ad placement before core result content.

## Operational Controls

### Legacy Removal Scope
- Remove duplicate header/footer/sidebar markup in migrated services only.
- Delete service-local CSS only after confirming equivalent token/component coverage.
- Keep rollback branch/tag for each cleanup batch.

### PR Gate (Required)
- Reuse existing token/component/template first.
- If new token/component is required, include reason and approval note.
- Run:
  - `npm run check:service-data`
  - `npm run build`
  - `bash tests/service_platform_scaling.test.sh`

### Astro Pilot Decision
- Go only if all are true:
  - +20% authoring productivity
  - no regression in LCP/CLS
  - no SEO/ad-safety regression
  - no net increase in operational complexity
- Otherwise keep current custom SSG as primary architecture.
