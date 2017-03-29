# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png "Logo")

## Technology Roadmap

There is no official roadmap for the MyMonero apps, and anyone is free to submit a pull request containing anything of their choice. 

There are, however, a number of interesting features we are planning to introduce. This list is not exhaustive and is not necessarily ordered.

* Mobile app for iOS and Android (current priority)

* (Possibly after necessary work on `wallet2.cpp`) Binding (via node-gyp in JS) directly to official Monero lib wallet code [1], so that we can:
	* scrap the current JS reimplementation of Monero, including emscripten-compiled CryptoNote utils, 
	
	* automatically keep up-to-date with baseline project's new features and protocol updates, and
	
	* gain performance improvements, etc. 
	
* Native implementation of mobile UI

* Automatic sync of your metadata across your devices, encrypted by your spend keys (i.e. keyring) so we cannot decrypt it

* **In progress** Complete overhaul of back-end, and replacement of polling with sweet push-based synchronization

* Possibly replace NeDB with LMDB

* Automated tests

* Automatic association of incoming transactions with Contacts

* Ledger integration

--

1. Native/compiled Monero binding

* http://www.benfarrell.com/2013/01/03/c-and-node-js-an-unholy-combination-but-oh-so-right/

* https://github.com/fancoder/node-cryptonote-util/tree/master/src

* https://github.com/Snipa22/node-cryptonote-util/tree/xmr-Nan-2.0

* https://github.com/zone117x/node-multi-hashing

* (example integration) https://github.com/M5M400/node-cryptonote-util/compare/xmr-Nan-2.0...Snipa22:xmr-Nan-2.0
