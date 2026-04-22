---
last-updated: 2026-04-21
agent-read: on-entropy-cleanup-tasks
---

# Tech Debt Tracker

## 현재 기술부채 목록

| ID | 유형 | 설명 | 심각도 | 발견일 | 상태 |
|----|------|------|--------|--------|------|
| TD-001 | 초기화 | 아직 탐지된 부채 없음 | — | 2026-04-21 | open |

---

## Drift 유형 정의

| 유형 | 설명 | 탐지 방법 | 심각도 |
|------|------|-----------|--------|
| Dead Code | 사용되지 않는 함수/파일 | knip | Medium |
| Type Any Creep | `any` 타입 누적 | TS strict | High |
| Large File | 500줄 초과 파일 증가 | lint | Medium |
| Deprecated Pattern | 구식 패턴 지속 사용 | 커스텀 규칙 | Medium |
| Duplicate Code | 유사 코드 3+ 복사 | jscpd | Low |
| Outdated Deps | 취약점 있는 패키지 | pnpm audit | High |
| Doc Drift | 코드-문서 불일치 | CI doc check | Medium |
| Test Debt | 커버리지 하락 | CI gate | High |
| Stale TODO | 90일+ 된 TODO 주석 | 커스텀 스크립트 | Low |

---

## 품질 점수 히스토리

| 날짜 | 점수 | 등급 | 커버리지 | any 수 | Lint 에러 |
|------|------|------|----------|--------|-----------|
| 2026-04-21 | — | — | —% | — | — |

> 측정: `bash scripts/quality-report.sh`

---

## Golden Rules (절대 위반 금지)

1. 비밀정보를 코드에 직접 기입하지 않는다
2. 테스트 없이 병합하지 않는다
3. `console.log`를 프로덕션 코드에 남기지 않는다
4. route에서 DB에 직접 접근하지 않는다
5. 빨간 CI를 병합하지 않는다
6. `any` 타입을 이유 없이 사용하지 않는다
7. 인프라를 에이전트가 단독으로 변경하지 않는다
8. 데이터 삭제 전 백업을 확인한다
9. 환경별 설정을 하드코딩하지 않는다
10. 아키텍처 변경 시 문서를 동시에 업데이트한다

---

## 부채 추가 절차

에이전트가 기술부채 발견 시:
1. 위 목록에 행 추가 (TD-XXX ID: 마지막 ID + 1)
2. 심각도 High → GitHub Issue도 생성
3. PR 본문에 부채 발견 사실 명시
