#!/usr/bin/env bash
# Run the admin E2E suite fully inside Docker (app + Playwright containers) against the
# Supabase CLI stack. Reproducible: no dependency on host Node/browsers.
#
# Usage:
#   scripts/e2e-docker.sh                       # regression: run the whole trusted suite
#   scripts/e2e-docker.sh smoke                 # smoke: only @smoke-tagged survival flows
#   E2E_ARGS="tests/e2e/admin-products-crud.spec.ts" scripts/e2e-docker.sh   # subset
#   E2E_RESET_DB=1 scripts/e2e-docker.sh        # reset+reseed DB first (destructive)
#
# Legacy specs under tests/e2e/_legacy/ are never run (excluded via playwright.config.ts
# testIgnore), so neither smoke nor regression can be polluted by them.
#
# Requires: the Supabase stack to be running (`pnpm supabase start`) so the external
# network supabase_network_furniture-website and the DB container exist.
set -euo pipefail

cd "$(dirname "$0")/.."

# First positional arg selects the suite. `smoke` -> grep the @smoke tag; anything else
# (or nothing) -> full regression. An explicit E2E_ARGS always wins.
if [ "${1:-}" = "smoke" ] && [ -z "${E2E_ARGS:-}" ]; then
  export E2E_ARGS="--grep @smoke"
  echo "==> Suite: SMOKE (--grep @smoke)"
else
  echo "==> Suite: REGRESSION (full trusted suite)"
fi

if [ "${E2E_RESET_DB:-0}" = "1" ]; then
  echo "==> Resetting + reseeding local Supabase DB (destructive)…"
  pnpm supabase db reset --no-seed
fi

echo "==> Verifying Supabase network exists…"
if ! docker network inspect supabase_network_furniture-website >/dev/null 2>&1; then
  echo "ERROR: supabase_network_furniture-website not found. Run 'pnpm supabase start' first." >&2
  exit 1
fi

echo "==> Building + running E2E containers…"
export E2E_ARGS="${E2E_ARGS:-}"
docker compose -f docker-compose.test.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from e2e
code=$?

echo "==> Tearing down E2E containers…"
docker compose -f docker-compose.test.yml down --remove-orphans >/dev/null 2>&1 || true

exit $code
