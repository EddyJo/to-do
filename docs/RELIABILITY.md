---
last-updated: 2026-04-21
agent-read: on-reliability-incidents, before-deploy
---

# Reliability

## SLO 목표

| SLI | SLO | 측정 방법 |
|-----|-----|-----------|
| API 가용성 | 99.9% / 월 | `rate(api_http_requests_total{status!~"5.."}[5m])` |
| API p95 응답시간 | < 200ms | `histogram_quantile(0.95, ...)` |
| 에러율 | < 0.1% | 5xx 비율 |
| FCP | < 2.0s (p75) | Web Vitals |
| LCP | < 2.5s (p75) | Web Vitals |
| AI 메모 처리 | < 5s (p95) | 메모 제출 → Todo 추출 완료 |

---

## 장애 대응 절차

### 1단계: 감지 (자동)
Grafana 알람 → Slack 알림

### 2단계: 초기 진단 (에이전트 지원)
```bash
bash scripts/log-query.sh error "last 30m"
```
메트릭 확인: `dashboards/overview.json` 참조

### 3단계: 근본 원인 분석
`docs/OBSERVABILITY.md` → 성능 진단 절차 참조

### 4단계: 수정 및 배포
긴급 수정: `hotfix/` 브랜치 → PR → 스테이징 → **인간 승인** → 프로덕션

### 5단계: 사후 검토
- `docs/adr/` 에 결정 기록
- `docs/TECH_DEBT_TRACKER.md` 업데이트

---

## 배포 전 체크리스트

- [ ] 스테이징 E2E 테스트 통과
- [ ] p95 응답시간 < 200ms 확인
- [ ] 에러율 정상 범위 확인
- [ ] 롤백 계획 준비됨
- [ ] 담당자 대기 (배포 후 30분)
- [ ] AI 서비스 연결 상태 확인

---

## 롤백 절차 (인간 실행)

```bash
kubectl rollout undo deployment/api -n production
kubectl rollout undo deployment/web -n production
# DB 마이그레이션 롤백 필요 시:
pnpm prisma migrate resolve --rolled-back <migration-name>
```

---

## Todo 앱 특수 신뢰성 원칙

- **AI 장애 격리**: AI 서비스 장애 시 Todo 추출만 비활성화, 수동 입력은 항상 가능
- **데이터 우선 저장**: 메모는 AI 처리 전에 먼저 DB 저장 (유실 방지)
- **오프라인 지원**: 로컬 캐시로 읽기/쓰기 가능, 온라인 복귀 시 동기화
