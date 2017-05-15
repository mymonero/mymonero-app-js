# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Packaging the Desktop App for Production Mode

### Pre-requisites

In order to produce a production build, you must first have installed all of the `electron-builder` required system packages for building apps for the desired platforms. See [electron-builder: Multi Platform Build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).

**Please note:** in order to create a production build for Mac, you must be on a Mac, you'll need an installed Mac developer certificate to sign the build with, and you'll need to edit `package.json` to specify the name of your own certificate signing identity. To do so, edit `package.json` by updating `CSC_NAME` in `scripts.dist` and `scripts.pack` with your identity name, which can be found via Keychain.app.

If you would like to build for only a specific platform, you can edit `package.json` to change occurrences of the argument `-mwl` in `scripts.pack` and `scripts.dist` to contain only the letter of the platform for which you'd like to build. For example, to build for Linux only, change the argument from `-mwl` to `-l`. 

(Just be careful not to commit/submit these changes in any pull requests.)


### Building

In order to actually perform the production build for desktop, execute `bin/package_all_desktop`. 

This command relies upon resources present in `build`, and will output your build products in the directory `dist`.

Please note that MyMonero for Windows is packaged as an NSIS installer, rather than only an .exe (in order to support custom URL scheme registration/opening), and it incorporates a custom installer script fragment, `build/installer.sh`. 

## Building & Packaging the Android Cordova App for Production Mode

The following instructions assume you have already run `init_repo_for_cordova`.

### Android

Specify your keystore information in `./cordova.android.build.json`, such as its path. If necessary, move your keystore file to the specified path.

Then run `bin/package_only_android`.