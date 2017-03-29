# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png "Logo")

## Architecture notes

### Initial Scope

In brief review, the general requirements for the v1 desktop app were that it…

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

While providing many upshots, this had the obvious downside that we had to build all of our UI components from scratch – or at least out of existing web components. Electron also meant building the app in Javascript.

React and React Native were considered in depth, and are discussed below.

### "Reproduced functionality of existing web wallet"

The web wallet was built entirely upon a now-aging version of Angular, which means almost all application objects were built in the Angular style. Borrowing most any of the functionality would have required an Angular dependency. Angular was removed as a dependency, resulting in the natural choice to factor business logic into vanilla JS encapsulated modules with simple public interfaces [see 1, 2]. 

A 'context' object, which references top-level application controllers, is constructed and passed to application object constructors as a form of dependency injection [3]. The work to port existing functionality also included clarifications to codepaths like transaction construction in send-funds operations. Additionally, many of the dependency scripts in the web wallet needed to be exposed as importable JS modules. 

Note that the wallet mnemonic generation in the desktop version is now implemented through the Node.JS crypto library's `randomBytes` function [4]. This might be changed back to the browser function.

1. `local_modules/Wallets`, `local_modules/OpenAlias`

2. `local_modules/runtime_context` and implementors in `electron_main` and `MainWindow`

3. `local_modules/monero_utils`, `local_modules/cryptonote_utils`

4. `local_modules/cryptonote_utils/mnemonic.js` 

### "Store arbitrary encrypted structured data locally"

#### Database Choice

