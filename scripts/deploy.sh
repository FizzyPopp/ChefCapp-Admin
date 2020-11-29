#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${cca+1}" ]]
then
    printf "Project root not set, make sure \$cca is set then try building."
    exit 1;
fi

if [[ -z "${jq+1}" ]]
then
    printf "Executable jq unavailable, install jq or point \$jq at ./ChefCapp-Admin/tools/\{jq-version-for-your-OS\}, then try building."
    exit 2;
fi

# setup directory path variables
_conf="/project.json"

# load in source directories
_src_server=$($JQ -r .paths.src.server.root "$cca$_conf")
_src_client=$($JQ -r .paths.src.client.root "$cca$_conf")

# load in build output directories
_server_module_root=$($jq -r .paths.ccapiEngine.src.root "$cca$_conf")
_server_package_dir=$($JQ -r .paths.ccapiEngine.src.build "$cca$_conf")
_client_build=$($JQ -r .paths.adminClient.src.build "$cca$_conf")

# load in web directories
_web_develop=$($JQ -r .paths.web.develop "$cca$_conf")
_web_release=$($JQ -r .paths.web.release "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_src_server/package.json"
version=$($JQ -r .version "$package_json")
name=$($JQ -r .name "$package_json")

printf 'Update submodules..'
git submodule update --remote --merge

printf 'Summon forth CCAPIengine'
cd $cca$_module_root
npm run build

firebase deploy --only hosting:landing
firebase deploy --only hosting:admin-client

printf 'Pushing build package to AWS...\n'
rsync --progress -avz "$cca/$_server_build/deploy.tgz" cca@api.chefcapp.com:/home/cca
