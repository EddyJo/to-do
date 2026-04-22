#!/bin/bash
set -euo pipefail

# =============================================================================
# agent-validate.sh
# 에이전트가 PR 생성 전 반드시 실행하는 검증 스크립트
# 모든 항목 PASS여야 scripts/agent-open-pr.sh 실행 가능
# 참조: docs/AGENT_RULES.md 섹션 6, docs/TEST_STRATEGY.md
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
log_fail() { echo -e "${RED}✗ FAIL${NC}: $1"; ERRORS=$((ERRORS+1)); }
log_warn() { echo -e "${YELLOW}⚠ WARN${NC}: $1"; WARNINGS=$((WARNINGS+1)); }
log_step() { echo -e "\n${YELLOW}▶ $1${NC}"; }

echo "============================================"
echo "  Agent Validation — $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"

# Step 1: ESLint
log_step "Step 1/6: ESLint"
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  if pnpm lint --quiet 2>&1; then
    log_pass "ESLint passed"
  else
    log_fail "ESLint failed. See lint/policies.md"
  fi
else
  log_warn "pnpm or package.json not found. Skipping lint."
fi

# Step 2: TypeScript
log_step "Step 2/6: TypeScript Type Check"
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  if pnpm type-check 2>&1; then
    log_pass "TypeScript type check passed"
  else
    log_fail "TypeScript errors found. Fix before PR."
  fi
else
  log_warn "Skipping type check."
fi

# Step 3: Unit tests
log_step "Step 3/6: Unit Tests"
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  if pnpm test:unit --reporter=dot 2>&1; then
    log_pass "Unit tests passed"
  else
    log_fail "Unit tests failed. See docs/TEST_STRATEGY.md"
  fi
else
  log_warn "Skipping unit tests."
fi

# Step 4: Coverage gate
# Reads: coverage/coverage-summary.json → field: total.lines.pct (number)
log_step "Step 4/6: Coverage Gate (threshold: 80%)"
COVERAGE_REPORT="coverage/coverage-summary.json"
if [ -f "$COVERAGE_REPORT" ]; then
  COVERAGE=$(python3 -c "
import json
with open('$COVERAGE_REPORT') as f:
    d = json.load(f)
print(d['total']['lines']['pct'])
" 2>/dev/null || echo "0")
  if python3 -c "exit(0 if float('${COVERAGE}') >= 80 else 1)" 2>/dev/null; then
    log_pass "Coverage: ${COVERAGE}% (≥80%)"
  else
    log_fail "Coverage ${COVERAGE}% below 80%. Add tests. See docs/TEST_STRATEGY.md"
  fi
else
  log_warn "Coverage report not found. Run: pnpm test:unit --coverage"
fi

# Step 5: Secret detection
log_step "Step 5/6: Secret Detection"
if command -v trufflehog &> /dev/null; then
  if trufflehog git file://. --since-commit HEAD~1 --fail --quiet 2>&1; then
    log_pass "No secrets detected"
  else
    log_fail "CRITICAL: Secrets found. Remove immediately. See docs/SECURITY.md"
  fi
else
  log_warn "trufflehog not installed: brew install trufflehog"
fi

# Step 6: Doc sync check
log_step "Step 6/6: Documentation Sync Check"
if git diff --name-only HEAD~1 2>/dev/null | grep -qE "\.env$"; then
  if git diff --name-only HEAD~1 2>/dev/null | grep -q "\.env\.example"; then
    log_pass ".env.example updated"
  else
    log_fail ".env changed but .env.example not updated."
  fi
fi
if git diff --name-only HEAD~1 2>/dev/null | grep -qE "^apps/|^packages/|^services/"; then
  if git diff --name-only HEAD~1 2>/dev/null | grep -q "^docs/"; then
    log_pass "docs/ updated alongside code"
  else
    log_warn "Code changed without docs/ update. Consider updating relevant docs."
  fi
fi

# Summary
echo ""
echo "============================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC} ($WARNINGS warning(s))"
  echo "  Ready: bash scripts/agent-open-pr.sh"
else
  echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s)${NC}"
  echo "  Fix all errors before creating PR."
  exit 1
fi
echo "============================================"
