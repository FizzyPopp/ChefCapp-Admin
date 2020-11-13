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

export PATH="$PATH:$PWD/scripts"
target="DEV"
name="admin-client"

# setup directory path variables
_conf="/project.json"

_src=$($jq -r .paths.$name.src.root "$cca$_conf")

_client_build=$($jq -r .paths.$name.src.build "$cca$_conf")

# load in web directories
_develop=$($jq -r .paths.$name.dest.develop "$cca$_conf")
_release=$($jq -r .paths.$name.dest.release "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_src/package.json"
version=$($jq -r .version "$package_json")

if [[ "$target" = "DEV" ]]
then
    echo "Development build of $name at v$version"
    _dest="$_develop/v$version"
fi
if [[ "$target" = "REL" ]]
then
    echo "Release build of $name at v$version"
    _dest="$_release/"
fi
echo "Destination $cca$_dest"

printf 'Building flutter web client application for %s\n' "$target"
printf 'Updating submodule...\n'
git submodule update --remote --merge
printf 'Done.\n'

printf 'Running Flutter web build...\n'
cd "$cca$_src"
flutter build web

if [ ! -d "$cca$_dest" ]
then
    mkdir -p "$cca$_dest"
fi

printf 'Copying client app build to %s/client ... \n' "$_dest"
cp -R "$cca$_client_build" "$cca$_dest"
printf 'Done.\n'
