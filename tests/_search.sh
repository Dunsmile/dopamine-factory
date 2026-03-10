#!/usr/bin/env bash

search_project_contains() {
  local pattern="$1"
  local target="$2"

  if command -v rg >/dev/null 2>&1; then
    rg -n -S -- "${pattern}" "${target}" >/dev/null
  else
    grep -RInE -- "${pattern}" "${target}" >/dev/null
  fi
}
