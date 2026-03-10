# Ops Workflow

운영 지표 측정, 릴리즈 관리, 정합성 점검에 사용하는 명령 모음.

---

## 1. KPI 측정

```bash
npm run build
python3 -m http.server 8080 --directory fe/public
npm run measure:kpi
```

Output: `reports/kpi-baseline.json`, `reports/kpi-baseline.md`

목표:
- Mobile LCP < 2500ms
- CLS < 0.1
- Console errors: 0

---

## 2. 퍼널 KPI (Phase B/C/D 동기화)

```bash
# Phase B 입력
npm run init:phaseb-kpi
npm run set:phaseb-kpi -- --service <id> --b-card <n> --b-start <n> --b-complete <n> --c-card <n> --c-start <n> --c-complete <n>
npm run report:phaseb-kpi
npm run sync:phaseb-checklist

# Phase C / Astro gate
npm run check:astro-gate
npm run set:astro-pilot-input -- --productivity <percent> --seoRegression <true|false> --opsComplexityIncrease <true|false>
npm run sync:phasec-checklist

# Phase D 운영 수치
npm run init:phase-d-ops
npm run set:phase-d-ops -- --leadTime <min> --failureRate <percent> --monthlyRelease <count>
npm run report:phase-d-ops
npm run sync:phase-d-checklist
```

---

## 3. 릴리즈 관리

릴리즈 로그 추가:

```bash
npm run release:add -- --date 2026-02-21 --service <id> --type new_service --status done
npm run report:cadence
```

기준: 최근 7일 `new_service + done`
- `1~2`: PASS
- `0`: WARN (릴리즈 부족)
- `3+`: WARN_OVER (QA 리스크 점검 필요)

Output: `reports/release-cadence-report.json`

---

## 4. 운영 정합성 & 리포트

```bash
# 전체 동기화
npm run ops:sync

# 무결성 점검
npm run ops:doctor
npm run ops:doctor:strict   # WARN도 실패 처리

# 세부 리포트
npm run report:ops-readiness
npm run report:next-actions
npm run report:ops-input-health
npm run report:ops-guide
npm run report:ops-dashboard
npm run report:target-metrics

# 이력 누적 / 추세
npm run log:ops-history
npm run report:ops-trend

# 배치 입력
npm run init:ops-batch
# reports/ops-metrics-batch.json 입력 후
npm run apply:ops-batch

# 테스트
npm run test:ops-reporting
```
