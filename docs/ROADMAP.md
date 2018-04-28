# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Technology Roadmap

There is no official roadmap for the MyMonero apps, and anyone is free to submit a pull request containing anything of their choice. 

There are, however, a number of interesting features we are planning to introduce. This list is not exhaustive and is not necessarily ordered.
	
* **In progress by vtnerd** Complete overhaul of back-end, and replacement of polling with sweet push-based synchronization (Issue [#46](https://github.com/mymonero/mymonero-app-js/issues/46))

* Automatic sync of a user's metadata across the user's devices, encrypted by their spend key(s) (i.e. keyring) so server cannot decrypt it (Issue [#54](https://github.com/mymonero/mymonero-app-js/issues/54))

* Finalizing and implementing the Contact payment ID problem solution (Issue [#10](https://github.com/mymonero/mymonero-app-js/issues/10))

* Automatic association of incoming transactions with Contacts (Issues [#55](https://github.com/mymonero/mymonero-app-js/issues/55), [#54](https://github.com/mymonero/mymonero-app-js/issues/54), et al.)

* Automated tests - help wanted - see [Technology Notes - Testing](./TECHNOLOGY.md)

* (Possibly) [Automated Electron builds via Travis & Appveyor, etc. server](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build)

* Ledger integration (Issue [#60](https://github.com/mymonero/mymonero-app-js/issues/60))

* [Kovri](https://github.com/monero-project/kovri) integration