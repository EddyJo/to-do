---
last-updated: 2026-04-21
agent-read: before-writing-any-test
---

# Test Strategy

## 테스트 피라미드

```
        /\
       /E2E\          ← 핵심 사용자 여정 20개 이하 (Playwright)
      /------\
     /Integr- \       ← API 계약, DB 연동, AI 서비스 모킹
    /  ation   \
   /------------\
  /  Unit Tests  \    ← 비즈니스 로직, 유틸리티, 컴포넌트
 /________________\
```

---

## 커버리지 기준

- **전체**: 80% 이상 (CI 게이트 — 미달 시 PR 차단)
- **신규 함수**: 테스트 파일 필수
- **버그 수정 시**: 버그 재현 테스트 먼저 작성 후 수정 (TDD)

---

## Unit Test 규칙

- 위치: 소스 파일과 같은 디렉터리, `*.test.ts`
- 프레임워크: Vitest (프론트엔드), Jest (백엔드)
- 외부 서비스만 mock. DB는 테스트 컨테이너 사용

```typescript
describe('TodoService.rankByAvoidance', () => {
  it('should rank higher avoidance_score todos first', () => {
    const todos = [
      { id: '1', avoidance_score: 3 },
      { id: '2', avoidance_score: 9 },
      { id: '3', avoidance_score: 6 },
    ];
    const ranked = TodoService.rankByAvoidance(todos);
    expect(ranked[0].id).toBe('2');
    expect(ranked[1].id).toBe('3');
  });
});
```

---

## Integration Test 규칙

- 실제 DB 사용 (`docker-compose.test.yml`)
- 각 테스트 전후 DB 초기화
- 위치: `apps/api/tests/integration/`

```typescript
describe('POST /api/v1/todos', () => {
  it('should create todo and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: '세금 신고하기', priority: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: '세금 신고하기' });
  });
});
```

---

## E2E Test 규칙 (Playwright)

- 위치: `apps/web/tests/e2e/`
- 대상: 핵심 사용자 여정만

### 필수 E2E 여정 목록
1. 회원가입 → 로그인 → 대시보드 진입
2. Todo 수동 생성 → 우선순위 변경 → 완료 처리
3. 메모 작성 → AI Todo 추출 → 사용자 승인 → Todo 반영
4. "가장 하기 싫은 일" 우선 정렬 동작 확인

```typescript
test('memo to todo extraction requires user approval', async ({ page }) => {
  await page.goto('/memos/new');
  await page.fill('[data-testid=memo-content]', '다음 주까지 세금 신고 해야 함');
  await page.click('[data-testid=extract-todos]');
  await expect(page.locator('[data-testid=extracted-todo-list]')).toBeVisible();
  // AI 결과는 draft — 승인 전 실제 Todo 목록에 없어야 함
  await expect(page.locator('[data-testid=todo-item]')).toHaveCount(0);
  await page.click('[data-testid=approve-all]');
  await expect(page.locator('[data-testid=todo-item]')).toHaveCount(1);
});
```

---

## Flaky Test 대응

1. 첫 발견 시: `test.skip` + `@flaky` 주석으로 격리
2. 3회 재실행 후도 불안정: 삭제 후 재작성
3. 근본 원인 없이 `retries` 증가 금지

---

## AI 서비스 테스트 전략

| 레벨 | 전략 |
|------|------|
| Unit | AI 응답을 fixture JSON으로 mock |
| Integration | msw로 AI 서비스 모킹 서버 사용 |
| E2E | 결정적(deterministic) 테스트 엔드포인트 사용 |
| 실제 LLM 호출 | `@expensive` 태그, CI 제외, 수동 실행만 |
