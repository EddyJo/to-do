---
last-updated: 2026-04-21
agent-read: before-any-ui-or-component-change
---

# Frontend Guide

## 컴포넌트 설계 원칙

- 컴포넌트 파일: `PascalCase.tsx`
- 훅 파일: `use-kebab-case.ts`
- 상태는 최대한 아래로 (state down, events up)
- `data-testid` 속성 필수 (E2E 테스트 접근용)

---

## 디렉터리 구조 (apps/web/src)

```
components/
  ui/           ← 순수 UI 컴포넌트 (비즈니스 로직 없음)
  features/     ← 기능별 컴포넌트 (Todo, Memo, Auth 등)
hooks/          ← 커스텀 훅
pages/          ← 라우트별 페이지 컴포넌트
stores/         ← 전역 상태 (Zustand)
lib/            ← API 클라이언트, 유틸리티
types/          ← 프론트엔드 전용 타입
```

---

## 핵심 UI 규칙

### Todo 우선순위 표시
```tsx
// avoidance_score가 높을수록 먼저 표시, 색상으로 강도 표현
<TodoItem
  data-testid="todo-item"
  avoidanceScore={todo.avoidance_score}
  className={todo.avoidance_score > 7 ? 'urgent' : 'normal'}
/>
```

### AI 추출 결과는 항상 draft 상태로 렌더링
```tsx
// 사용자 승인 전까지 실제 Todo 목록에 포함하지 않음
<ExtractedTodoPreview
  data-testid="extracted-todo-list"
  todos={extractedTodos}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

---

## 상태 관리

- 서버 상태: TanStack Query (캐시, 동기화)
- 클라이언트 UI 상태: Zustand
- 폼 상태: React Hook Form + zod resolver

```typescript
// stores/todo-store.ts — 서버 데이터는 여기 두지 않음
interface TodoStore {
  selectedListId: string | null;
  setSelectedList: (id: string) => void;
}
```

---

## 성능 기준

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| FCP | < 2.0s | Web Vitals |
| LCP | < 2.5s | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| 번들 크기 | < 300kb gzip | Vite bundle analyzer |

---

## 에러 경계

```tsx
// 주요 기능 컴포넌트는 ErrorBoundary로 감싸기
<ErrorBoundary fallback={<FeatureError feature="Todo" />}>
  <TodoList />
</ErrorBoundary>
```

AI 서비스 에러 시: Todo 추출 UI만 비활성화, 수동 입력은 항상 가능

---

## 접근성 (a11y)

- 모든 인터랙티브 요소에 `aria-label` 또는 시각적 레이블
- 키보드 탐색 지원 (Tab, Enter, Escape)
- 색상만으로 정보 전달 금지 (아이콘/텍스트 병행)
