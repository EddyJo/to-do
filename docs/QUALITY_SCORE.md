---
last-updated: 2026-04-21
agent-read: on-quality-tasks, weekly-entropy-run
---

# Quality Score System

## 현재 점수
| 항목 | 값 | 최근 측정일 |
|------|-----|-------------|
| 전체 점수 | — | 미측정 |
| 테스트 커버리지 | —% | 미측정 |
| TS any 사용 수 | — | 미측정 |
| Lint 에러 수 | — | 미측정 |
| 문서 동기화 | — | 미측정 |
| 의존성 취약점 (critical) | — | 미측정 |

> 측정 명령: `bash scripts/quality-report.sh`
> 결과 위치: `reports/quality/YYYY-MM-DD.json`

---

## 점수 계산 공식

```
총점(100점) =
  테스트 커버리지 (30점)
+ TS 타입 안전성  (20점)
+ Lint 에러       (20점)
+ 문서 동기화     (15점)
+ 보안 취약점     (15점)

계산:
  커버리지  = min(30, coverage_pct × 0.3)
  TS 안전성 = max(0,  20 - any_count × 2)
  Lint      = max(0,  20 - lint_error_count × 2)
  문서      = doc_check_pass ? 15 : 0
  보안      = max(0,  15 - critical_vuln_count × 5 - high_vuln_count × 2)
```

출력 JSON 스키마 (`reports/quality/YYYY-MM-DD.json`):
```json
{
  "date": "YYYY-MM-DD",
  "score": 0,
  "grade": "A|B|C|D|F",
  "coverage_pct": 0.0,
  "any_count": 0,
  "lint_error_count": 0,
  "doc_check_pass": true,
  "critical_vuln_count": 0,
  "high_vuln_count": 0
}
```

---

## 등급 및 조치

| 등급 | 점수 | 조치 |
|------|------|------|
| A | 90~100 | 자동 병합 허용 |
| B | 80~89 | 정상 운영 |
| C | 70~79 | 경고 — 다음 스프린트 내 개선 계획 필수 |
| D | 60~69 | 신규 기능 PR 차단, 품질 개선 우선 |
| F | <60 | 모든 PR 차단, 즉시 대응 |

---

## 점수 히스토리

| 날짜 | 점수 | 등급 | 주요 변화 |
|------|------|------|-----------|
| 2026-04-21 | — | — | 시스템 초기화 |

---

## 자동 측정 주기

- **PR마다**: lint + type-check + coverage (CI 게이트)
- **주 1회** (월요일 09:00 KST): 전체 점수 + 엔트로피 스캔 (GitHub Actions cron)
- 결과는 `docs/TECH_DEBT_TRACKER.md` 히스토리에 반영