SQLite was considered as an embedded database but we opted for [NeDB](https://github.com/louischatriot/nedb) instead as it is JS-only and has a familiar document-based interface, a natural match for Javascript [1]. LMDB was not known of initially but may be very interesting later.

#### Concurrency
In an Electron app, there is the main process, and then one process for each browser window you spawn. IPC is the method to communicate between them. If any long-running work is performed on a thread it will block the associated UI. For example, blocking the main thread blocks the entire app. Blocking a browser process blocks the entire window, including its web contents. It was discovered that database operations blocked the thread upon which they were run. For that reason concurrency was implemented by way of an abstraction over spawning a child process and performing IPC with it [2].

#### Password-Protection

**(Seeking community audit.)** In order to accomplish password-protection we developed string and JSON document symmetric key encryption utilities, which are currently based on Node.JS crypto library and [RNCryptor](http://rncryptor.github.io)/[JSCryptor](https://github.com/chesstrian/JSCryptor) [3]. 

Encrypting at database (de)serialization-time was investigated but revealed to be a non-starter for a various reasons. Instead, the database doesn't know about the encryption, and consumers are also responsible for responding to and handling events such as password changes.

On idle timeout, the in-memory decrypted data / runtime is torn down, primarily as a security feature. Once the user enters their password, the runtime is reconstructed [4]. 

1. `local_modules/DocumentPersister`

2. `local_modules/electron_background`, `local_modules/BackgroundDocumentPersister.NeDB.(child, electron).js`

3. `local_modules/symmetric_cryptor`

4. `local_modules/Passwords`, `local_modules/UserIdle`, `local_modules/WalletsList`, `local_modules/Contacts`, `local_modules/RequestFunds`

### "Kept local data up-to-date"

The Wallets code currently polls for updates to account info, scan heights, transactions, etc. [1] but we're working on an effective rebuild of the back-end which will allow us to use a real-time connection for data sync (see Roadmap).

All API calls (such as submitting a constructed transaction for a send-funds operation) are done via an HTTP client [2] which is instantiated in the renderer process (rather than main) and which uses the `xhr` module, to get support for different network configurations via the browser.

1. `local_modules/Wallets/Controllers/WalletHostPollingController.js`

2. `local_modules/HostedMoneroAPIClient`


### "Could be easily turned into a native mobile app"

#### Language considerations

Single codebase for all platforms is the obvious ideal, but it doesn't appear to exist yet… at least not in any sufficiently supported manner. 

Fully native codebase was definitely considered, but would have taken too long as a first step. 


#### React vs Angular vs … vs Vanilla JS

For the UI, in order to be able to generate a fully native UI on mobile, React and React Native were seriously considered, but reluctantly not able to be chosen. Initially, we knew Electron needed web output, rather than the native UI we wanted for mobile. However, React and React Native template code is not the same. So out of the gate, it was no longer a single-write solution - but actually a higher level language. To use a single codebase, in theory, it was discovered we could write the UI in React Native code first, and then use a library called [React Native for Web](https://github.com/necolas/react-native-web) to compile it to web output for Electron. Unfortunately, as of late last year when this was being evaluated, that project was not official, didn't have proper support for lists and navigation views, may have been subject to change, and would have required expanding it (and therefore maintaining it) in order to implement various custom behaviors, and complicated the codebase. As the investigation into using React itself proceeded, there were various other architectural, packaging, and maintenance caveats discovered which made us unable to base all UI code on React despite the possibility of having a mobile UI out the gate, especially as similar, same, or better performance may be possible imperatively. React *does* solve one of the main drawbacks of browser-side development – the fragmentation of templating, styling, and executable code, by providing the options to integrate styling and element markup within executable code. (This is, in fact, how UI building is generally done on platforms other than the web.)

To accomplish the same benefit, the developer opted instead for the approach found in native UI development and wrote a very lightweight view class in JS [1] to mimick how UIs are built in Apple's UIKit. The main difference in API is that iOS Views are backed by CALayers, whereas these are simply backed by DOM elements, referred to as their `layer`s. This approach had numerous benefits, and was used to quickly reproduce the workhorse components used throughout the app, such as the navigation, tab bar, lists (tables) & cells, etc. [2]. One important difference to remember is that these DOM Views are styled by CSS, which means they do not have a `layoutSubviews` function, as exists on iOS (it might be great to find a way to implement one, if it were low-enough level). 

In many cases while building reusable components for the MyMonero wallet app UI, building a standlone `local_modules/` module or a standalone View-class-exporting file was not justified. In which cases, such components were either left in their instantiators' code (if their functions were specific to their instantiators' domains) or, if reusable, factored out into a factory function in a file in the "Common Components" module [3].

In order to facilitate and encourage keeping styles bundled within executable Javascript UI code, a small utility library for lazily injecting CSS rules and stylesheets was written [4].

1. `local_modules/Views/View.web.js`

2. `local_modules/StackNavigation`, `local_modules/TabBarView`, `local_modules/Lists`

3. `local_modules/MMAppUICommonComponents`

4. `local_modules/Views/cssRules.web`

#### Transitioning to native

There are many options for the transition to an all-native mobile UI which are currently under consideration. The plan is to first release a native wrapper version of the app using the existing web-based UI implementation. At that point, the UI may either be moved to native piecemeal based on high value targets, or all in one go.

#### Platform-agnosticism & Portability

The same View code which is to be run on mobile must, when run under Electron, eventually talk to code objects which interface with Electron-specific services.

To solve this, in certain locations, platform-agnostic "interface" style base classes have been established, which must be "concretely" implementated per platform (so that platform does not need to be known by consumers). Examples include the system dialog and filesystem UI modules [1]. 

It is also necessary for code for different platforms or for different Electron processes (yet which are within the same domain) to cohabitate within a given module. For example, if concurrency under Electron weren't an issue, the MainWindow context would simply instantiate `DocumentPersister.NeDB.js` instead of `BackgroundDocumentPersister.NeDB.electron.js` (the latter has exactly the same interface, meaning consumers don't have to know they're on Electron to get Electron-compatible concurrency).

Similarly, DOM-only View and  components are given a `.web.js` suffix. This is so that in the future we can implement, for example, an iOS only version of that specific view. (This is another convention borrowed from React Native.)

All of these conventions taken together have enabled the code to remain modular and flexible.

1. `local_modules/WindowDialogs`, `local_modules/FilesystemUI`

