# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png_ "Logo")

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
