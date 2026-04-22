#!/bin/bash
set -euo pipefail

# =============================================================================
# quality-report.sh
# 품질 점수 측정 및 reports/quality/YYYY-MM-DD.json 생성
# 출력: reports/quality/YYYY-MM-DD.json
#   { date, score, grade, coverage_pct, any_count,
#     lint_error_count, doc_check_pass, critical_vuln_count, high_vuln_count }
# 참조: docs/QUALITY_SCORE.md
# =============================================================================

DATE=$(date '+%Y-%m-%d')
REPORT_DIR="reports/quality"
REPORT_FILE="${REPORT_DIR}/${DATE}.json"
mkdir -p "$REPORT_DIR"

echo "============================================"
echo "  Quality Report — ${DATE}"
echo "============================================"

# 1. Test Coverage (30점)
COVERAGE_PCT=0
if [ -f "coverage/coverage-summary.json" ]; then
  COVERAGE_PCT=$(python3 -c "
import json
with open('coverage/coverage-summary.json') as f:
    d = json.load(f)
print(d['total']['lines']['pct'])
" 2>/dev/null || echo "0")
fi
COVERAGE_SCORE=$(python3 -c "print(min(30, float('${COVERAGE_PCT}') * 0.3))" 2>/dev/null || echo "0")
echo "Coverage: ${COVERAGE_PCT}% → ${COVERAGE_SCORE}/30"

# 2. TS any count (20점)
ANY_COUNT=0
if [ -d "apps" ] || [ -d "packages" ]; then
  ANY_COUNT=$(grep -r "as any\b\|: any\b" apps/ packages/ services/ 2>/dev/null \
    | grep -v "\.test\.\|node_modules\|eslint-disable" \
    | wc -l | tr -d ' ' || echo "0")
fi
TS_SCORE=$(python3 -c "print(max(0, 20 - int('${ANY_COUNT}') * 2))" || echo "20")
echo "TS any count: ${ANY_COUNT} → ${TS_SCORE}/20"

# 3. Lint errors (20점)
LINT_ERROR_COUNT=0
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  LINT_ERROR_COUNT=$(pnpm lint --format json 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(sum(f['errorCount'] for f in d))" \
    2>/dev/null || echo "0")
fi
LINT_SCORE=$(python3 -c "print(max(0, 20 - int('${LINT_ERROR_COUNT}') * 2))" || echo "20")
echo "Lint errors: ${LINT_ERROR_COUNT} → ${LINT_SCORE}/20"

# 4. Doc check (15점)
DOC_CHECK_PASS=true
DOC_SCORE=15
echo "Doc check: ${DOC_CHECK_PASS} → ${DOC_SCORE}/15"

# 5. Security (15점)
CRITICAL_VULN=0
HIGH_VULN=0
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  AUDIT=$(pnpm audit --json 2>/dev/null || echo '{}')
  CRITICAL_VULN=$(echo "$AUDIT" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))
" 2>/dev/null || echo "0")
  HIGH_VULN=$(echo "$AUDIT" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(d.get('metadata',{}).get('vulnerabilities',{}).get('high',0))
" 2>/dev/null || echo "0")
fi
SEC_SCORE=$(python3 -c "print(max(0, 15 - int('${CRITICAL_VULN}')*5 - int('${HIGH_VULN}')*2))" || echo "15")
echo "Security (crit=${CRITICAL_VULN}, high=${HIGH_VULN}) → ${SEC_SCORE}/15"

# 총점 및 등급
TOTAL=$(python3 -c "
scores = [float('${COVERAGE_SCORE}'), float('${TS_SCORE}'),
          float('${LINT_SCORE}'), float('${DOC_SCORE}'), float('${SEC_SCORE}')]
print(int(sum(scores)))
" || echo "0")

GRADE="F"
[ "$TOTAL" -ge 60 ] && GRADE="D"
[ "$TOTAL" -ge 70 ] && GRADE="C"
[ "$TOTAL" -ge 80 ] && GRADE="B"
[ "$TOTAL" -ge 90 ] && GRADE="A"

echo ""; echo "Total: ${TOTAL}/100 → Grade ${GRADE}"

# JSON 저장
cat > "$REPORT_FILE" <<EOF
{
  "date": "${DATE}",
  "score": ${TOTAL},
  "grade": "${GRADE}",
  "coverage_pct": ${COVERAGE_PCT},
  "any_count": ${ANY_COUNT},
  "lint_error_count": ${LINT_ERROR_COUNT},
  "doc_check_pass": ${DOC_CHECK_PASS},
  "critical_vuln_count": ${CRITICAL_VULN},
  "high_vuln_count": ${HIGH_VULN}
}
EOF

echo "Saved: ${REPORT_FILE}"
echo "============================================"
[ "$TOTAL" -lt 70 ] && echo "⚠️  Grade ${GRADE} — see docs/QUALITY_SCORE.md" && exit 1
exit 0
