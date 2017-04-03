# MyMonero Desktop & Mobile Apps

![Logo](./docs/assets/logo.png "Logo")

## What's in This Repo?

This repository holds the source code, resources, and build scripts for the official [MyMonero](https://www.mymonero.com) downloadable desktop and mobile apps.

## What is MyMonero?

MyMonero is a very simple, secure, and featureful way to use the next-generation private digital currency called [Monero](http://www.getmonero.org). 

The MyMonero app lets you manage your Monero wallets, address book, and transactions by storing your information locally and keeping it encrypted. 

The main reason people have used MyMonero is its high degree of convenience. 

To accomplish this convenience and other features of MyMonero, there's the privacy trade-off of sharing your Monero "view key" with the MyMonero server, so that it can scan the network for your wallets' transactions. However, it's impossible for MyMonero to spend any of your funds or otherwise access your metadata, because your "spend key" and "private seed" are never sent to our server. So MyMonero is often described as a 'non-custodial' service. In fact, in the near future, even the above trade-off will be eliminated as we're presently working to open-source a version of the back-end, which anybody can run as their own server at home.

MyMonero is currently available for Mac, Windows, and Linux – with mobile clients on the way.

![Welcome to MyMonero! Let's get started.](./docs/assets/ss_1.png_ "Welcome to MyMonero! Let's get started.")


## Features

The desktop app supports:

* Multiple wallets at a time

* Contacts address book

* Deep OpenAlias integration (use domain or email instead of long Monero address)

* Creating QR codes and messages to request Monero be sent to you

* Sending money to contacts, OpenAlias, or other Monero addresses (these may be input manually, or automatically by either dropping a request QR code on the Send screen or clicking a `monero:…` request URL on MacOS or Windows)

* Settings (for clearing data, managing preferences such as idle timeout, etc.)

* Strong (AES256) encryption to password protect all sensitive user data 

* Improved UX, including informative tooltips

* Auto-update (coming soon via Github Releases)


## Requirements

The desktop app is built on [Electron](https://electron.atom.io) and can be packaged for and is intended to run on modern versions of:

* MacOS (.app)
* Windows (installer)
* Linux (.appimage) - pkg manager repos under consideration

## Downloads

Download the latest version from our website at [mymonero.com/desktop](https://www.mymonero.com/desktop) or from the Releases tab. *(Coming soon)* 

To get set up with the source code, please see **Getting the Source Code** below.


## Reporting Bugs & Making Feature Requests

If you would like to report an issue or share a feature request, please create a Github Issue on this project.

If you're reporting a bug, be sure to include all information which we would need to reproduce the issue, such as the operating system and app version on which you saw the bug, and the steps you took, if you can tell. 

For customer support, you can also [contact](https://mymonero.com/support) us directly.

# Contributing & Testing


## Getting the Source Code

1. Clone or otherwise download this repository. Then, in your terminal, `cd` into the repo directory.

2. (If you are going to make changes) Switch to the `develop` branch by executing `git checkout develop`.

3. Install all dependencies by executing `npm install`.


## Repository Contents
* Executable scripts for common tasks are located in `bin/`

* Local, application source code is located in `local_modules/`. This includes bundled/static third-party "Vendor" libraries such as [EmojiOne](http://emojione.com).

* After installation, non-bundled third-party modules (such as Electron) will be located in `node_modules/`.

* App package and build process info is located in `package.json`.

* This readme is located at `README.md`, and the license is located at `LICENSE.txt`.


## Building for Production

Unless you are a MyMonero pre-release tester, you will probably never need to produce a production build of MyMonero, especially as you want to be using a verified build of MyMonero for daily usage. However, if you're testing a pre-release version of this app, you may want to build a production-ready version of the app rather than only running it in dev mode. 

See [Building the app for production](./docs/PRODUCTION_BUILDS.md) for information.


## Running in Development Mode

Testing in development mode does not require you to package, sign, and install the app, and will cause the Developer window to be shown.

To launch the desktop app in dev mode, run `bin/start_dev_desktop`.


## Contributing

Contributions by way of [pull request](https://help.github.com/articles/about-pull-requests/) are very welcome, and you will be credited below if your PR is accepted.

If you would like to contribute, please read the [technology notes](./docs/TECHNOLOGY.md) in order to find information on libraries used, the reasons behind various architectural choices, and how to write tests. 

Feel free to create a Github issue if you find any areas of the code which could use more explanation, or if you'd like to discuss improvements, report bugs, or ask non-support development/testing-only questions. Questions about the MyMonero technology or how to use the app should generally be asked either on StackExchange, reddit, IRC, or by contacting customer support.

For background on this project, see [Why We Built the Native Apps](./docs/WHY_NATIVE.md).

There is no specific code styleguide yet, but we ask that code contributions…

* are kept modular or well factored, either platform-agnostic or with platform specified (see [Technology Notes](./docs/TECHNOLOGY.md)),
* are written in a clear, understandable, [simple](https://www.infoq.com/presentations/Simple-Made-Easy), and maintainable manner, 
* employ best practices, and 
* are well tested and don't break anything, especially security.

Aside from that, almost everything is fair game.

You may also like to read the unofficial [Technology Roadmap](./docs/ROADMAP.md) to get a peek at what we're thinking about for the future.

There's also an icebox of ideas, features, improvements, known issues, and other todos waiting to be knocked out. (Link coming soon)


## MyMonero Core Contributors

All contributors are credited in release notes.

MyMonero Core Contributors are those who either work on MyMonero full-time or who have made ongoing and/or critical contributions to the MyMonero app.

* 🏂 [Paul Shapiro](https://github.com/paulshapiro) `endogenic` – Project maintainer; Lead client app developer; Partner

* 🦄 [Riccardo Spagni](https://github.com/fluffypony) `fluffyponyza` – Advisor; Partner; [Monero](http://www.getmonero.org) project core member

* 😎 [Lee Clagett](https://github.com/vtnerd) `vtnerd` – Lead back-end developer

* 🔥 [Matt D Smith](http://mds.is) `mds` – v1/MVP app designer

* 🍄 [luigi1111](https://github.com/luigi1111) `luigi1112` – Monero tech advisor; Built client-side RingCT support

* 🌠 Your name here?

## License and Copyrights

See `LICENSE.txt` for license.

All app source code and assets copyright © 2014-2017 by MyMonero. All rights reserved.
