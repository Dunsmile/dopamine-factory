#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

bash tests/hoxy_structure_disclaimer.test.sh
bash tests/hoxy_structure_action_modals.test.sh
bash tests/hoxy_structure_page_add_modals.test.sh
bash tests/hoxy_structure_charge_modals.test.sh
bash tests/hoxy_structure_generate_confirm_modal.test.sh
bash tests/hoxy_structure_generation_flow_modals.test.sh
bash tests/hoxy_structure_modal_toggle_helper.test.sh
bash tests/hoxy_structure_admin_login_modal.test.sh
bash tests/hoxy_structure_about_modal.test.sh
bash tests/hoxy_structure_privacy_modal.test.sh
bash tests/hoxy_structure_terms_modal.test.sh

