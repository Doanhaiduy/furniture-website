#!/usr/bin/env bash
#
# db-migrate.sh — apply new Supabase SQL migrations to the self-hosted DB on the VPS.
#
# How it works:
#   - Keeps a ledger table (public._migrations) of every migration file already run.
#   - Scans supabase/migrations/*.sql in filename order and runs only files NOT in the ledger.
#   - Each file is applied inside a single transaction; the ledger row is written in the SAME
#     transaction, so a failed migration rolls back cleanly and is retried next run.
#   - FIRST RUN: the baseline schema (0001_baseline_schema.sql) is assumed ALREADY applied
#     (the DB was created from it). It is auto-recorded as applied WITHOUT re-running, so only
#     0002 and newer actually execute.
#
# Usage (from the repo root, on the VPS):
#   SUPABASE_DB_PASSWORD='your-postgres-password' ./scripts/db-migrate.sh
#
# Override anything via env vars (see the config block below).
#
set -euo pipefail

# ─── Config (override via env) ──────────────────────────────────────────────
DB_CONTAINER="${DB_CONTAINER:-supabase-db}"          # `docker ps` name of the Supabase Postgres container
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-${POSTGRES_PASSWORD:-}}"  # postgres superuser password
BASELINE_GLOB="${BASELINE_GLOB:-*baseline*}"         # files matching this are marked applied on first run, not executed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$SCRIPT_DIR/../supabase/migrations}"

# ─── Helpers ────────────────────────────────────────────────────────────────
c_green() { printf '\033[32m%s\033[0m\n' "$1"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$1"; }
c_red() { printf '\033[31m%s\033[0m\n' "$1"; }

# Run SQL passed on stdin inside the DB container.
psql_stdin() {
  docker exec -e PGPASSWORD="$DB_PASSWORD" -i "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

# Run a one-line query and return the raw value (tuples-only, unaligned).
psql_scalar() {
  docker exec -e PGPASSWORD="$DB_PASSWORD" -i "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -tAc "$1"
}

# ─── Pre-flight ─────────────────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  c_red "✗ DB container '$DB_CONTAINER' is not running."
  echo "  Set DB_CONTAINER to the correct name. Running containers:"
  docker ps --format '   - {{.Names}}'
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  c_red "✗ Migrations dir not found: $MIGRATIONS_DIR"
  exit 1
fi

echo "→ Container : $DB_CONTAINER"
echo "→ Database  : $DB_USER@$DB_NAME"
echo "→ Directory : $MIGRATIONS_DIR"
echo

# ─── Ensure ledger table exists ─────────────────────────────────────────────
LEDGER_EXISTED="$(psql_scalar "SELECT to_regclass('public._migrations') IS NOT NULL;")"

psql_stdin >/dev/null <<'SQL'
CREATE TABLE IF NOT EXISTS public._migrations (
  filename   text PRIMARY KEY,
  checksum   text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public._migrations IS 'Applied SQL migrations tracked by scripts/db-migrate.sh';
SQL

# First-ever run: record the baseline as already applied (do NOT re-run it).
if [ "$LEDGER_EXISTED" != "t" ]; then
  c_yellow "First run: ledger created. Marking baseline migrations as already applied."
  while IFS= read -r base; do
    [ -z "$base" ] && continue
    sum="$(sha256sum "$MIGRATIONS_DIR/$base" | cut -d' ' -f1)"
    psql_scalar "INSERT INTO public._migrations(filename, checksum) VALUES ('$base', '$sum')
                 ON CONFLICT (filename) DO NOTHING;" >/dev/null
    echo "   baselined: $base"
  done < <(cd "$MIGRATIONS_DIR" && ls -1 $BASELINE_GLOB 2>/dev/null || true)
  echo
fi

# ─── Apply pending migrations in order ──────────────────────────────────────
applied_count=0
for file in $(cd "$MIGRATIONS_DIR" && ls -1 *.sql 2>/dev/null | sort); do
  path="$MIGRATIONS_DIR/$file"
  sum="$(sha256sum "$path" | cut -d' ' -f1)"

  recorded="$(psql_scalar "SELECT checksum FROM public._migrations WHERE filename = '$file';")"

  if [ -n "$recorded" ]; then
    if [ "$recorded" != "$sum" ]; then
      c_yellow "⚠ $file already applied but its contents CHANGED since (checksum mismatch)."
      c_yellow "  Not re-running. Create a NEW migration file for further changes."
    fi
    continue
  fi

  echo "→ Applying $file ..."
  # Run the migration + record it atomically in one transaction.
  {
    cat "$path"
    printf "\nINSERT INTO public._migrations(filename, checksum) VALUES ('%s', '%s');\n" "$file" "$sum"
  } | psql_stdin --single-transaction >/dev/null
  c_green "  ✓ $file"
  applied_count=$((applied_count + 1))
done

echo
if [ "$applied_count" -eq 0 ]; then
  c_green "✓ Database is up to date — no new migrations."
else
  c_green "✓ Applied $applied_count new migration(s)."
fi
