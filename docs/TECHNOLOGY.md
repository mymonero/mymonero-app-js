# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Technology Notes

### Initial Scope

In brief review, the general requirements for the first release of the desktop app were that it:

* could run cross-platform,

* reproduced at least the functionality of the existing web wallet,

* could store arbitrary encrypted structured data locally,

* kept local data up-to-date with the server's,

* would facilitate things like swapping out the service provider (or at least the host), and potentially supporting multiple currencies in the future,

* (similarly) could be understood, built on top of, expanded, changed, and maintained as a long-lived codebase with a minimum of debt, complexity, and growth in entropy, 

* allowed us to actually release a minimum-viable app as quickly as possible (in natural tension with previous point), and that it

* could be easily turned into a downloadable mobile app, most preferably with a native UI.

### "Cross platform"

In order to avoid rewriting the same app (and its UI) across Mac, Windows, and Linux, we opted to use Electron. Electron is basically a Node.JS runtime, plus libraries to expose native system services, plus Chrome browser windows for custom UI.

While providing many upsides, this had the obvious downside that we had to build all of our UI components from scratch – or at least out of existing web components. Electron also meant building the app in Javascript.

React and React Native were considered in depth, and are discussed below.

### "Reproduced functionality of existing web wallet"

The web wallet was built entirely upon a now-aging version of Angular, which means almost all application objects were built in the Angular style. Borrowing almost any of the functionality would have required a dependency on Angular. Angular was removed as a dependency, resulting in the natural choice to factor business logic into vanilla JS encapsulated modules with simple public interfaces [see 1, 2]. 

A 'context' object, which references top-level application controllers, is constructed and passed to application object constructors as a form of dependency injection [3]. The work to port existing functionality also included clarifications to codepaths like transaction construction in send-funds operations. Additionally, many of the dependency scripts in the web wallet needed to be exposed as importable JS modules. 

Note that the wallet mnemonic generation in the desktop version is now implemented through the Node.JS crypto library's `randomBytes` function. This might be changed back to the browser function.

1. `local_modules/Wallets`, `local_modules/OpenAlias`

2. `local_modules/runtime_context` and implementors in `electron_main` and `MainWindow`

3. `local_modules/mymonero_libapp_js`


### "Store arbitrary encrypted structured data locally"

#### Database Choice

