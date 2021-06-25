#!/usr/bin/env bash
set -euo pipefail

export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FIRESTORE_STORAGE_EMULATOR_HOST="localhost:9199"

node "index.js"
