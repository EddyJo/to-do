# Lint & Static Analysis Policies

> 에이전트는 코드 작성 전 이 문서를 참조해야 한다.
> 모든 error 규칙은 CI에서 자동으로 강제된다.

---

## ESLint 규칙

### 아키텍처 규칙 (severity: error — 위반 시 PR 차단)

| 커스텀 규칙 파일 | 설명 |
|-----------------|------|
| `lint/eslint/custom-rules/no-direct-db-in-route.js` | routes/에서 prisma/knex 직접 import 금지 |
| `lint/eslint/custom-rules/require-structured-log.js` | console.log 금지, logger 사용 강제 |
| `lint/eslint/custom-rules/no-sensitive-in-log.js` | 로그에 password/token/secret 출력 금지 |

### TypeScript 규칙 (severity: error)

| 규칙 | 설명 |
|------|------|
| `@typescript-eslint/no-explicit-any` | any 타입 금지 (불가피 시 이유 주석 필수) |
| `complexity: ["error", 10]` | cyclomatic complexity 10 초과 금지 |
| `max-lines: ["error", 500]` | 단일 파일 500줄 초과 금지 |
| `no-console` | console.* 사용 금지 |
| `no-eval` | eval() 금지 |

### 경고 규칙 (severity: warn)

| 규칙 | 설명 |
|------|------|
| `@typescript-eslint/no-unused-vars` | 미사용 변수 |
| `prefer-const` | const 사용 권장 |

---

## TypeScript Strict Mode (`tsconfig.base.json`)

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

---

## 예외 처리 절차

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Reason: Third-party library returns untyped response
const data = thirdPartyLib.getData() as any;
```

- 파일 전체 비활성화 → PR 리뷰 별도 승인 필요
- `.eslintignore` 새 항목 추가 → `docs/ARCHITECTURE.md` 업데이트 필수

---

## CI 게이트 요약

| 검사 | 실행 시점 | 실패 시 |
|------|-----------|---------|
| ESLint (error) | 모든 PR | PR 차단 |
| TypeScript | 모든 PR | PR 차단 |
| Coverage ≥80% | 모든 PR | PR 차단 |
| Secret detection | 모든 PR | PR 차단 |
| Doc sync | 모든 PR | 경고만 |
| Entropy scan | 주 1회 cron | 이슈 생성 |