SQLite was considered as an embedded database but we opted for [NeDB](https://github.com/louischatriot/nedb) instead as it is JS-only and has a familiar document-based interface, a natural match for Javascript [1]. But during Developer Preview testing, NeDB presented data corruption issues, leading us to implement a file-based data persistence solution. 

#### Concurrency
In an Electron app, there is the main process, and then one process for each browser window you spawn. IPC is the method to communicate between them. If any long-running work is performed on a thread, it will block the associated UI. For example, blocking the main thread blocks the entire app. Blocking a browser process blocks the entire window, including its web contents. It was discovered that database operations blocked the process upon which they were run. For that reason concurrency was implemented by way of an abstraction over spawning a child process and performing IPC with it [2].

#### Password-Protection

**(SEEKING COMMUNITY AUDIT)** In order to accomplish password-protection, we developed a symmetric key encryption library for strings and JSON documents, which is currently based on the Node.JS crypto library and [RNCryptor](http://rncryptor.github.io)/[JSCryptor](https://github.com/chesstrian/JSCryptor) [3]. 

**Note** that under Cordova (mobile JS app), which has been implemented to prepare `./www` via [webpack](http://webpack.js.org) (see [Cordova Installation Notes](./CORDOVA_INSTALL.md)), the `crypto` lib is automatically shimmed to another browser-friendly implementation. [4]

Encrypting at database (de)serialization-time was investigated but revealed to be a non-starter for a various reasons. Instead, the database doesn't know about the encryption, and consumers are also responsible for responding to and handling events such as password changes.

On idle timeout, the in-memory decrypted data / runtime is torn down, primarily as a security feature. Once the user enters their password, the runtime is reconstructed [5]. 

1. `local_modules/DocumentPersister`

2. `local_modules/Concurrency`, `local_modules/BackgroundDocumentPersister.Files.(child, electron).js`

3. `local_modules/symmetric_cryptor`

4. https://mixmax.com/blog/requiring-node-builtins-with-webpack

5. `local_modules/Passwords`, `local_modules/UserIdle`, `local_modules/WalletsList`, `local_modules/Contacts`, `local_modules/RequestFunds`

### "Kept local data up-to-date"

The `Wallets` code currently polls for updates to account info, scan heights, transactions, etc. [1], but we're working on an effective rebuild of the back-end which will allow us to use a real-time connection for data sync (see Roadmap).

All API calls (such as submitting a constructed transaction for a send-funds operation) are done via an HTTP client [2] which is instantiated in the renderer process (rather than main) and which uses the `xhr` module, to get support for different network configurations via the browser.

1. `local_modules/Wallets/Controllers/WalletHostPollingController.js`

2. `local_modules/HostedMoneroAPIClient`


### "Could be easily turned into a native mobile app"

#### Language considerations

Being able to have a single codebase for all platforms is the obvious ideal, but such a system doesn't appear to exist yet… at least not in any sufficiently supported manner. 

Aiming for a fully native codebase was definitely considered, but would have taken too long as a first step. 

#### React vs Angular vs … vs Vanilla JS

To end up with a fully native UI on mobile, we carefully considered React and React Native, but reluctantly were not able to choose them. Initially, we knew Electron needed web output, rather than the native UI we wanted for mobile. However, React and React Native template code is not the same. So out of the gate, it was no longer a single-write solution - but actually a higher level language. To use a single codebase, in theory, it was discovered we could write the UI in React Native code first, and then use a library called [React Native for Web](https://github.com/necolas/react-native-web) to compile it to web output for Electron. Unfortunately, as of late last year when this was being evaluated, that project was not official, didn't have proper support for lists and navigation views, may have been subject to change, and would have required expanding it (and therefore maintaining it) in order to implement various custom behaviors, and complicated the codebase. As the investigation into using React itself proceeded, there were various other architectural, packaging, and maintenance caveats discovered. These caveats together made us unable to choose to base all UI code on React at the outset of the project, despite the possibility of having a native mobile UI available very quickly. We have re-evaluated React and React Native at the time of last updating these notes but have decided to go straight to native.

React definitely *does* solve what has been one of the main drawbacks of browser-side development – the fragmentation of templating (HTML), styling & layout (CSS), and executable code (JS), by providing the options to integrate styling and element markup within executable code. (This is, in fact, how UI building is generally done on platforms other than the web, e.g. UIKit.)

To accomplish the same benefit, Paul opted instead for the approach found in native UI development and wrote a very lightweight view class in JS [1] to mimick how UIs are built in Apple's UIKit. The main difference in API is that iOS Views are backed by CALayers, whereas these are simply backed by DOM elements, referred to as their `layer`s. This approach had numerous benefits, and was used to quickly reproduce the workhorse components used throughout the app, such as the navigation, tab bar, lists (tables) & cells, etc. [2]. One important difference to remember is that these DOM Views are styled by CSS, which means they do not have a `layoutSubviews` function, as exists on iOS. (It might be great to find a way to implement one, though, if it were low-enough level.) 

In many cases while building reusable components for the MyMonero wallet app UI, it wasn't justified to create a standlone `local_modules/` module or a standalone View-class-exporting file. In which cases, such components were either left in their instantiators' code (if their functions were specific to their instantiators' domains) or, if reusable, factored out into a factory function in a file in the "Common Components" module [3].

In order to facilitate and encourage keeping styles bundled within executable Javascript UI code, a small utility library for lazily injecting CSS rules and stylesheets was written [4].

1. `local_modules/Views/View.web.js`

2. `local_modules/StackNavigation`, `local_modules/TabBarView`, `local_modules/Lists`

3. `local_modules/MMAppUICommonComponents`

4. `local_modules/Views/cssRules.web`

#### Transitioning to Native

Aside from React Native, there were many options for the transition to an all-native mobile UI which were under consideration. 

For more technical, strategy, and timing notes of our move to native mobile apps, please see the [Technology Roadmap](./ROADMAP.md).

#### Platform-agnosticism & Portability

The same web UI code which is to be run under Cordova must, when run under Electron, eventually talk to code objects which interface with Electron-implemented services. Similarly, when run under Cordova, the same code must be able to talk to Cordova-implemented services.

To solve this, in certain locations, platform-agnostic "interface" style base classes have been established, which must be "concretely" implementated per platform (so that platform does not need to be known by consumers). Examples include the system dialog and filesystem UI modules [1]. It is also necessary for code for different platforms or for different Electron processes (yet which are within the same architecture domain) to cohabitate within a given module. 

For example, if concurrency under Electron weren't an issue, the MainWindow context would simply instantiate `DocumentPersister.Files.js` instead of `BackgroundDocumentPersister.Files.electron.js` (the latter has exactly the same interface, meaning consumers don't have to know they're on Electron to get Electron-compatible concurrency).

Similarly, DOM-only View and web component files are given a `.web.js` suffix. 

All of these conventions taken together, in addition to concrete and precise code name semantics, contribute to enable the code to remain modular and flexible.

1. `local_modules/WindowDialogs`, `local_modules/FilesystemUI`

#### Poor Performance Under Cordova

As of the time of writing, performance under Cordova is less than ideal.

A few days have been put into instrumenting and then optimizing performance, and a handful of remaining performance improvement tasks and suggested directions have been placed into the [Issues](https://github.com/mymonero/monero-app-js/issues) tracker.

Of note was the disabling or (in the case of wallet icons) replacement of `box-shadow` / gradient-heavy DOM elements, controlled by special flags on the `context` object.

Additional information about progress and remaining targets in the ongoing Cordova app optimization effort can be found on issues [#63](https://github.com/mymonero/mymonero-app-js/issues/63), [#76](https://github.com/mymonero/mymonero-app-js/issues/76).

#### Cordova build directory structure & intermediate products

The `www` folder is reserved for Cordova, and it is said to be very stubborn about moved to a different location. So some scripts in `bin` scripts are called during the build sequence which assemble that directory.

Another script exists in `cordova_res` for preparing all the icon and launch image variations.  


## Tests

[Mocha](https://mochajs.org) has been chosen as the framework for writing unit and integration tests.

Under Electron, integration testing is done with Mocha via the [Spectron](https://github.com/electron/spectron) framework.

These frameworks are installed as dev dependencies of the project. 

### Test Coverage

At present, only manual / custom tests have been written, which are out-dated and should not be relied upon. Unit tests are structured such that they reside within a subdirectly of the module they are testing. Integration tests may require their own modules if no suitable home is found. All tests which are platform-specific should have their filenames suffixed with the platform, like app code files.

Help is wanted writing integration and unit tests, especially now that the APIs for most modules is becoming fairly stable. However, tests were not written until now as it can often become wasted effort to write and maintain tests for app components which are in significant flux. For this reason we expect to write many more tests after a few months have passed. However, keeping that caveat in mind, we will greatly appreciate any contributions to increase the amount of test coverage, especially on the more stable, business-logic-centric, and critical modules such as Wallet, Passwords, etc.