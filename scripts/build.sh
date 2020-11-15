#!/usr/bin/env bash
set -euo pipefail


if [[ -z "${cca+1}" || -z "${jq+1}" ]]
then
    printf "Project root not set or jq unavailable, make sure \$cca is set and jq command is available then try building."
    exit 1;
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
_web_client=$($jq -r .paths.web.client "$cca$_conf")

# get server package metadata from package.json
package_json="$cca$_src_server/package.json"
version=$($jq -r .version "$package_json")
name=$($jq -r .name "$package_json")


# Assigning the correct directories based on target
if [[ "$target" = "DEV" ]]
then
    echo "Development build of $name at v$version"
    _dest="$_web_develop/v$version"
fi
if [[ "$target" = "REL" ]]
then
    echo "Release build of $name at v$version"
    _dest="$_web_release/"
fi
echo "Destination $cca$_dest"


printf 'Building server package %s version %s...\n' "$name" "$version"
if [[ $dry_run ]]
then
    printf 'cd %s\n' "$cca$_server_build"
    printf 'npm pack %s\n' "$cca$_src_server"
else
    if [ ! -d "$cca$_server_build" ]
    then
        mkdir "$cca$_server_build"
    fi
    cd "$cca$_server_build"
    npm install
    npm pack "$cca$_src_server"

fi

printf 'Building flutter client application for %s\n' "$target"
if [[ $dry_run ]]
then
    printf 'Updating submodule...\n'
    printf 'git submodule update --remote --merge\n'
    printf 'Done.\n'
    printf 'Running Flutter web build...\n'
    printf 'cd %s\n' "$cca$_src_client"
    printf 'flutter build web\n'
else
    printf 'Updating submodule...\n'
    git submodule update --remote --merge
    printf 'Done.\n'

    printf 'Running Flutter web build...\n'
    cd "$cca$_src_client"
    flutter build web
fi


if [[ $dry_run ]]
then
    printf 'dryrun \n'
    printf 'cd %s \n' "$cca$_dest"

    printf 'Running npm install %s \n' "$_server_build/$name-$version.tgz"
    printf 'npm install %s \n' "$cca$_server_build/$name-$version.tgz"

    printf 'Copying client app build to %s ... \n' "$_dest"
    printf 'cp -R %s %s \n' "$cca$_client_build" "$cca$_dest"

    printf 'Copying server.js to %s ...\n' "$_dest"
    printf '%s - \n' "$cca$_dest"
    printf 'cp %s %s \n' "$cca$_src_server/server.js" "$cca$_dest"
else
    mkdir -p "$cca$_dest"
    cd "$cca$_dest"
    pwd

    printf 'Running npm install %s\n' "$cca$_server_build/$name-$version.tgz"
    npm install "$cca$_server_build/$name-$version.tgz"

    mkdir -p "$cca$_web_client"
    printf 'Copying client app build to %s ... \n' "$_web_client"
    cp -R "$cca$_client_build" "$cca$_web_client"
    printf 'Done.\n'

    printf 'Copying server.js to %s ...\n' "$_dest"
    cp "$cca$_src_server/server.js" "$cca$_dest"
    printf 'Generating nvmrc...\n'
    touch .nvmrc
    echo 'lts/dubnium' > .nvmrc
    printf 'Done.\n'

    printf 'Creating and compressing dir archive...\n'
    tar -c -I 'xz -5 -T0' -f "$cca/build.tar.xz" .nvmrc -- *
    printf 'Done.\n'

    printf '%s - \n' "$cca$_dest"
    ls "$cca$_dest"
fi
