# AdSense Incident Rollback Log

목적: 광고 정책 리스크 발견 시 즉시 롤백 이력을 남긴다.

## Immediate Rollback Rule

1. 위험 배포 식별 즉시 광고 변경 코드 revert 또는 비활성화.
2. `docs/ADSENSE_POLICY_GUARDRAILS.md` 기준으로 위반 가능성 확인.
3. 영향 범위(서비스/슬롯) 기록 후 재배포.

## Entry Template

```md
## YYYY-MM-DD HH:mm - <incident-id>
- Service: <service-id>
- Risk: 정책 리스크 내용
- Detection: 발견 경로 (QA/모니터링/리뷰)
- Action: 수행한 롤백 조치
- Commit/PR: <id>
- Result: 재배포/검증 결과
```

## Entries

