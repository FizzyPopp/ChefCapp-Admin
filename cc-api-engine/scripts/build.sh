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



target="DEVELOPMENT"
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

# load in docker stuff
docker_repo=$($jq -r .services.$name.docker.repository "$cca$_conf")


# read package name and tagging data from package.json
package_json="$cca$_src/package.json"
version=$($jq -r .version "$package_json")

# save current git branch so it could be returned to
current_branch=$(git rev-parse --abbrev-ref HEAD)


# Assigning the correct directories based on target
if [[ "$target" = "DEVELOPMENT" ]]
then
    branch="$current_branch"
    commit_long=$(git rev-parse --verify HEAD)
    commit=${commit_long:0:8}
    build_name="$version-$branch-$commit"
    docker_tag="$docker_repo:$branch-$commit"
    echo "Development build $build_name of $name on branch $current_branch at v$version"
fi
if [[ "$target" = "STAGING" ]]
then
    branch="$current_branch"
    commit_long=$(git rev-parse --verify HEAD)
    build_name="$version-$branch-rc$commit"
    docker_tag="$docker_repo:staging"
    echo "Staging build $build_name of $name at v$version"
fi
if [[ "$target" = "PRODUCTION" ]]
then
    git checkout master
    commit_long=$(git rev-parse --verify HEAD)
    commit=${commit_long:0:8}
    build_name="$version"
    docker_tag="$docker_repo:stable"
    echo "Production build $build_name of $name at v$version"
fi

build_npm() {
    package_name=$($jq -r .name "$package_json")
    package_file="$package_name-$version.tgz"

    ## The node build is basically just running npm install to update and then npm pack to generate the package
    printf 'Building npm package for %s version %s...\n' "$package_name" "$version"

    mkdir -p "$cca$_module_root"
    cd "$cca$_module_root"
    # printf 'npm install\n'
    # printf 'npm pack\n'

    npm install
    npm pack

    printf 'Moving package to build output directory and updating deploy.tgz (%s)\n' "$cca$_package_dir/$package_file"
    # printf 'mkdir -p %s \n' "$cca$_package_dir"
    mkdir -p "$cca$_package_dir"
    # printf 'mv %s %s \n' "$cca$_module_root/$package_file" "$cca$_module_root/build/$package_file"
    cp "$cca$_module_root/$package_file" "$cca$_package_dir/deploy.tgz"
    mv "$cca$_module_root/$package_file" "$cca$_package_dir/$build_name.tgz"
}

build_docker() {
    sudo docker build --tag "$docker_tag"
}

build_npm

