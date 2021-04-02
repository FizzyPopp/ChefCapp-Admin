#!/usr/bin/bash
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

printf 'Let Admin Client arise...\n'
bash build-cc-admin-client.sh
printf 'Done.\n'

printf 'Deploying Admin Client through firebase...\n'
firebase deploy --only hosting:admin-client
printf 'Done.\n'
