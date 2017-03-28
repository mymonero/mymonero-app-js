# MyMonero Desktop & Mobile Apps

![Logo](./docs/assets/logo.png_ "Logo")

## What's in this repo?

This repository holds the source code, resources, and build scripts for the official [MyMonero](https://www.mymonero.com) downloadable desktop and mobile apps.

## What is MyMonero?

MyMonero is a very simple, safe, and featureful way to use the next-generation private digital currency called [Monero](http://www.getmonero.org). 

The MyMonero app lets you securely manage your Monero wallets, address book, and transactions by storing most information locally and keeping it encrypted. 

The major benefit of using MyMonero is it handles almost all of the work that Monero users must do themselves in order to use their Monero wallets.

In exchange for the convenience and features made possible by MyMonero, there is the minor privacy trade-off of sharing your Monero "view key" with the MyMonero server, so that it can scan the network for your wallets' transactions. However, it's impossible for MyMonero to spend any of your funds or otherwise access your metadata, as all of the rest of your information is either never sent to our server, or its encrypted with information only you have. So MyMonero is often described as "non-custodial of your private keys", unlike so many other services. 

(However, even the above trade-off of sharing your view key with the MyMonero server will soon be eliminated, as we are presently working to open-source a version of the back-end which anybody can run as their own server at home.)

![Welcome to MyMonero! Let's get started.](./docs/assets/ss_1.png_ "Welcome to MyMonero! Let's get started.")


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


## Building for production

Unless you are a MyMonero pre-release tester you will probably never need produce a production build of MyMonero, especially as you want to be using a verified build of MyMonero for daily usage. However, if you're testing a pre-release version of this app, you may want to build a production-ready version of the app rather than only running it in dev mode. 

See [Building the app for production](./docs/PRODUCTION_BUILDS.md) for information.


## Contributing

Contributions by way of [pull request](https://help.github.com/articles/about-pull-requests/) are quite welcome. 

If you would like to contribute, please read the [architecture notes](./docs/ARCHITECTURE.md) in order to familiarize yourself with the reasons behind the current structure. 

Feel free to create a Github issue if you find any areas of the code which could use explanation or if you'd like to discuss improvements, report bugs, or ask non-support, developer-only questions.

You may also like to read the unofficial [roadmap](./docs/ROADMAP.md) to get a picture of our thoughts for the future.

There's also an icebox of ideas and todos waiting to be knocked out.


## Contributors

* 🏂 [Paul Shapiro](https://github.com/paulshapiro) aka `endogenic`
	* Lead client app dev, project maintainer; Partner

* 🦄 [Riccardo Spagni](https://github.com/fluffypony) aka `fluffyponyza` 
	* Advisor; Partner; Lead maintainer of [Monero](http://www.getmonero.org)

* 😎 [Lee Clagett](https://github.com/vtnerd) aka `vtnerd`
	* Lead back-end dev

* 🔥 [Matt D Smith](http://mds.is) aka `mds`
	* v1/MVP designer

* 🍄 [luigi1111](https://github.com/luigi1111) aka `luigi1112`
	* Monero tech advisor; Added RingCT support to client

 

## License and copyrights

This app's source code and assets are copyright © 2014-2017 by MyMonero, and is released as a free, open-source project under a modified MIT license. All rights reserved.

See `LICENSE.txt` for license.