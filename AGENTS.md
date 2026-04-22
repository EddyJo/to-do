# AGENTS.md — Agent Map

> 이 파일은 지도다. 백과사전이 아니다. 상세 내용은 반드시 `docs/`를 읽어라.
> **이 파일은 100줄을 초과하지 않는다.**

## 제품 개요
AI 기반 Todo 앱 — "가장 하기 싫은 일을 가장 먼저" + "메모→액션 자동 변환"
스펙 전문: `todo_app_prd.md` | 아키텍처: `docs/ARCHITECTURE.md`
리포지토리: https://github.com/EddyJo/to-do | Remote: `git@github.com:EddyJo/to-do.git`

## 작업 시작 전 필독 순서
1. 이 파일 (AGENTS.md)
2. 작업 유형에 맞는 docs/ 문서:
   - 기능 구현 → `docs/ARCHITECTURE.md` + `docs/BACKEND.md` 또는 `docs/FRONTEND.md`
   - 버그 수정 → `docs/OBSERVABILITY.md` (로그/트레이스 먼저)
   - 테스트 작성 → `docs/TEST_STRATEGY.md`
   - 보안 관련 → `docs/SECURITY.md`
   - 새 기능 계획 → `docs/exec-plans/template.md` 기반 계획 먼저
3. 관련 exec-plan: `docs/exec-plans/PLAN-XXX.md`

## 절대 금지사항
- `infrastructure/` 수정 금지
- `.github/workflows/` 수정 금지 (명시적 지시 없는 한)
- `console.log` 금지 → `logger.info/warn/error` 사용
- `any` 타입 금지 (불가피 시 이유 주석 필수)
- 비밀정보 하드코딩 금지 → `.env.example` 참조
- 프로덕션 DB 직접 접근 금지
- `main` 브랜치 직접 push 금지
- 테스트 없이 PR 생성 금지
- 구현 전 테스트 작성 없이 코드 변경 금지 (TDD 필수)

## 작업 절차
```
1. 관련 docs/ 읽기
2. 실패하는 테스트 작성 (TDD — 구현 전 필수)
   cd apps/web && npm test  ← RED 확인
3. 코드 구현 (테스트를 통과하는 최소 변경)
   npm test  ← GREEN 확인
4. scripts/agent-validate.sh 실행 (반드시 통과)
5. scripts/agent-open-pr.sh 실행
6. exec-plan 상태 업데이트
```

## PR 원칙
- 제목: `feat|fix|chore|docs|refactor|test: 간결한 설명`
- 변경 파일 ≤10개, diff ≤400줄
- 관련 Issue 번호 연결 필수
- docs/ 변경 필요 시 같은 PR에 포함

## 문서 업데이트 의무
| 변경 유형 | 업데이트 문서 |
|-----------|---------------|
| 아키텍처 변경 | `docs/ARCHITECTURE.md` |
| 새 환경변수 | `.env.example` |
| 아키텍처 결정 | `docs/adr/ADR-XXX.md` |
| exec-plan 완료 | `docs/exec-plans/index.md` 상태 갱신 |
| 기술부채 발견 | `docs/TECH_DEBT_TRACKER.md` |

## 상세 규칙 위치
- 에이전트 행동 규칙: `docs/AGENT_RULES.md`
- 품질 기준 및 점수: `docs/QUALITY_SCORE.md`
- 린트 정책: `lint/policies.md`
