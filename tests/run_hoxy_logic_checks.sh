#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

bash tests/hoxy_logic_modal_active_helper_usage.test.sh
bash tests/hoxy_logic_modal_active_helper_usage_extended.test.sh
bash tests/hoxy_logic_generating_modal_helper_usage.test.sh
bash tests/hoxy_logic_loading_message_helper.test.sh
bash tests/hoxy_logic_generating_progress_ui_helper.test.sh
bash tests/hoxy_logic_display_helper_usage.test.sh
bash tests/hoxy_logic_hidden_helper_usage.test.sh
bash tests/hoxy_logic_class_toggle_helper_usage.test.sh
bash tests/hoxy_logic_class_toggle_cleanup_guard.test.sh
bash tests/hoxy_logic_input_border_helper_usage.test.sh
