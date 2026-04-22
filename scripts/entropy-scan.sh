#!/bin/bash
set -euo pipefail

# =============================================================================
# entropy-scan.sh
# 코드베이스 엔트로피/드리프트 탐지
# 사용법: bash scripts/entropy-scan.sh [stale-todos|dead-code|large-files|all]
# 참조: docs/TECH_DEBT_TRACKER.md
# =============================================================================

MODE="${1:-all}"
ISSUES_FOUND=0

log_issue() { echo "  ISSUE: $1"; ISSUES_FOUND=$((ISSUES_FOUND+1)); }
log_ok()    { echo "  OK: $1"; }

echo "============================================"
echo "  Entropy Scan — $(date '+%Y-%m-%d') [mode: ${MODE}]"
echo "============================================"

scan_stale_todos() {
  echo ""; echo "▶ Stale TODO check (>90 days)"
  CUTOFF=$(date -d '90 days ago' '+%Y-%m-%d' 2>/dev/null \
    || date -v-90d '+%Y-%m-%d' 2>/dev/null || echo "2026-01-01")
  TODO_FILES=$(grep -rl "TODO\|FIXME\|HACK\|XXX" apps/ packages/ services/ 2>/dev/null || true)
  if [ -z "$TODO_FILES" ]; then
    log_ok "No TODO/FIXME found"
  else
    echo "$TODO_FILES" | while read -r file; do
      LAST=$(git log -1 --format="%ai" -- "$file" 2>/dev/null | cut -d' ' -f1 || echo "unknown")
      [ "$LAST" != "unknown" ] && [ "$LAST" \< "$CUTOFF" ] && log_issue "Stale TODOs: $file (last: $LAST)"
    done
  fi
}

scan_dead_code() {
  echo ""; echo "▶ Dead code check (knip)"
  if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
    pnpm knip --reporter compact 2>/dev/null && log_ok "No dead code" || log_issue "Dead code detected — run pnpm knip"
  else
    echo "  Skipping (pnpm not available)"
  fi
}

scan_large_files() {
  echo ""; echo "▶ Large file check (>500 lines)"
  find apps/ packages/ services/ \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" \) 2>/dev/null \
  | while read -r file; do
    LINES=$(wc -l < "$file" 2>/dev/null || echo "0")
    [ "$LINES" -gt 500 ] && log_issue "${file}: ${LINES} lines"
  done || true
  echo "  Large file scan complete"
}

scan_outdated_deps() {
  echo ""; echo "▶ Outdated dependencies"
  if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
    COUNT=$(pnpm outdated 2>/dev/null | tail -n +2 | wc -l | tr -d ' ' || echo "0")
    [ "$COUNT" -gt 0 ] && log_issue "${COUNT} outdated package(s) — run pnpm outdated" || log_ok "All deps up to date"
  else
    echo "  Skipping (pnpm not available)"
  fi
}

case "$MODE" in
  stale-todos)  scan_stale_todos ;;
  dead-code)    scan_dead_code ;;
  large-files)  scan_large_files ;;
  outdated)     scan_outdated_deps ;;
  all)
    scan_stale_todos
    scan_dead_code
    scan_large_files
    scan_outdated_deps
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Valid: stale-todos|dead-code|large-files|outdated|all"
    exit 1
    ;;
esac

echo ""
echo "============================================"
echo "  Issues found: ${ISSUES_FOUND}"
[ "$ISSUES_FOUND" -gt 0 ] && echo "  Log issues in docs/TECH_DEBT_TRACKER.md"
echo "============================================"
[ "$ISSUES_FOUND" -gt 0 ] && exit 1
exit 0
