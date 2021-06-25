#!/usr/bin/env bash
set -euo pipefail

firebase emulators:start --import="emulator-data/" --export-on-exit
