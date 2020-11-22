#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${cca+1}" || -z "${jq+1}" ]]
then
    printf "Project root not set or jq unavailable, make sure \$cca is set and jq command is available then try building."
    exit 0;
fi

export PATH="$PATH:$PWD/scripts"
target="DEV"
dry_run=""

# setup directory path variables
_conf="/project.json"

# load in source directories
_src_server=$($jq -r .paths.src.server.root "$cca$_conf")
_src_client=$($jq -r .paths.src.client.root "$cca$_conf")

# load in build output directories
_server_build=$($jq -r .paths.src.server.build "$cca$_conf")
_client_build=$($jq -r .paths.src.client.build "$cca$_conf")

# load in web directories
_web_develop=$($jq -r .paths.web.develop "$cca$_conf")
_web_release=$($jq -r .paths.web.release "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_src_server/package.json"
version=$($jq -r .version "$package_json")
name=$($jq -r .name "$package_json")

git submodule update --remote --merge
firebase deploy --only hosting:landing
# firebase deploy --only hosting:admin
firebase deploy --only hosting:admin-client

printf 'Pushing build package to AWS...\n'
rsync --progress -avz "$cca/build.tar.xz" "$1":/home/cca
