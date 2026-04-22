---
last-updated: 2026-04-21
agent-read: before-any-api-or-service-change
---

# Backend Guide

## 레이어 구조 재확인

```
routes/ → services/ → repositories/ → lib/
```
역방향 의존성 절대 금지. 상세: `docs/ARCHITECTURE.md`

---

## API 설계 원칙

- REST 엔드포인트: `/api/v1/{resource}`
- 요청/응답은 zod 스키마로 반드시 검증
- 에러 응답 형식 통일:

```json
{
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "Todo with id 'abc' not found",
    "statusCode": 404
  }
}
```

---

## 에러 처리

`lib/errors.ts`의 `AppError` 사용 필수:

```typescript
// ✅ 올바른 에러 처리
throw new AppError('TODO_NOT_FOUND', 'Todo not found', 404);

// ❌ 금지: 원시 Error 사용
throw new Error('not found');
```

---

## 로깅

```typescript
// ✅ 올바른 로깅
logger.info({ event: 'todo.created', userId, todoId }, 'Todo created');

// ❌ 금지
console.log('Todo created');
```

---

## Database Patterns

### N+1 쿼리 방지

```typescript
// ❌ N+1
const todos = await prisma.todo.findMany();
for (const todo of todos) {
  const list = await prisma.todoList.findUnique({ where: { id: todo.listId } });
}

// ✅ include로 한 번에
const todos = await prisma.todo.findMany({
  include: { todoList: true }
});
```

### 페이지네이션

```typescript
// cursor-based 사용 (large table에서 offset 금지)
const todos = await prisma.todo.findMany({
  take: 20,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { avoidance_score: 'desc' }
});
```

---

## AI 서비스 연동 원칙

```typescript
// services/ai-extraction.service.ts
async extractTodos(memo: Memo): Promise<ExtractedTodo[]> {
  // 1. 메모를 DB에 먼저 저장 (AI 실패해도 유실 없음)
  // 2. AI API 호출 (타임아웃: 10초)
  // 3. zod로 응답 검증
  // 4. draft 상태로 반환 (user_approved: false)
  // 5. 에러 시 빈 배열 반환 (서비스 계속 작동)
}
```

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/v1/auth/register | 회원가입 |
| POST | /api/v1/auth/login | 로그인 |
| GET | /api/v1/todos | Todo 목록 (avoidance_score 정렬) |
| POST | /api/v1/todos | Todo 생성 |
| PATCH | /api/v1/todos/:id | Todo 수정 |
| DELETE | /api/v1/todos/:id | Todo 삭제 |
| POST | /api/v1/memos | 메모 저장 + AI 추출 트리거 |
| POST | /api/v1/memos/:id/approve | AI 추출 결과 사용자 승인 |

> 새 엔드포인트 추가 시 이 표 업데이트 필수
