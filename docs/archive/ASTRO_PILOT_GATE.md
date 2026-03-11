# Astro Pilot Gate

목적: Astro 파일럿 진행 여부를 주관이 아닌 기준값으로 판정한다.

## Input

- `docs/reports/kpi-baseline.json`
- `docs/reports/astro-pilot-input.json` (수동 입력)

초기 파일 생성:

- `npm run init:astro-pilot`

예시:

```json
{
  "productivityDeltaPercent": 25,
  "seoAdSafetyRegression": false,
  "operationalComplexityIncrease": false
}
```

## Run

- `npm run check:astro-gate`

## Output

- `docs/reports/astro-go-no-go.json`

## Go Conditions

1. 생산성 +20% 이상
2. KPI 전체 PASS (LCP/CLS/console-error 기준)
3. SEO/광고 안정성 회귀 없음
4. 운영 복잡도 증가 없음

하나라도 미달이면 `NO_GO`로 판정한다.
