#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${cca+1}" || -z "${JQ+1}" ]]
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
_src_server=$($JQ -r .paths.src.server.root "$cca$_conf")
_src_client=$($JQ -r .paths.src.client.root "$cca$_conf")

# load in build output directories
_server_build=$($JQ -r .paths.src.server.build "$cca$_conf")
_client_build=$($JQ -r .paths.src.client.build "$cca$_conf")

# load in web directories
_web_develop=$($JQ -r .paths.web.develop "$cca$_conf")
_web_release=$($JQ -r .paths.web.release "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_src_server/package.json"
version=$($JQ -r .version "$package_json")
name=$($JQ -r .name "$package_json")

git submodule update --remote --merge
firebase deploy

rsync --progress -avz -e "ssh -i $HOME/.ssh/standoffish-AWS-00.pem" "$cca/build.tar.xz" "ubuntu@ec2-18-191-186-158.us-east-2.compute.amazonaws.com:/home/ubuntu"
