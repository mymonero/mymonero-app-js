# MyMonero Desktop & Mobile Apps

TODO: add logo… maybe a Mac screenshot or two below

## What's in this repo?

This repository holds the source code, resources, and build scripts for the official [MyMonero](https://www.mymonero.com) downloadable desktop and mobile apps.

## What is MyMonero?

MyMonero is a very simple, safe, and featureful way to use the next-generation private digital currency called [Monero](http://www.getmonero.org). 

The MyMonero app lets you securely manage your Monero wallets, address book, and transactions by storing most information locally and keeping it encrypted. 

The major benefit of using MyMonero is it handles almost all of the work that Monero users must do themselves in order to use their Monero wallets.

In exchange for the convenience and features made possible by MyMonero, there is the minor privacy trade-off of sharing your Monero "view key" with the MyMonero server, so that it can scan the network for your wallets' transactions. However, it's impossible for MyMonero to spend any of your funds or otherwise access your metadata, as all of the rest of your information is either never sent to our server, or its encrypted with information only you have. So MyMonero is often described as "non-custodial of your private keys", unlike so many other services. 

(However, even the above trade-off of sharing your view key with the MyMonero server will soon be eliminated, as we are presently working to open-source a version of the back-end which anybody can run as their own server at home.)


## Requirements

The desktop app is built on [Electron](https://electron.atom.io) and can be packaged for and is intended to run on modern versions of MacOS (.app), Windows (installer), and Linux (.appimage).


## Downloads & More info

*(Coming soon)* Download the latest version from our website at [mymonero.com/desktop](https://www.mymonero.com/desktop).

Follow us on Twitter at [@MyMonero](https://www.twitter.com/mymonero) to get the latest updates.


## Reporting bugs & Sharing feature requests

If you would like to report an issue or share a feature request, please create an Github Issue on this repository.

If you're reporting a bug, please be sure to include all information which would be necessary to reproduce the issue, such as the operating system and app version on which you saw the bug. 

Please do not post private info such as your wallet address or private keys in the issue description. 

For support or to send feedback, you can also [contact us](https://mymonero.com/support) directly.


## Why we built the native apps

From MyMonero's creation in 2014 as a web wallet until the release of these downloadable apps in early 2017, the only way to access the service was via a browser on the MyMonero website. Since your spend key is never sent to the server, many operations could not be done on the server, and that meant that a lot of Javascript code had to be sent to and run within your browser (such as creating new wallets, or sending money).

Downloading that Javascript code opened up the possibility of an attacker inserting something malicious which, for example, could theoretically enable them to steal your funds. Another issue, which was actually observed, was that users would simply get misdirected (perhaps by search engine) to a scam/phishing site which was impersonating MyMonero under a different domain, which presumably tricked users into running malicious code.

There were other limitations with the web wallet, such as the inability to use it behind Tor. And, as a downloaded web app, it was significantly limited by the facilities available in common browsers. For example, in the web wallet, users could only access one wallet at a time, had to log in each time, and as a security precaution were quickly logged off once they became idle.

The native apps were conceived of in order to…

* solve the above security issues and feature limitations, 
 
* provide a solid foundation on which to build out and iterate upon a much more featureful experience, and to

* open MyMonero up as a light wallet project for the community to not only find reference implementation examples, but which they can contribute back to and have their contributions shipped and used by everyone else.


## Present State of the Apps

At present, only the desktop app is ready for usage, while the mobile apps are being built.

The desktop app has support for features such as…

* Managing multiple wallets at a time

* Contacts address book

* Deep OpenAlias integration (use domain or email instead of long Monero address)

* Creating QR codes and messages to request Monero be sent to you

* Send money to contacts, OpenAlias, or other Monero addresses (these may be input manually, or automatically by either dropping a request QR code on the Send screen or clicking a `monero:…` request URL)

* Settings, for clearing data or managing prefernces such as idle timeout

* Strong (AES256) encryption to password protect all sensitive user data 

* Improved UX, including educational tooltips

----------------------

# For developers & pre-release testers


## Repository contents
* Executable scripts for common tasks are located in `bin/`

* Local, application source code is located in `local_modules/`. This includes bundled/static third-party "Vendor" libraries such as [EmojiOne](http://emojione.com).

* After installation, non-bundled third-party modules (such as Electron) will be located in `node_modules/`.

* App package and build process info is located in `package.json`.

* This readme is located at `README.md`, and the license is located at `LICENSE.txt`.


## Installing

1. Clone or otherwise download this repository. Then, in your terminal, `cd` into the repo directory.

2. (If you are a developer) Switch to the `develop` branch by executing `git checkout develop`.

3. Install all dependencies by executing `npm install`.


## Running the desktop app in development mode

Testing in development mode does not require you to package, sign, and install the app, and will cause the Developer window to be shown.

To launch the desktop app in dev mode, run `bin/start_dev_desktop`.


## Building the app for production

Unless you are a MyMonero pre-release tester you will probably never need produce a production build of MyMonero, especially as you want to be using a verified build of MyMonero for daily usage. However, if you're testing a pre-release version of this app, you may want to build a production-ready version of the app rather than only running it in dev mode. 

In order to produce a production build, you must first have installed all of the `electron-builder` required system packages for building apps. See [electron-builder: Multi Platform Build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).

Please note: in order to create a production build for Mac, you must be on a Mac, and you'll need an installed Mac developer certificate to sign the build with, and you will need to edit `package.json` to specify the name of your certificate signing identity. To do so, update `CSC_NAME` in `scripts.dist` and `scripts.pack` with your identity name, which can be found via Keychain.app.

If you would like to build for only a specific platform, you must edit `package.json` to change occurrences of the argument `-mwl` in `scripts.pack` and `scripts.dist` to contain only the letter of the platform for which you'd like to build. For example, to build for Linux only, change the argument from `-mwl` to `-l`. 

In order to actually initiate the build for all desktop platforms, execute `bin/build_all_desktop`. 

This command relies upon resources present in `build`, and will output your build products in the directory `dist`.

Please note that MyMonero for Windows prepares an NSIS installer, rather than only an .exe, in order to support custom URL scheme registration/opening, and incorporates a custom installer script fragment, `build/installer.sh`. 


--------------

# Contributing

Contributions by way of pull request are very welcome and will be highly appreciated.

It's still early so the following guidelines are tentative. Feedback welcome.

## How the repo is used

* Releases are tagged on `master`

* All development is done on the `develop` branch. Hotfixes, if any, might be put on `master`.

* Nothing should be pushed to `develop` which breaks the app for others

* Big, long-running, or far-reaching work (such as a major UI overhaul) should generally be done on a branch. Once ready to incorporate into develop, check out your branch, rebase develop (`git rebase -i develop`), then checkout `develop`, then merge your branch onto `develop`. Be sure to delete your branch once done. 


## Architecture choices & technologies

In brief review, the requirements for the v1 native desktop app were that it…

* could run cross-platform,

* reproduced at least the functionality of the existing web wallet,

* could store arbitrary encrypted structured data locally,

* kept local data up-to-date with the server's,

* would facilitate things like swapping out the service provider (or at least the host), and potentially supporting multiple currencies in the future,

* (similarly) could be understood, built on top of, expanded, changed, and maintained as a long-lived codebase with a minimum of difficulty, complexity, and growth in entropy, 

* allowed us to actually release a minimum-viable app as quickly as possible (tension with previous point), and that it

* could be easily turned into a downloadable mobile app, preferably with a native UI.

### "Cross platform"

In order to avoid rewriting the same app across Mac, Windows, and Linux, we opted to use Electron. Electron is basically a Node.JS runtime, plus libraries to expose system services, plus Chrome browser windows for custom UI.

This had the obvious downside that we had to build all of our components from scratch – or at least out of existing web components.

React and React Native were considered in depth, and is discussed below.

### "Reproduced functionality of existing web wallet"

The web wallet was built entirely upon a now-aging version of Angular, which means almost all application objects were built in the Angular style. Borrowing any of the functionality would require an Angular dependency. Angular was removed as a dependency, resulting in the natural choice to factor business logic into encapsulated modules with simple public interfaces [see 1, 2]. For the moment, a context object which references application controllers is constructed and passed to application object constructors as a form of dependency injection [3]. This work also included some clarifications to codepaths like transaction construction in send-funds operations. Note that mnemonic wordset is now automatically detected, and mnemonic language selection from user locale is also attempted.

Additionally, many of the dependency scripts in the web wallet needed to be exposed as importable JS modules [3]. Note that the wallet mnemonic generation in the desktop version are now generated by the Node.JS crypto library's `randomBytes` function [4].

1. `local_modules/Wallets`, `local_modules/OpenAlias`

2. `local_modules/runtime_context` and implementors in `electron_main` and `MainWindow`

3. `local_modules/monero_utils`, `local_modules/cryptonote_utils`

4. `local_modules/cryptonote_utils/mnemonic.js` 

### "Store arbitrary encrypted structured data locally"

SQLite was considered as an embedded database but we opted for [NeDB](https://github.com/louischatriot/nedb) instead as it is not only JS-only but has a familiar document-based interface, a natural match for Javascript [1]. LMDB was not discussed initially but may be very interesting later on.

In order to accomplish password-protection we developed symmetric string and JSON document encryption libraries [2]. (Seeking community review.) Encrypting at database (de)serialization time was investigated but revealed to be a non-starter for a various reasons. Instead, the database doesn't know about the encryption and consumers are responsible for responding to events such as password changes.

In an Electron app, there is the main process, and then one process for each browser window you open. IPC is the method to communicate between them. If any long-running is performed on a thread it will block the associated UI. For example, blocking the main thread blocks the entire app. Blocking a browser process blocks the entire window, including its web contents. It was discovered that database operations blocked the thread upon which they were run. For that reason concurrency was implemented by way of an abstraction over spawning a child process and performing IPC with it [3].

On idle timeout, the in-memory decrypted data / runtime is torn down. Once the user enters their password, the runtime is reconstructed [4]. 

1. `local_modules/DocumentPersister`

2. `local_modules/symmetric_cryptor`

3. `local_modules/electron_background`, `local_modules/BackgroundDocumentPersister.NeDB.(child, electron).js`

4. `local_modules/Passwords`, `local_modules/UserIdle`, `local_modules/WalletsList`, `local_modules/Contacts`, `local_modules/RequestFunds`

### "Kept local data up-to-date"

The Wallets code currently polls for updates to account info, scan heights, transactions, etc. [1] but we're working on an effective rebuild of the back-end which will allow us to use a real-time connection for data sync (see Roadmap).

All API calls (such as submitting a constructed transaction for a send-funds operation) are done via an HTTP client [2] which is instantiated in the renderer process (rather than main) and which uses the `xhr` module, to get support for different network configurations via the browser.

1. `local_modules/Wallets/Controllers/WalletHostPollingController.js`

2. `local_modules/HostedMoneroAPIClient`


### "Could be easily turned into a native mobile app"

#### Language considerations

Single codebase for all platforms is the obvious ideal, but it doesn't appear to exist yet.

Fully native codebase was definitely considered, but would have taken too long as a first step. 


#### React vs Angular vs Bare metal

For the UI, in order to be able to generate a fully native UI on mobile, React and React Native were seriously considered, but reluctantly not able to be chosen. Initially, we knew Electron needed web output, rather than the native UI we wanted for mobile. However, React and React Native template code is not the same. So out of the gate, it was no longer a single-write solution - but actually a higher level language. To use a single codebase, in theory, it was discovered we could write the UI in React Native code first, and then use a library called [React Native for Web](https://github.com/necolas/react-native-web) to compile it to web output for Electron. Unfortunately, as of late last year when this was being evaluated, that project was not official, didn't have proper support for lists and navigation views, may have been subject to change, and would have required expanding it (and therefore maintaining it) in order to implement various custom behaviors, and complicated the codebase. As the investigation into using React itself proceeded, there were various other architectural, packaging, and maintenance caveats discovered which made us unable to base all UI code on React despite the possibility of having a mobile UI out the gate. However, since React can be added selectively, this may be an option down the road.

React does solve one of the main drawbacks of browser-side development – the option to integrate styling with executable code. (This is, in fact, how UI building is generally done on platforms other than the web.)

In fact, to get as close as possible to the time-tested approach in native UI development, a very lightweight view hierarchy toolkit [1] was written in JS to mimick how UIs are built/managed under imperative object-oriented SDKs such as Apple's UIKit. Instead of Views being backed by CALayers as they are on iOS, they are simply backed by DOM elements. This system has numerous benefits, and was used to quickly reproduce the workhorse components used throughout the app, such as the stack navigation view, modal presentation, tab bar view, lists (tables), etc. [2]. One important difference to remember is that these DOM Views are styled by CSS, which means they do not have a `layoutSubviews` function, as exists on iOS (it would be great to find a way to implement one). 

In some cases, building a standlone module for a component was not justified, and it was either left in instantiators' code (if specific to context) or, if reusable, factored out into a function in the "Common Components" module [3].

In order to facilitate and encourage keeping styles bundled within executable Javascript UI code, utility functions for lazily injecting CSS rules and stylesheets were written [4].

#### Transitioning to native

There are many options for the transition to an all-native mobile UI which are currently under consideration. The plan is to first release a native wrapper version of the app using the existing web-based UI implementation. At that point, the UI may either be moved to native piecemeal based on high value targets, or all in one go.

#### Platform agnosticism / portability

As the goal is to make the web UI immediately runnable on mobile, this means the view code must eventually talk to code objects which interface with Electron-specific services.

For that reason, in all such places, "interface" style base classes have been established, which must be "concretely" implementated per platform. Examples include the system dialog and filesystem UI modules [5]. 

Additionally, it is necessary for code for multiple platforms or for different processes (yet which are within the same domain) to cohabitate within a given module. 

For example, if concurrency under Electron weren't an issue, code could simply use `DocumentPersister.NeDB.js` instead of `BackgroundDocumentPersister.NeDB.electron.js` which has exactly the same interface, meaning consumers don't have to know they're on Electron and use the new version.

Similarly, DOM-only components are given a `.web.js` suffix. This is so that in the future we can implement, for example, an iOS only version of that specific view. (This is another convention borrowed from React Native.)

All of these conventions together enable code to remain organized and connected very modularly.

1. `local_modules/Views/View.web.js`

2. `local_modules/StackNavigation`, `local_modules/TabBarView`, `local_modules/Lists`

3. `local_modules/MMAppUICommonComponents`

4. `local_modules/Views/cssRules.web`

5. `local_modules/WindowDialogs`, `local_modules/FilesystemUI`


## Roadmap

There is no official roadmap for the MyMonero apps, and anyone is free to submit a pull request containing anything of their choice. 

There are however a number of interesting features we are planning to introduce.

* Mobile app for iOS and Android (current priority)

* Binding (via node-gyp in JS) directly to official Monero lib wallet code to so current JS reimplementation may be scrapped, so we automatically keep up-to-date with baseline project's new features and protocol updates, gain performance improvements, etc. 
TODO: add references to node-gyp bindings to Monero code

* Native implementation of mobile UI

* Automatic sync of your metadata across your devices, encrypted by your spend key so we cannot decrypt it

* new b/e, polling -> zmq

* Possibly lmdb

TODO: more… and check icebox


# Contributors

* [Paul Shapiro](https://github.com/paulshapiro) aka `endogenic` (lead client app dev, project maintainer; partner at MyMonero)
* [Riccardo Spagni](https://github.com/fluffypony) aka `fluffyponyza` (tech advisor; lead maintainer of Monero OSS project; partner at MyMonero)
* [Lee Clagett](https://github.com/vtnerd) aka `vtnerd` (lead back-end dev; working on open-sourcing MyMonero b/e!)
* [Matt D Smith](http://mds.is) aka `mds` (v1 designer)
* [luigi1111](https://github.com/luigi1111) aka `luigi1112` (added client-side RingCT support; tech advisor)


----------------------

## License and copyrights

This app's source code and assets are copyright © 2014-2017 by MyMonero, and is released as a free, open-source project under a modified MIT license. All rights reserved.

See `LICENSE.txt` for license.