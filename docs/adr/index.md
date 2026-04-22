# Architecture Decision Records — Index

> ADR은 중요한 아키텍처 결정을 기록한다. 결정을 번복해도 삭제하지 않고 상태만 변경한다.

## ADR 목록

| ID | 제목 | 상태 | 날짜 |
|----|------|------|------|
| ADR-001 | 모노레포 (pnpm workspaces) | accepted | 2026-04-21 |
| ADR-002 | PostgreSQL + Prisma ORM | accepted | 2026-04-21 |
| ADR-003 | OpenTelemetry 관측 스택 | accepted | 2026-04-21 |
| ADR-004 | AI 추출 결과 사용자 승인 필수 | accepted | 2026-04-21 |

## 상태 정의

| 상태 | 설명 |
|------|------|
| proposed | 제안됨, 미결정 |
| accepted | 채택됨 |
| deprecated | 더 이상 권장하지 않음 |
| superseded | 다른 ADR로 대체됨 |

## ADR 작성 절차

1. `template.md` 복사 → `ADR-XXX-제목.md`
2. 컨텍스트, 결정, 결과 섹션 작성
3. 이 인덱스에 행 추가
4. `docs/ARCHITECTURE.md` 관련 섹션 업데이트
