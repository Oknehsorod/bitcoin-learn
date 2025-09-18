#!/usr/bin/env bash
set -euo pipefail

mkdir -p ".blockchain"

# Load variables from .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

# Check that BITCOIN_DATADIR is set
if [ -z "${BITCOIN_DATADIR:-}" ]; then
  echo "BITCOIN_DATADIR not set in .env"
  exit 1
fi

# Paths
REGTEST_DIR="$BITCOIN_DATADIR/regtest"

echo ">>> Stopping bitcoind (if running)..."
bitcoin-cli -regtest -datadir="$BITCOIN_DATADIR" stop || true

# Wait a bit for clean shutdown
sleep 2

echo ">>> Cleaning regtest data at $REGTEST_DIR..."
rm -rf "$REGTEST_DIR"

# Ensure config file exists
if [ ! -f "./bitcoin.conf" ]; then
  echo "bitcoin.conf not found in repo root!"
  exit 1
fi

echo ">>> Restarting bitcoind in regtest mode..."
bitcoind -regtest -datadir="/Users/oknehsorod/Documents/Work/Projects/bitcoin-learn/.blockchain" -conf="$(pwd)/bitcoin.conf" -daemon

echo ">>> Done. Fresh regtest blockchain started."
