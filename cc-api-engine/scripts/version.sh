#! /usr/bin/env bash
set -eo pipefail

preshow
# export name="ccApiEngine"
. build_vars

name="cc_api_engine"
set_build_vars

err_exit() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}


# default target is development, make it a bit easier to type
target='DEVELOPMENT'

# check for arguments and set accordingly
for arg in "$@"
do
    case $arg in
        '-t'|'--target')
            case $2 in
                'd'|'dev'|'develop'|'development')
                    export target='DEVELOPMENT'
                    ;;
                's'|'stg'|'staging')
                    export target='STAGING'
                    ;;
                'p'|'prd'|'production')
                    export target='PRODUCTION'
                    ;;
                *)
                    err_exit 'Expected "development|staging|production" for target argument.'
                    ;;
            esac
            ;;
        *)
            ;;
    esac
    shift
done

printf 'Running version bump for target %s\n' "$target"

# load in docker stuff
export docker_repo=$($jq -r .services.\""$name"\".docker.repository "$cca$_conf")

# save current git branch so it could be returned to
export current_branch=$(git rev-parse --abbrev-ref HEAD)
# read package name and tagging data from package.json

export src_dir="$cca$_src"
export dest_dir="$cca$_dest"

# read npm variables
export package_json="$src_dir/package.json"
printf '%s\n' "$src_dir"
printf '%s\n' "$package_json"
export package_name=$($jq -r .name "$package_json")
export version=$($jq -r .version "$package_json")
export npm_package_file="$package_name-$version.tgz"

# read git variables
export commit_long=$(git rev-parse --verify HEAD)
export commit=${commit_long:0:8}

# set up some directories

export staging_dir="/staging"
export production_dir="/stable"
export target_version="-1"

# Assigning the correct directories based on target
case $target in
    'DEVELOPMENT')
        branch="$current_branch"
        target_version=$(semver bump build $branch.$commit $version)
        docker_tag="$docker_repo:$branch-latest"
        dest_dir="$dest_dir/$current_branch";
        ;;
    'STAGING')
        branch="master"
        target_version=$(semver bump build $branch.$commit $version)
        docker_tag="$docker_repo:staging"
        dest_dir="$dest_dir$staging_dir"
        ;;
    'PRODUCTION')
        branch="master"
        target_version=$(semver get release $version)
        docker_tag="$docker_repo:stable"
        dest_dir="$dest_dir$production_dir"
        ;;
    *) exit 1
       ;;
esac

export archive_file="$package_name-v$target_version.tgz"

# git stash
# git checkout "$branch" --quiet

printf '<== BUILD VARIABLES ==>\n'
printf 'target: %s\n' "$target"
printf 'npm name: %s\n' "$name"
printf 'package version: %s\n' "$version"
printf 'npm pack output file: %s\n' "$npm_package_file"
printf 'branch: %s\n' "$branch"
printf 'target version string: %s\n' "$target_version"
printf 'docker tag: %s\n' "$docker_tag"
printf 'archive file: %s\n' "$archive_file"

build_npm() {

    ## The node build is basically just running npm install to update and then npm pack to generate the package
    printf 'Building npm package for %s version %s...\n' "$package_name" "$target_version"

    printf 'cd %s\n' "$src_dir"
    cd "$src_dir"

    # running updates and packaging
    printf 'npm install\n'
    printf 'npm pack\n'
    # npm install
    # npm pack

    printf 'Moving package to build output directory and updating deploy.tgz (%s)\n' "$src_dir/$npm_package_file"

    printf 'mkdir -p %s/build\n' "$src_dir"
    # mkdir -p "$src_dir/build"

    # create deploy.tgz for immediate builds with docker, or other voodoos
    printf 'cp %s/%s %s/build/deploy.tgz\n' "$src_dir" "$npm_package_file" "$src_dir"
    # cp "$src_dir/$npm_package_file" "$src_dir/build/deploy.tgz"

    # archiving build result and cleaning up workspace
    printf 'mkdir -p %s\n' "$dest_dir"
    printf 'mv %s/%s %s/%s.tgz\n' "$src_dir" "$npm_package_file" "$dest_dir" "$archive_file"
    # mkdir -p "$dest_dir"
    # mv "$src_dir/$npm_package_file" "$dest_dir/$archive_file.tgz"
}

build_npm
# return to previous branch
# git checkout $current_branch --quiet
# pop any workspace clutter back out
# git stash pop --quiet

# clean up environment
unset_build_vars
unset name
