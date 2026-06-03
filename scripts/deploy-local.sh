#!/usr/bin/env bash
# ============================================================
# deploy-local.sh — Deploy Supabase migrations + Astro app
# ============================================================
# Usage:
#   ./scripts/deploy-local.sh                    # uses .env.production
#   ./scripts/deploy-local.sh .env.local         # use a specific env file
#   ./scripts/deploy-local.sh .env.production    # explicit production env
#
# The env file MUST define:
#   SUPABASE_URL           — production Supabase URL  (e.g. https://xxx.supabase.co)
#   SUPABASE_ANON_KEY      — production anon key
#   SUPABASE_DB_PASSWORD   — production database password (for db push)
#   SUPABASE_PROJECT_ID    — project ref from `supabase projects list`
#
# Optional:
#   PUBLIC_SUPABASE_URL    — if different from SUPABASE_URL (client-side)
#   PUBLIC_SUPABASE_ANON_KEY
# ============================================================
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SUPABASE_DIR="$ROOT_DIR/apps/supabase"
WEB_DIR="$ROOT_DIR/apps/web"
ENV_FILE="${1:-$ROOT_DIR/.env.production}"

# ── colours ────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[info]${NC} $*"; }
ok()    { echo -e "${GREEN}[ ok ]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $*"; }
err()   { echo -e "${RED}[err ]${NC} $*"; }

# ── check prerequisites ────────────────────────────────────
command -v supabase >/dev/null 2>&1 || command -v bunx >/dev/null 2>&1 || {
  err "supabase CLI not found. Install it: brew install supabase/tap/supabase"
  exit 1
}
SUPABASE_CLI=$(command -v supabase || echo "bunx supabase")

if [ ! -f "$ENV_FILE" ]; then
  err "Environment file not found: $ENV_FILE"
  echo ""
  echo "  Create $ENV_FILE with these variables:"
  echo "    SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co"
  echo "    SUPABASE_ANON_KEY=eyJ..."
  echo "    SUPABASE_DB_PASSWORD=your-db-password"
  echo "    SUPABASE_PROJECT_ID=kfbzgkjffmfzjzbxoqvr"
  echo ""
  echo "  Or pass a different file:  $0 path/to/.env"
  exit 1
fi

# ── load environment ──────────────────────────────────────
set -a
source "$ENV_FILE"
set +a

# ── validate required vars ────────────────────────────────
REQUIRED_VARS=(SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_DB_PASSWORD SUPABASE_PROJECT_ID)
MISSING=false
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    err "$var is not set in $ENV_FILE"
    MISSING=true
  fi
done
# Also verify the URL looks like a production URL (not localhost)
if [[ "$SUPABASE_URL" == *"127.0.0.1"* || "$SUPABASE_URL" == *"localhost"* ]]; then
  warn "SUPABASE_URL points to localhost — are you sure this is the production server?"
  echo "  URL: $SUPABASE_URL"
  read -rp "Continue anyway? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then exit 1; fi
fi
if [ "$MISSING" = true ]; then exit 1; fi

ok "Environment loaded from $ENV_FILE"
info "Supabase project: $SUPABASE_PROJECT_ID"

# ── helper: push with auto-repair on "already exists" ──────
push_migrations() {
  info "Pushing migrations (public schema only)…"
  if OUTPUT=$($SUPABASE_CLI db push 2>&1); then
    ok "Migrations applied"
    return 0
  fi

  # Push failed — check if it's an "already exists" error
  if echo "$OUTPUT" | grep -qiE '(already exists|duplicate|relation.*already|type.*already)'; then
    warn "Detected 'already exists' errors — repairing migration history…"
    echo "$OUTPUT" | head -20
    echo ""

    # Parse pending migration versions from dry-run
    PENDING=$($SUPABASE_CLI db push --dry-run 2>&1)
    VERSIONS=$(echo "$PENDING" | grep -oE '• [0-9]{14}' | sed 's/• //')

    if [ -z "$VERSIONS" ]; then
      # Fallback: extract versions from migration filenames
      VERSIONS=$(ls "$SUPABASE_DIR/supabase/migrations" 2>/dev/null \
        | grep -oE '^[0-9]{14}' \
        | sort)
    fi

    for VERSION in $VERSIONS; do
      info "Repairing migration $VERSION as applied…"
      $SUPABASE_CLI migration repair --linked --status applied "$VERSION" 2>&1 || true
    done

    # Retry push — should be a no-op now
    info "Retrying migration push after repair…"
    if $SUPABASE_CLI db push 2>&1; then
      ok "Migrations applied after repair"
      return 0
    else
      err "Migration push still failing after repair. Manual inspection needed."
      return 1
    fi
  else
    # Genuine error, not "already exists"
    err "Migration push failed:"
    echo "$OUTPUT"
    return 1
  fi
}

# ── Step 1: Link Supabase project (idempotent) ────────────
info "Linking Supabase project…"
cd "$SUPABASE_DIR"
$SUPABASE_CLI link --project-ref "$SUPABASE_PROJECT_ID" 2>&1
ok "Supabase project linked"

# ── Step 2: Diff public schema changes ────────────────────
info "Checking public schema changes against remote…"
if ! DIFF=$($SUPABASE_CLI db diff --linked --schema public 2>&1); then
  # If diff fails (e.g. auth issues), fall back to dry-run
  warn "db diff failed — falling back to db push --dry-run"
  DIFF=$($SUPABASE_CLI db push --dry-run 2>&1 || true)
fi

# Check if there are any schema changes (ignore noise like "Initialising login role")
CHANGES=$(echo "$DIFF" | grep -cE '^(create|alter|drop|comment on)' 2>/dev/null || echo 0)
MIGRATIONS_PENDING=$(echo "$DIFF" | grep -c "Would push these migrations" 2>/dev/null || echo 0)

if [ "$CHANGES" -eq 0 ] && [ "$MIGRATIONS_PENDING" -eq 0 ]; then
  ok "No pending public-schema changes"
else
  echo "$DIFF"
  echo ""
  read -rp "Apply these public-schema changes to the production database? [y/N] " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    push_migrations
  else
    warn "Skipping migration push"
  fi
fi

# ── Step 3: Build & deploy Astro to Vercel ───────────────
cd "$ROOT_DIR"
info "Building Astro app…"
bun run build
ok "Build complete"

info "Deploying to Vercel…"
bunx vercel --prod --yes
ok "Vercel deployment complete"

# ── Done ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅  Deployment finished                        ║"
echo "║  Site:    https://taas-s-ekpaye.vercel.app      ║"
echo "║  Supabase: $SUPABASE_PROJECT_ID"
echo "╚══════════════════════════════════════════════════╝"
