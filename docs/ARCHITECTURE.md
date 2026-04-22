---
last-updated: 2026-04-21
owner: engineering-team
agent-read: required-before-any-architecture-change
---

# Architecture

## 목적
시스템의 전체 구조와 레이어 경계를 정의한다.
에이전트는 아키텍처 관련 작업 전 반드시 이 문서를 읽어야 한다.

---

## 시스템 개요

```
[Browser / Mobile]
       ↓ HTTPS
[React SPA — apps/web]
       ↓ REST API / WebSocket
[Node.js API — apps/api]
       ↓
[PostgreSQL]    [Redis (캐시/세션)]
       ↓
[AI Service — services/ai-processor]  ← 메모→액션 변환 (Python/LLM)
```

---

## 레이어 구조 (apps/api)

```
routes/         HTTP 핸들러, 요청 유효성 검사, 응답 직렬화
   ↓ (단방향)
services/       비즈니스 로직, 도메인 규칙, AI 오케스트레이션
   ↓
repositories/   DB 접근, 쿼리 추상화 (Prisma ORM)
   ↓
lib/            공통 유틸, 외부 SDK 래퍼, 로거, 에러 타입
```

**레이어 위반 절대 금지:**
- routes → repositories 직접 접근 ❌
- services → routes 역방향 참조 ❌
- 순환 의존성 ❌

---

## 도메인 모델

```
User
 └── TodoList (여러 개 보유 가능)
      └── Todo (항목)
           ├── priority: number (낮을수록 우선)
           ├── avoidance_score: number (AI 산출, 0~10)
           ├── source: 'manual' | 'ai-extracted' | 'memo'
           └── status: 'pending' | 'in_progress' | 'done' | 'snoozed'

Memo
 ├── content: string
 ├── extracted_todos: Todo[]  ← AI 추출 결과
 └── user_approved: boolean   ← 사용자 최종 승인 여부 (PRD 원칙 3)
```

---

## 패키지 의존성 방향

```
apps/web      → packages/shared-types, packages/ui-components
apps/api      → packages/shared-types, packages/utils
services/ai   → packages/shared-types
packages/ui   → packages/shared-types
packages/utils → (외부 패키지만)
```

순환 의존성 없음. 항상 단방향 하향.

---

## 주요 기술 결정 (ADR)

| 결정 | 근거 | ADR |
|------|------|-----|
| 모노레포 (pnpm workspaces) | 공유 타입, 에이전트 전체 컨텍스트 가시성 | docs/adr/ADR-001-monorepo.md |
| PostgreSQL + Prisma | 관계형 + 타입 안전 ORM | docs/adr/ADR-002-database.md |
| OpenTelemetry | 벤더 중립 관측 | docs/adr/ADR-003-observability.md |
| AI 추출은 항상 draft → 사용자 승인 | 사용자 통제권 보장 (PRD 원칙 3) | docs/adr/ADR-004-ai-approval.md |

---

## 외부 의존성 목록

| 패키지 | 목적 | 버전 | 추가일 |
|--------|------|------|--------|
| express | HTTP 서버 | 4.x | 2026-04-21 |
| prisma | ORM | 5.x | 2026-04-21 |
| react | UI 프레임워크 | 18.x | 2026-04-21 |
| openai | AI API 클라이언트 | 4.x | 2026-04-21 |
| zod | 런타임 유효성 검사 | 3.x | 2026-04-21 |
| winston | 구조화 로깅 | 3.x | 2026-04-21 |

> 새 외부 패키지 추가 시 이 표 업데이트 + ADR 작성 필수

---

## 인간 승인 없이 변경 불가

- 레이어 구조 변경
- 데이터베이스 엔진 변경
- 인증/인가 방식 변경
- AI 모델 공급자 변경
- 새로운 결제/이메일 외부 서비스 통합

---

## 테스트 구조

### 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 테스트 러너 (Next.js와 호환, 빠른 실행) |
| @testing-library/react | 컴포넌트 렌더링/인터랙션 테스트 |
| @testing-library/jest-dom | DOM matcher (`toBeInTheDocument` 등) |
| jsdom | 브라우저 환경 시뮬레이션 |

### 테스트 파일 위치

```
apps/web/
└── __tests__/
    ├── lib/
    │   ├── utils.test.ts          # 순수 함수 (reluctanceColor, statusLabel 등)
    │   ├── avoidance.test.ts      # avoidance_score 계산 로직
    │   └── db/
    │       ├── todos.test.ts      # DB 쿼리 (Supabase mocked)
    │       ├── tasks.test.ts
    │       └── suggestions.test.ts
    └── components/
        ├── TodoCard.test.tsx      # 렌더링 + 인터랙션
        ├── AISuggestionCard.test.tsx
        └── NoteEditor.test.tsx
```

### TDD 흐름 (필수)

```
1. 실패하는 테스트 작성 → npm test (RED 확인)
2. 최소 구현 코드 작성 → npm test (GREEN 확인)
3. 리팩터링 → npm test (GREEN 유지)
4. scripts/agent-validate.sh 실행
```

### 커버리지 기준

- Lines: ≥ 80%
- Functions: ≥ 80%
- Branches: ≥ 70%

측정 명령: `cd apps/web && npm run test:coverage`

### Supabase 모킹 패턴

```typescript
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  },
}))
```

### 외부 의존성 (테스트용 추가)

| 패키지 | 목적 | 버전 | 추가일 |
|--------|------|------|--------|
| vitest | 테스트 러너 | 4.x | 2026-04-22 |
| @testing-library/react | 컴포넌트 테스트 | 16.x | 2026-04-22 |
| @testing-library/jest-dom | DOM matchers | 6.x | 2026-04-22 |
| jsdom | 브라우저 환경 | 26.x | 2026-04-22 |

