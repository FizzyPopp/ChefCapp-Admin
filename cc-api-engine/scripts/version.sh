#! /usr/bin/env bash
set -euo pipefail

preshow
# export name="ccApiEngine"
. ccapi_build_vars

name="ccApiEngine"

set_ccapi_build_vars

echo "$_conf"

unset_ccapi_build_vars

unset name
