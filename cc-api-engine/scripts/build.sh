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

target="DEV"
name="ccApiEngine"

# setup directory path variables
_conf="/project.json"

# load in source directories
_src=$($jq -r .paths.$name.src.root "$cca$_conf")

# load in build output directories
_module_root=$($jq -r .paths.$name.src.root "$cca$_conf")
_package_dir=$($jq -r .paths.$name.src.package "$cca$_conf")

_temp=$($jq -r .paths.$name.dest.temp "$cca$_conf")
_develop=$($jq -r .paths.$name.dest.develop "$cca$_conf")
_release=$($jq -r .paths.$name.dest.release "$cca$_conf")


# get server package metadata from package.json
package_json="$cca$_src/package.json"
version=$($jq -r .version "$package_json")
package_name=$($jq -r .name "$package_json")
package_file=$package_name-$version.tgz


# Assigning the correct directories based on target
if [[ "$target" = "DEV" ]]
then
    echo "Development build of admin-server at v$version"
fi
if [[ "$target" = "REL" ]]
then
    echo "Release build of $name at v$version"
fi


## The build is basically just running npm install to update and then npm pack to generate the package
printf 'Building npm package for %s version %s...\n' "$package_name" "$version"
mkdir -p "$cca$_module_root"
cd "$cca$_module_root"
# printf 'npm install\n'
# printf 'npm pack\n'
npm install
npm pack

printf 'Moving package to package directory and updating deploy.tgz (%s)\n' "$cca$_package_dir/$package_file"

# printf 'mkdir -p %s \n' "$cca$_package_dir"
mkdir -p "$cca$_package_dir"

# printf 'mv %s %s \n' "$cca$_module_root/$package_file" "$cca$_module_root/build/$package_file"
cp "$cca$_module_root/$package_file" "$cca$_package_dir/$package_file"
mv "$cca$_module_root/$package_file" "$cca$_package_dir/deploy.tgz"
