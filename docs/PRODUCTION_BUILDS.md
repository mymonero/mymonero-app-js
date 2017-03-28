# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png_ "Logo")

## Building the app for production

In order to produce a production build, you must first have installed all of the `electron-builder` required system packages for building apps. See [electron-builder: Multi Platform Build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).

Please note: in order to create a production build for Mac, you must be on a Mac, and you'll need an installed Mac developer certificate to sign the build with, and you will need to edit `package.json` to specify the name of your certificate signing identity. To do so, update `CSC_NAME` in `scripts.dist` and `scripts.pack` with your identity name, which can be found via Keychain.app.

If you would like to build for only a specific platform, you must edit `package.json` to change occurrences of the argument `-mwl` in `scripts.pack` and `scripts.dist` to contain only the letter of the platform for which you'd like to build. For example, to build for Linux only, change the argument from `-mwl` to `-l`. 

In order to actually initiate the build for all desktop platforms, execute `bin/build_all_desktop`. 

This command relies upon resources present in `build`, and will output your build products in the directory `dist`.

Please note that MyMonero for Windows prepares an NSIS installer, rather than only an .exe, in order to support custom URL scheme registration/opening, and incorporates a custom installer script fragment, `build/installer.sh`. 