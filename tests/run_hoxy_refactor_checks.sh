#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

bash tests/run_hoxy_logic_checks.sh
bash tests/run_hoxy_structure_checks.sh
bash tests/run_hoxy_style_checks.sh
bash tests/frontend_optimization.test.sh
bash tests/structure.test.sh

