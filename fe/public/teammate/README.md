# 운영 패널

`/teammate/`는 홈 레퍼런스/배너 운영 명령을 생성하는 패널입니다.

## 제공 기능

- 레퍼런스 프리셋 선택: `testmoa`, `poomang`, `banggooso`
- 배너 모드 선택: `auto`, `manual`
- 배너 문구(배지/CTA) 설정
- 배너 1/2 서비스 선택
- 서비스 셸 기본 스킨(`A/B`) 설정
- 전체 서비스 스킨 일괄 적용(`A/B`, per-service override 정리)
- 실행 명령 자동 생성/복사

## 사용 순서

1. `/teammate/` 페이지에서 옵션을 선택합니다.
2. 생성된 `npm run settings:update -- ...` 명령을 복사합니다.
3. 터미널에서 명령 실행 후 `npm run build:pages`를 실행합니다.
