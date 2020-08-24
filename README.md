# ChefCapp-admin

Administration interface for ChefCapp assists in parsing, uploads, database fiddling, etc.

# Requirements

* nodejs ~~v8.x.x~~ (DEPRECATED) v10.x.x (`lts/dubnium`)
* service account key

If you have both of them already, read ahead to **Installation**

### Get Nodejs v8/10

There's two major options to get nodejs

* use system node
* [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

*NOTE*: on linux, nvm should be used to manage the installation because node versioning is miraculously worse than python. 

If you're on macOS or Windows, you can sport the official download from  choose your own adventure from the friendly neighbourhood package manager's node version. 

#### using system node
just uhhh, install it from the system package manager - apt, brew, pacman, chocolatey, what have you. If your package manager does not allow direct version management, then you should consider using nvm.

#### using nvm
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
dubnium is always set to track the lastest v10.whatever LTS release, and will keep it up to date whenever you run the command again.

### Service Account Key

If you're running on windows, may the lord have mercy on your soul. Otherwise head to the ChefCapp Firebase Console > Gear menu > Project settings > Service Accounts. Ignore the config snippet and hit 'Generate new private key'.

**Don't change the name of the key file after you download it, or you might accidentally commit it.**

Make an init file `init.sh` or copy the one in project root:

``` sh
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
export FIREBASE_CONFIG={}
export GCLOUD_PROJECT={}
```

Before running any code or scripts that uses cc-admin, source init to get the 
environment variables set up.

`source ./init.sh`


I've added the private key file name and the init.sh into .gitignore, so it'll be
okay if you accidentally left then in the source dir.

It is possible to add the variables into your bash environment so that you do 
not need to source `init.sh` every time, but it's personal preference.


# Installation

1. Clone this repo

``` sh
cd /where/you/want/to/install
npm install /path/to/ChefCapp-Admin/cc-admin
```

2. Make sure you have the `init.sh` edited and sourced.

3. Start calling it in your projects:

``` javascript
var cca = require('cc-admin')
```

# Running

Currently the server uses expressjs to setup a `localhost` thing. Run it like so:

``` sh
$ node server.js
```

It will run under the port as defined in `server.js`


# Testing

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


# How to Use

The module comes with a bunch of once and future methods that deal with database
retrieval and data parsing. Eventually it may handle user account setup and 
manipulation as well.
