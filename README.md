# ChefCapp-Admin

Administration interface for ChefCapp assists in parsing, uploads, database fiddling, etc.

# How to set up the Admin Repo

1. Set up nodejs ~~v8.x.x~~ (DEPRECATED) v10.x.x (`lts/dubnium`)
1. Obtaining service account key
1. Installing [`jq`](https://stedolan.github.io/jq/) is required if you want to run `build.sh`
1. Clone repo and update the submodule
1. Create init script


If you have both of them already, read ahead to **Installation**

## Get Nodejs v8/10

Use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### using nvm

The repository comes with .nvmrc that points to `lts/carbon` (i.e. node v8) or `lts/dubnium` (i.e. node v10), so the version should be pinned and one just needs to run the commands and the correct version will be obtained.

1. Install nvm:

``` sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
more details can be found on the [official nvm readme](https://github.com/nvm-sh/nvm#installing-and-updating).

2. Install/update nodejs v8:

``` sh
nvm install lts/dubnium
```
dubnium is always set to track the latest v10.whatever LTS release, and will keep it up to date whenever you run the command again.

## Service Account Key 

If you're running on windows, may the lord have mercy on your soul. Otherwise head to the ChefCapp Firebase Console > Gear menu > Project settings > Service Accounts. Ignore the config snippet and hit 'Generate new private key'.

**Don't change the name of the key file after you download it, or you might accidentally commit it.**

## Install `jq` (optional, sorta)

The handy `jq` utility is used in the build scripts, if you want to run `build.sh`, then you need a working jq executable. A set of cross platform binaries can be found in the `tools/` folder.

If you are on OSX, you can install jq with brew or macports -

``` sh
brew install jq
```

``` sh
port install jq
```

If you're on linux, jq is officially available for Debian, Ubuntu, Fedora, openSUSE, and Arch.

## Clone Repo and update Submodules

Odds are this repo has already been cloned somewhere, that's okay, just skip that bit of the instruction.

This repo includes [ChefCapp-Admin-Client](https://github.com/FizzyPopp/ChefCapp-Admin-Client) as a submodule, so submodule management is somewhat necessary to keep working with it.

### Clone repo 

``` sh
git clone  --recurse-submodules git@github.com:FizzyPopp/ChefCapp-Admin.git
```

### Update submodules 

``` sh
git submodule update --remote --merge
```

Consider adding an alias:

``` sh
git config alias.supdate 'submodule update --remote --merge'
```

Now you can:

``` sh
git supdate
```

Working from the submodule is more of a pain in the ass than necessary, the official [git manual](https://git-scm.com/book/en/v2/Git-Tools-Submodules) has more information for the morbidly curious.

## Initialization Script and `./secrets/`

First make sure the directory `ChefCapp-Admin/secrets/` exists.

This is a sample `./secrets/init.sh`:

``` sh
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
export FIREBASE_CONFIG={}
export GCLOUD_PROJECT={}
export cca="/path/to/your/ChefCapp-Admin"
export PATH="$PATH:$cca/scripts"
export JQ="$cca/tools/jq-of-your-platform"
```

Source init to get the environment variables set up:

``` sh
source ./secrets/init.sh
```

### Purpose of the init script

The init script isn't so much a script as a collection of environment variables used pinpoint locations of fixed resources to get the build scripts to be portable.

### Purpose of the `secrets/` directory

The `ChefCapp-Admin/secrets` directory is used by firebase to house keys and tokens (`client-conf.json`), so we might as well use it to stash our secrets too.

**The secrets folder is already inside `.gitignore`, do not move secrets outside the secrets folder unless you want to accidentally commit them (like James has already done sort of once).**

I've added the private key file name and the init.sh into .gitignore, so it'll be
okay if you accidentally leave them in the source dir.

### Alternatives to the init script

It is possible to add the variables into your bash environment so that you do 
not need to source `init.sh` every time, but it's personal preference. This is the way that our live server will be provisioned.


# Working with the project

EEEEEE.wmv

## Building


Make sure you have the `init.sh` edited and sourced.

``` sh
$ build.sh
```

npm can be used to install the built package (found under `cc-admin/builds/`)

``` javascript
var cca = require('cc-admin')
```

## Running

The server uses expressjs to setup a `localhost` thing. Run it like so:

``` sh
ChefCapp-Admin/public/staging/v0.0.2:
$ node server.js
```

It will run under the port as defined in `server.js` - `localhost:3000` by default.


## Unit Testing

`cc-admin` uses [Jest](https://jestjs.io/) for 'unit' testing. There's no coverage requirement right now because the thing isn't even feature complete.

``` sh
ChefCapp-Admin/cc-admin:
$ npm test
```

Will run all the cases in `cc-admin/tests/`, you can call them individually like so:


``` sh
$ npm test schemas
```

As long as there's a corresponding `tests/schemas.test.js`
