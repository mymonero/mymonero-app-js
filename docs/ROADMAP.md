# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Technology Roadmap

There is no official roadmap for the MyMonero apps, and anyone is free to submit a pull request containing anything of their choice. 

There are, however, a number of interesting features we are planning to introduce. This list is not exhaustive and is not necessarily ordered.
	
* **Imminent** Native implementation of mobile UI; Idea is to create a kind of MoneroJS bridge by using [JavaScriptCore](https://developer.apple.com/reference/javascriptcore) (on iOS) and [LiquidCore](https://github.com/LiquidPlayer/LiquidCore) (on Android; formerly AndroidJSCore) to easily port and expose a stable native interface to `monero_utils` so that the Monero/Cryptonote core doesn't have to be re-implemented or accessed via libmonero/native bindings before we would be able to release mostly-native apps. We anticipate this will provide significant performance and UX boosts to the mobile apps. 
	* Potential timeline for implementation of a native UI iOS client is very near-term (native iOS code is easy). So the thinking at the moment is that we will publish the current Cordova-based app to the Google Play Store for Android first, and possibly wait a few weeks to launch the iOS app until it is built natively with the above MoneroJS bridge. There are a handful of benefits to going straight to native app code on iOS.

* *(Possibly after necessary library-fication work done on `wallet2.cpp`, libmonero, …)* Binding (via node-gyp in JS) directly to official Monero lib wallet code (Issue [#52](https://github.com/mymonero/mymonero-app-js/issues/52)), so that we can:
	* scrap the current JS reimplementation of Monero, including emscripten-compiled CryptoNote utils, 
	
	* automatically keep up-to-date with baseline project's new features and protocol updates, and
	
	* gain performance improvements, etc. 
	
* **In progress by vtnerd** Complete overhaul of back-end, and replacement of polling with sweet push-based synchronization (Issue [#46](https://github.com/mymonero/mymonero-app-js/issues/46))

* Automatic sync of a user's metadata across the user's devices, encrypted by their spend key(s) (i.e. keyring) so server cannot decrypt it (Issue [#54](https://github.com/mymonero/mymonero-app-js/issues/54))

* Finalizing and implementing the Contact payment ID problem solution (Issue [#10](https://github.com/mymonero/mymonero-app-js/issues/10))

* Automatic association of incoming transactions with Contacts (Issues [#55](https://github.com/mymonero/mymonero-app-js/issues/55), [#54](https://github.com/mymonero/mymonero-app-js/issues/54), et al.)

* Automated tests - help wanted - see [Technology Notes - Testing](./TECHNOLOGY.md)

* (Possibly) [Automated Electron builds via Travis & Appveyor, etc. server](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build)

* Ledger integration (Issue [#60](https://github.com/mymonero/mymonero-app-js/issues/60))
