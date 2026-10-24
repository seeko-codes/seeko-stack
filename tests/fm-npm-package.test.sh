#!/usr/bin/env bash
# Offline npm artifact and installed initializer regression. No live agents.
set -euo pipefail

# shellcheck source=tests/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

command -v node >/dev/null || fail 'Node.js 22+ is required for npm packaging tests'
command -v npm >/dev/null || fail 'npm 10+ is required for npm packaging tests'
node --test "$ROOT/tests/npm-package.test.mjs"
