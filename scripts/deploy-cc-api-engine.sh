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

# load in output directories
_server_module_root=$($jq -r .paths.ccApiEngine.src.root "$cca$_conf")
_server_package_dir=$($jq -r .paths.ccApiEngine.src.package "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_server_module_root/package.json"
version=$($jq -r .version "$package_json")
name=$($jq -r .name "$package_json")


printf 'Summon forth cc-api-engine...\n'
cd "$cca$_server_module_root"
npm run build
printf 'Done.\n'


printf 'Pushing build package to api server...\n'
rsync --progress -avz "$cca/$_server_package_dir/deploy.tgz" cca@api.chefcapp.com:/home/cca
printf 'Done.\n'

printf 'Running npm install on api.chefcapp.com \n'
ssh -t cca@api.chefcapp.com 'bash -i -c "./api-update.sh"'
printf 'Done.\n'
