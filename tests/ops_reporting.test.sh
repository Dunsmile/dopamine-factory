#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; exit 1; }

assert_file() {
  local file="$1"
  [[ -f "$file" ]] || fail "Missing file: $file"
  pass "File exists: $file"
}

assert_contains() {
  local file="$1"
  local pattern="$2"
  grep -q "$pattern" "$file" || fail "'$pattern' not found in $file"
  pass "'$pattern' found in $file"
}

npm run ops:sync >/tmp/ops_sync_test.log 2>&1 || {
  cat /tmp/ops_sync_test.log
  fail "ops:sync failed"
}
pass "ops:sync runs"

npm run ops:doctor >/tmp/ops_doctor_test.log 2>&1 || {
  cat /tmp/ops_doctor_test.log
  fail "ops:doctor failed"
}
pass "ops:doctor runs"

assert_file "reports/weekly-ops-report.json"
assert_file "reports/scaling-checklist-status.json"
assert_file "reports/ops-readiness-report.json"
assert_file "reports/next-actions.json"
assert_file "reports/ops-input-health.json"
assert_file "reports/ops-guide.json"
assert_file "reports/ops-history.json"
assert_file "reports/ops-trend.json"
assert_file "reports/ops-dashboard.json"
assert_file "reports/target-metrics.json"
assert_file "reports/input-fix-commands.json"
assert_file "reports/phaseb-kpi-report.json"
assert_file "reports/phase-d-ops-report.json"

assert_contains "reports/weekly-ops-report.json" "\"phaseBKpi\""
assert_contains "reports/weekly-ops-report.json" "\"phaseDOps\""
assert_contains "reports/ops-readiness-report.json" "\"status\""
assert_contains "reports/next-actions.json" "\"actions\""
assert_contains "reports/ops-input-health.json" "\"status\""
assert_contains "reports/ops-guide.json" "\"commands\""
assert_contains "reports/ops-guide.json" "ops:sync"
assert_contains "reports/ops-history.json" "\"entries\""
assert_contains "reports/ops-trend.json" "\"latest\""
assert_contains "reports/ops-dashboard.json" "\"status\""
assert_contains "reports/target-metrics.json" "\"phaseBTargets\""
assert_contains "reports/input-fix-commands.json" "\"commands\""
assert_contains "reports/scaling-checklist-status.json" "\"completionRate\""
assert_contains "reports/phaseb-kpi-report.json" "\"decision\""
assert_contains "reports/phase-d-ops-report.json" "\"decision\""

pass "ops reporting pipeline is healthy"
