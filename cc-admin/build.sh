#!/usr/bin/env bash
set -euo pipefail

# set default admin install directory to the script's running pwd
export CCA_DIR=$PWD
# set default temp directory to ~/cc-admin
export CCT_DIR=$HOME/cc-admin

# conditional for targeting
if [[ $1 != "" ]]; then
    export CCT_DIR=$1
fi


# move to the install directory and pack the node module
cd $CCA_DIR
npm pack $CCA_DIR

# install to the target
cd $CCT_DIR
npm install $CCA_DIR/cc-admin-1.0.0.tgz
