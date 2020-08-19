---
title: Firebase Authentication for ChefCapp
author: 
- James Liu
keywords: [send, help, authentication, flutter, firebase, self-help]
---
# Firebase Authentication in Flutter/Dart

Apparently the Firebase team has pumped out a flutter plugin for Firebase authentication services -> [`firebase_auth`](https://pub.dev/packages/firebase_auth). This plugin currently supports a subset of Firebase authentication options:

- Email and Password
- Phone
- Anonymous
- Google
- GitHub
- Facebook
- Twitter


## ChefCapp Sign-in Concept (as understood by the author (james) )

From user perspective:

```
Opens app -> sees register/signin screen -> a) signs in, b) don't sign in for now

a) signing in with email/password
    - if registered, sees success or failure depending on password check
    - else gets pushed through a registration process

b) proceeds without signing in
    - proceeds anonymously, without saved user data 
      (i.e. favourites, kitchen ingredients(?), localizations)
        - eventually lured into making an account, through some means, GOTO a)
```

### Signing in for future interns

Tied with a chefcapp email, I'll build out some sort of admin function to add accounts of varying access levels.


## Firebase Authentication Concept

note: most of this is paraphrased from the [official documentation](https://firebase.google.com/docs/auth/users)

>"The Firebase **user** object represents a user account that has signed up for an app in your project"

-Firebase Docs

**FirebaseUser** - user object which gets handed back on a successful authentication

**User database** - *separate* from any of the databases we currently use (firestore, realtime, hosting, etc.), this database stores exactly 4 things per user:

- uuid
- email
- name
- photo URL

These fields will get populated based on how the user signed up for the app.

**Sign-in Providers** - Regarding sign in providers, there are three main options:

- email/password
- federated IDs (google, fb, etc)
- ~~our own custom mojo~~ this is dumb and hard.

Plus the awkward middle child of anonymous sign-in. According to the API there's two main functions that call for signin with these two providers. We'll probably need to build buttons 

**Auth Instance** - this represents a *current user* in the app, the documentation claims it can persist state across browser refresh and application restarts. I suspect the Auth Instance stores data server-side and logs a session token locally.

**Auth Tokens** 

- Firebase ID: created when a user signs in. A signed JWT with basic profile info like ID string
- ID provider tokens: gifted from federated providers (google/FB/Twotter/etc)
- ~~custom tokens user the custom authentication system that we will not be building~~


### Authentication Cycle

Prompt user for sign in:
- email/password
- federated
- skip (anon)

Use appropriate function calls to the providers (firebase_auth, google_sign_in, some_third_party) and get `AuthCredential` of some sort.

Shove `AuthCredential` into appropriate `signInWith...()` function, obtain `AuthResult` along with `AuthResult.user` ==> we in the money now.


## Setup, or, how to get this shit working

According to the plugin page, there's some requirements before use that isn't just adding the plugin to `pubspec.yaml`.

- [x] enable and apply Google services in android build files 
  - this is already done good job us woohoo
- [ ] add the Firebase SDK to any web interface that we plan on pushing out - mostly in reference to the Recipe/Data upload Console.
- [X] import the dang thing in flutter dependencies 
  - already in there what a lad

Hard mode[^1] (post MVP if I recall):

- [ ] set up [`google_sign_in`](https://pub.dev/packages/google_sign_in) before we plan to have it available.
  - [ ] Required secondary power: enable the correct OAuth APIs in the [Google Cloud API manager](https://console.developers.google.com/)

### Facebook/Twitter/GitHub

We'll have to find and test plugins from third-parties to obtain the access tokens for the respective platforms. From a quick search, one exists for facebook that looks somewhat trustworthy, none for the others that are acceptable.

### Set up `google_sign_in` plugin

tl;dr - more iOS finagling because mArKeT ShArE.

#### Android

0. Register the application (we have done this go us woohoo)
1. Enable the 'Google Sign In' OAuth API in the [Google Cloud API manager](https://console.developers.google.com/).
2. Check if we need to slap in the [`google-services.json`](https://developers.google.com/android/guides/google-services-plugin) into the app's build folders.
3. add to `pubspec.yaml` and import away

#### iOS

lol [read plugin docs](https://pub.dev/packages/google_sign_in). Requires a [registered](https://developers.google.com/mobile/add?platform=ios) iOS application, also requires us to support [Apple Sign In](https://developer.apple.com/sign-in-with-apple/get-started). Upside, there exists a [`sign_in_with_apple`](https://pub.dev/packages/sign_in_with_apple) plugin for flutter. Downside, **firebase_auth does not support signing in with apple**.

### Android Google Service Instructions (in case we forget and nuke build.gradle or something)

This can also be found in the plugin [home page](https://pub.dev/packages/firebase_auth).

1. Add the classpath to the `[project]/android/build.gradle` file.

``` gradle
dependencies {
  // Example existing classpath
  classpath 'com.android.tools.build:gradle:3.2.1'
  // Add the google services classpath
  classpath 'com.google.gms:google-services:4.3.0'
}
```

2. Add the apply plugin to the `[project]/android/app/build.gradle` file.

``` gradle
apply plugin: 'com.google.gms.google-services'
```

### Firebase Auth SDKs for web client

With flutter for web, it needs to pull the SDKs from the web due to a bug (see readme for [firebase_auth_web](https://github.com/FirebaseExtended/flutterfire/blob/master/packages/firebase_auth/firebase_auth_web/README.md) for more detail). It requires this bit of html to be added to the `web/index.html` of the flutter app. In our case, this will likely be a post MVP thing for the main client, as we have agreed to whip up a separate flutter app for the Recipe/Data Console.

``` html
<html>
    ...
    <body>
        <script src="https://www.gstatic.com/firebasejs/7.5.0/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/7.5.0/firebase-auth.js"></script>
        <!-- Other firebase SDKs/config here -->
        <script src="main.dart.js"></script>
    </body>
</html>
```

### Importing the dang `firebase_auth` plugin
        
```yaml
dependencies:
    firebase_auth: ^0.16.1
```

``` dart
import 'package:firebase_auth/firebase_auth.dart';
```


[^1]: Probably need a separate investigation on enabling the OAuth APIs since there might be other APIs that we'd like to access beyond the basic sign-in stuff - if so, google needs reviews and shit, see attached docs (google_oauth.html & Consent screen...Console.pdf) for more details.

## Usage

