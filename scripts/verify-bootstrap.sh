#!/usr/bin/env bash
# =============================================================================
# scripts/verify-bootstrap.sh
# Sprint 0 Acceptance Checklist — runs on your machine.
# All commands must exit 0 before Sprint 0 is considered Done.
# Reference: 048_PROJECT_BOOTSTRAP.md (Project Health Check).
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

pass()  { echo -e "${GREEN}[PASS]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; FAILURES=$((FAILURES + 1)); }
info()  { echo -e "${YELLOW}[INFO]${NC} $1"; }

FAILURES=0

echo ""
echo "=================================================="
echo "  Sprint 0 Bootstrap Verification Checklist"
echo "  Repository: Enterprise E-Commerce Analytics"
echo "  Per: 048_PROJECT_BOOTSTRAP.md"
echo "=================================================="
echo ""

# ── 1. pnpm available ──────────────────────────────────────────────────────
info "Checking pnpm..."
if command -v pnpm &>/dev/null; then
  pass "pnpm available ($(pnpm --version))"
else
  fail "pnpm not found — install via: npm install -g pnpm"
fi

# ── 2. Node version ────────────────────────────────────────────────────────
info "Checking Node.js version..."
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
  pass "Node.js $(node --version) (>=20 required)"
else
  fail "Node.js $(node --version) — upgrade to >=20"
fi

# ── 3. pnpm install ────────────────────────────────────────────────────────
info "Installing dependencies (pnpm install)..."
if pnpm install --frozen-lockfile 2>&1; then
  pass "pnpm install succeeded"
else
  info "Retrying without --frozen-lockfile (first install before lockfile exists)..."
  if pnpm install 2>&1; then
    pass "pnpm install succeeded"
  else
    fail "pnpm install failed"
  fi
fi

# ── 4. Lint ────────────────────────────────────────────────────────────────
info "Running lint..."
if pnpm lint 2>&1; then pass "lint passed"; else fail "lint failed"; fi

# ── 5. Type check ──────────────────────────────────────────────────────────
info "Running tsc --noEmit..."
if pnpm typecheck 2>&1; then pass "typecheck passed"; else fail "typecheck failed"; fi

# ── 6. Unit tests ──────────────────────────────────────────────────────────
info "Running tests..."
if pnpm test:run 2>&1; then pass "tests passed"; else fail "tests failed"; fi

# ── 7. Build ───────────────────────────────────────────────────────────────
info "Running next build..."
if pnpm build 2>&1; then pass "build succeeded"; else fail "build failed"; fi

# ── 8. Environment file ────────────────────────────────────────────────────
info "Checking .env.local..."
if [ -f ".env.local" ]; then
  pass ".env.local exists"
  # Verify required vars present (values may be empty for optional ones)
  REQUIRED_VARS=(
    NEXT_PUBLIC_APP_NAME NEXT_PUBLIC_APP_URL
    NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY DATABASE_URL DIRECT_URL
    JWT_SECRET APP_SECRET
  )
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.local && [ -n "$(grep "^${var}=" .env.local | cut -d= -f2-)" ]; then
      pass "  $var is set"
    else
      fail "  $var is missing or empty in .env.local"
    fi
  done
else
  fail ".env.local not found — copy .env.example and fill values"
fi

# ── 9. Git initialised ─────────────────────────────────────────────────────
info "Checking Git..."
if git rev-parse --git-dir &>/dev/null; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  pass "Git initialized (branch: $BRANCH)"
  if git show-ref --verify --quiet refs/heads/main; then
    pass "  main branch exists"
  else
    fail "  main branch missing — run: git checkout -b main"
  fi
  if git show-ref --verify --quiet refs/heads/develop; then
    pass "  develop branch exists"
  else
    fail "  develop branch missing — run: git checkout -b develop"
  fi
else
  fail "Git not initialized — run: git init && git checkout -b main"
fi

# ── 10. Husky hooks ────────────────────────────────────────────────────────
info "Checking Husky..."
if [ -f ".husky/pre-commit" ]; then
  pass "pre-commit hook exists"
else
  fail "pre-commit hook missing — run: pnpm prepare"
fi

# ── 11. Prisma ────────────────────────────────────────────────────────────
info "Checking Prisma..."
if [ -f "prisma/schema.prisma" ]; then pass "prisma/schema.prisma exists"; else fail "prisma/schema.prisma missing"; fi
if [ -f "prisma/migrations/migration_lock.toml" ]; then pass "migration lock exists"; else fail "migration lock missing"; fi

# ── 12. Folder structure (026) ────────────────────────────────────────────
info "Checking directory structure per 026_FOLDER_STRUCTURE.md..."
REQUIRED_DIRS=(app components modules lib services adapters database types hooks utils config public docs scripts tests prisma)
for d in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$d" ]; then pass "  $d/"; else fail "  $d/ missing"; fi
done

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
if [ "$FAILURES" -eq 0 ]; then
  echo -e "${GREEN}ALL CHECKS PASSED — Sprint 0 Bootstrap Complete${NC}"
  echo "Next step: git add . && git commit -m 'chore: initialize repository architecture'"
  echo "Then: git checkout -b develop"
else
  echo -e "${RED}$FAILURES check(s) FAILED — resolve before closing Sprint 0${NC}"
fi
echo "=================================================="
echo ""

exit "$FAILURES"
