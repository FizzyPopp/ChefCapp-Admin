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

target="DEV"
name="adminClient"

# setup directory path variables
_conf="/project.json"

_src=$($jq -r .paths.$name.src.root "$cca$_conf")
_build=$($jq -r .paths.$name.src.build "$cca$_conf")

if [[ "$target" = "DEV" ]]
then
    echo "Development build of $name"
fi
if [[ "$target" = "REL" ]]
then
    echo "Release build of $name"
fi

printf 'Building flutter web client application for %s\n' "$target"
printf 'Updating submodule...\n'
git submodule update --remote --merge
printf 'Done.\n'

printf 'Running Flutter web build...\n'
cd "$cca$_src"
flutter channel stable
flutter upgrade
flutter pub get
flutter pub upgrade
flutter build web
printf 'Done.\n'
