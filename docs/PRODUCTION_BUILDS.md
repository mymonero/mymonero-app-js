# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Packaging the Desktop App for Production Mode

### General Pre-requisites

In order to produce a production build, you must first have installed all of the `electron-builder` required system packages for building apps for the desired platforms. See [electron-builder: Multi Platform Build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).

**Please note:** in order to create a production build for Mac, you must be on a Mac, you'll need an installed Mac developer certificate to sign the build with, and you'll need to edit `package.json` to specify the name of your own certificate signing identity. To do so, edit `package.json` by updating `CSC_NAME` in `scripts.dist` and `scripts.pack` with your identity name, which can be found via Keychain.app.


### Builds

In order to actually perform the production build for desktop, execute `bin/build_and_pack__(win,mac,linux,browser)`. 

This command relies upon resources present in `build`, and will output your build products in the directory `dist`.

Please note that MyMonero for Windows is packaged as an NSIS installer, rather than only an .exe (in order to support custom URL scheme registration/opening), and it incorporates a custom installer script fragment, `build/installer.sh`. 


### Building for Windows 

Windows builds with `electron-builder` have occasionally encountered issues related to `wine`, such as `winedevice.exe` crashes.

To circumvent this you may find it helpful to install `docker`, then run `bin/runDockerForBuild__win`.

Then within the docker machine:

1. `npm install`

2. `bin/build_and_pack__win` -OR- `DEBUG=electron-builder npm run-script dist-w`

The Windows build products will be in the shared `dist` directory.
