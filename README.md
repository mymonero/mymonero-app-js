<p align="center">
  <img alt="MyMonero" src="https://user-images.githubusercontent.com/1645428/146000939-b06f8fd3-9ed2-4a5e-bdd6-3981281dde9c.png">
</p>

<p align="center">
  MyMonero Desktop
</p>

The simplest way to use the next-generation private digital currency Monero, at the sweet spot between security, convenience, and features

-----
### Contents

1. Downloads
1. Requirements & Install Locations
1. Reporting Bugs & Making Feature Requests
1. Installation
1. Building for Production
1. Running in Development Mode
1. Contributing
1. Acknowledgements
1. License and Copyrights
-----
## Downloads

Download the latest version from our website at [mymonero.com](https://www.mymonero.com) or from the [Releases tab](https://github.com/mymonero/mymonero-app-js/releases/latest).

Developers and pre-release testers who would like to use and work on the app can run it by obtaining the source and running one of the build commands below.

To get set up with the source code, please see **Getting the Source Code** below.

## Requirements & Install Locations

The desktop app is built on [Electron](https://www.electronjs.org/) and can be packaged to run on modern versions of:

* MacOS (.app)
* Windows (installer .exe)
* Linux (.appimage)

### Where is user data saved?

* Desktop: See Electron's [`app.getPath('userData')`](https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname)


## Reporting Bugs & Making Feature Requests

If you would like to report an issue or share a feature request, please create a Github [Issue](https://github.com/mymonero/monero-app-js/issues) on this project.

If you're reporting a bug, be sure to include all information which we would need to reproduce the issue, such as the operating system and app version on which you saw the bug, and the steps you took, if you can tell. 

 Please contact us via [contact us](https://mymonero.com/support) for general support and enquiries. Please only use the Issues tracker when you believe you've encountered a bug.

## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

Clone the repo and install the dependencies.
```bash
git clone https://github.com/mymonero/mymonero-app-js.git
cd mymonero-app-js
```
```bash
npm install
```

To start the desktop wallet, run the following
```bash
npm start
```

## Building for Production

If you're testing a pre-release version of this app and need to verify its behavior in production mode or want to obtain an installable release bundle, see [Packaging the App for Production Mode](./docs/PRODUCTION_BUILDS.md).

## Running in Development Mode

*Does not require you to package, sign, and install the app, and will cause the Developer window to be shown. Certain features, such as URL opening under MacOS, require production build.*

```bash
npm run dev
```

## Contributing

### Testing

Please submit any bugs as Issues unless they have already been reported.

Suggestions and feedback are very welcome!


### Developing

If you have an improvement to the codebase and would like to have your code shipped in the production MyMonero app, please submit a [pull request](https://help.github.com/articles/about-pull-requests/), even if it's still a WIP. We try to credit all contributors in app release notes.

Before contributing, please spend a few moments scanning the [technology notes](./docs/TECHNOLOGY.md) to learn about libraries used, reasons behind some architectural choices, and more.

* Merging PRs which involve integrating with any third-party services will require discussion and agreement.  

* We reserve the right to refuse to merge any PRs, such as those which introduce breaking changes.

The maintainer enjoys collaborating with volunteer contributors to the MyMonero apps over IRC private message and the #mymonero room on freenode.net (Come say hello!), so PR'd submissions do not have to be at all complete or perfect on their first submission. (To submit a draft PR for review, simply mark it as '[DO NOT MERGE]')

For background on this project, see [Why We Built the Native Apps](./docs/WHY_NATIVE.md).

You may also like to read the unofficial [Technology Roadmap](./docs/ROADMAP.md) to get a peek at what we're thinking about for the future.

There's also an icebox of ideas, features, improvements, known issues, and other todos waiting to be knocked out which are kept in the [Issues](https://github.com/mymonero/monero-app-js/issues) tracker.


### Donating

MyMonero Donation Address (XMR): 48yi8KBxh7fdZzwnX2kFCGALRcN1sNjwBHDfd5i9WLAWKs7G9rVbXNnbJTqZhhZCiudVtaMJKrXxmBeBR9kggBXr8X7PxPT

Proceeds from donations are used to fund development on the MyMonero back-end server (a performant version of which we soon™ plan to open-source for anyone to run their own server at home). Any remaining funds will go towards product (app UI) R&D, and hosting costs.



## Acknowledgements

Contributors to each release are credited in release notes.

### Core Contributors

* 🍕 `Tekkzbadger` ([Devin Pearson](https://github.com/devinpearson)) Lead maintainer; core developer

* 💱 `j_karlos` ([Karl Buys](https://github.com/karlbuys)) Maintainer; core developer

* 🦄 `fluffyponyza` ([Riccardo Spagni](https://github.com/fluffypony)) Advisor; MyMonero founder; Monero core team member

* 🏂 `endogenic` ([Paul Shapiro](https://github.com/paulshapiro)) Former core maintainer; MyMonero core contributor

* 😎 `vtnerd` ([Lee Clagett](https://github.com/vtnerd)) Lead back-end developer

* 🍄 `luigi` Monero tech advisor; Main MyMonero JS core crypto contributor

* 🔥 `mds` ([Matt Smith](http://mds.is)) MVP designer

* 🌠 Your name here?

## License and Copyrights

See `LICENSE.txt` for license.

All app source code and assets copyright © 2014-2021 by MyMonero. All rights reserved.
