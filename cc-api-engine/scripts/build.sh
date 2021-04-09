#!/usr/bin/env bash
set -euo pipefail

# checks if $cca is set - i.e. if project environment has been set up
preshow

. ccapi_build_vars

name="ccApiEngine"

# load in pathing and target names from ./project.json
set_ccapi_build_vars

name="ccApiEngine"

target="DEVELOPMENT"

# read package name and tagging data from package.json
export package_json="$cca$_src/package.json"
export version=$($jq -r .version "$package_json")

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

    # running updates and packaging
    npm install
    npm pack

    printf 'Moving package to build output directory and updating deploy.tgz (%s)\n' "$cca$_package_dir/$package_file"
    mkdir -p "$cca$_package_dir"
    # create deploy.tgz for immediate builds
    cp "$cca$_module_root/$package_file" "$cca$_package_dir/deploy.tgz"
    # archiving build result and cleaning up workspace
    mv "$cca$_module_root/$package_file" "$cca$_package_dir/$build_name.tgz"
}

build_docker() {
    sudo docker build --tag "$docker_tag"
}

build_npm
