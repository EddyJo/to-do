---
last-updated: 2026-04-21
agent-read: before-diagnosing-performance-or-bugs
---

# Observability

## 표준 로그 필드

모든 로그에 반드시 포함:

```json
{
  "timestamp": "2026-04-21T10:00:00.000Z",
  "level": "info",
  "service": "api",
  "version": "1.0.0",
  "environment": "production",
  "traceId": "abc123",
  "spanId": "def456",
  "requestId": "req-789",
  "userId": "usr-[hashed]",
  "method": "POST",
  "path": "/api/v1/todos",
  "statusCode": 201,
  "durationMs": 45,
  "message": "Todo created"
}
```

**로그 금지 필드** (절대 포함 금지):
- `password`, `token`, `secret`, `apiKey`
- `email` (해시값으로 대체)
- AI 프롬프트 전체 내용 (요약만 허용)

---

## 표준 메트릭 명명 규칙

```
{service}_{subsystem}_{unit}_{aggregation}

api_http_request_duration_seconds   (histogram)
api_http_requests_total             (counter)
api_db_query_duration_seconds       (histogram)
api_error_total                     (counter, label: error_type)
api_ai_extraction_duration_seconds  (histogram)
api_ai_extraction_total             (counter, label: status=success|failed)
web_fcp_seconds                     (histogram)
web_lcp_seconds                     (histogram)
```

---

## 핵심 SLI/SLO 쿼리

**API p95 응답시간 (PromQL):**
```promql
histogram_quantile(0.95,
  sum(rate(api_http_request_duration_seconds_bucket[5m])) by (le, path)
)
```

**에러율 (PromQL):**
```promql
sum(rate(api_http_requests_total{status=~"5.."}[5m]))
/
sum(rate(api_http_requests_total[5m]))
```

**AI 추출 성공률 (PromQL):**
```promql
sum(rate(api_ai_extraction_total{status="success"}[5m]))
/
sum(rate(api_ai_extraction_total[5m]))
```

**최근 에러 로그 (LogQL):**
```logql
{service="api", environment="production"}
  | json
  | level="error"
  | line_format "{{.timestamp}} [{{.requestId}}] {{.message}}"
```

**느린 DB 쿼리 트레이스 (TraceQL):**
```traceql
{.db.system="postgresql" && duration > 100ms}
```

---

## 에이전트 성능 진단 절차

```
1. 증상 확인
   bash scripts/log-query.sh error "last 1h"

2. 느린 엔드포인트 특정
   PromQL에서 path별 p95 비교 → 200ms 초과 path 추출

3. 트레이스 분석
   Loki에서 traceId 추출 → Tempo에서 조회
   가장 오래 걸린 span 확인 (DB? 외부 API? AI?)

4. 원인 분류 및 대응
   DB N+1    → docs/BACKEND.md#database-patterns 참조
   계산량    → 비동기/워커 분리 검토
   AI 지연   → 타임아웃 설정, 캐시 전략 검토

5. 수정 후 검증
   동일 PromQL로 개선 수치 확인
   스테이징에서 부하테스트 실행
```

---

## 에이전트 UI 버그 재현 절차

```
1. GitHub Issue에서 재현 단계, 브라우저, URL 확인
2. Loki에서 해당 시간대 프론트엔드 에러 조회
3. Playwright로 재현 테스트 작성 → npx playwright test --debug
4. 수정 후 재현 테스트 통과 확인 → E2E 스위트에 영구 추가
```

---

## 대시보드 위치

| 대시보드 | 파일 | 목적 |
|----------|------|------|
| 전체 현황 | `dashboards/overview.json` | API 상태, 에러율, 응답시간 |
| SLO | `dashboards/slo.json` | SLO 준수 현황 |
| AI 서비스 | `dashboards/ai-service.json` | 추출 성공률, 처리 시간 |
| 에이전트 활동 | `dashboards/agent-activity.json` | 에이전트 도구 호출 감사 |
