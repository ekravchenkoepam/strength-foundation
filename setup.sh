#!/bin/bash
set -euo pipefail

# -------- Options --------
FORCE_ENV=0
if [[ "${1:-}" == "--force-env" ]]; then
  FORCE_ENV=1
fi

# -------- Paths --------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/packages/admin"
CLIENT_DIR="$ROOT_DIR/packages/client"

TEST_DB="$ROOT_DIR/test_data/data.db"
SERVER_DB="$SERVER_DIR/.tmp/data.db"

TEST_UPLOADS="$ROOT_DIR/test_data/uploads"
SERVER_UPLOADS="$SERVER_DIR/public/uploads"

# -------- NVM + Node --------
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  echo "Install NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
else
  echo "nvm.sh not found in $NVM_DIR"
  exit 1
fi

echo "Install Node.js 20.18.0..."
nvm install 20.18.0
nvm use 20.18.0
nvm alias default 20.18.0
echo "Node.js version $(node -v) prepared!"

# -------- Helpers --------
copy_env () {
  local dir="$1"
  local ex="$dir/.env.example"
  local env="$dir/.env"

  if [ ! -d "$dir" ]; then
    echo "Skip: dir not found $dir"
    return 0
  fi
  if [ ! -f "$ex" ]; then
    echo "Skip: .env.example not found in $dir"
    return 0
  fi

  if [ -f "$env" ] && [ $FORCE_ENV -eq 0 ]; then
    echo "$env already exists — keeping it (use --force-env to overwrite)"
  else
    cp "$ex" "$env"
    echo "Copied: $ex → $env"
  fi
}

# -------- Copy envs --------
echo "→ Preparing env files..."
copy_env "$SERVER_DIR"
copy_env "$CLIENT_DIR"

# -------- Copy DB --------
echo "→ Preparing database..."
if [ -f "$TEST_DB" ]; then
  mkdir -p "$(dirname "$SERVER_DB")"
  cp "$TEST_DB" "$SERVER_DB"
  echo "Copied: $TEST_DB → $SERVER_DB"
else
  echo "$TEST_DB not found, skipping"
fi

# -------- Copy uploads --------
echo "→ Preparing uploads..."
if [ -d "$TEST_UPLOADS" ]; then
  mkdir -p "$SERVER_UPLOADS"
  cp -r "$TEST_UPLOADS/"* "$SERVER_UPLOADS/"
  echo "Copied uploads from $TEST_UPLOADS → $SERVER_UPLOADS"
else
  echo "$TEST_UPLOADS not found, skipping"
fi

echo "Setup done."
echo "   - Env files prepared in:"
echo "     • $SERVER_DIR/.env"
echo "     • $CLIENT_DIR/.env"
echo "   - DB copied to: $SERVER_DB"
echo "   - Uploads copied to: $SERVER_UPLOADS"
echo "   - Node $(node -v) is active"
