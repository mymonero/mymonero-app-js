<p align="center">
  <img alt="MyMonero" src="https://user-images.githubusercontent.com/1645428/146000939-b06f8fd3-9ed2-4a5e-bdd6-3981281dde9c.png">
</p>

<p align="center">
  MyMonero Desktop
</p>

## Packaging the Desktop App for Production Mode

### General Pre-requisites

In order to produce a production build, you must first have installed all of the `electron-builder` required system packages for building apps for the desired platforms. See [electron-builder](https://www.electron.build/).

Would suggest electron-builder be installed globally.

**Please note:** in order to create a production build for Mac, you must be on a Mac, you'll need an installed Mac developer certificate to sign the build with, and you'll need to copy `electron-builder.env.example` to `electron-builder.env`.  to specify the name of your own certificate signing identity. To do so, edit `electron-builder.env` by updating `CSC_NAME` with your identity name, which can be found via Keychain.app.


### Builds

Builds require that you have done `npm install` and have electron-builder installed globally on your system.

Currently the MyMonero builds are done on MacOS with [parallels desktop pro edition](https://www.parallels.com/products/desktop/pro/) this is to allow the hardware certificate signing of the windows build. This is not required if you run the commands in windows yourself.

For MacOS builds you can run the following:
`electron-builder -m`

For Linux you can run the following:
`electron-builder -l`

For Windows x64 you can run the following:
`electron-builder -w --x64`

For Windows ia32 you can run the following:
`electron-builder -w --ia32`

MyMonero releases are done as follows:

MacOS and linux builds can be done at the same time. the binaries are published to GitHub under a draft release.

`electron-builder -ml -p always`

Windows builds for both 32bit and 64 bit can be done at the same time. They are required to be seperate from the Linux releases as adding the --ia32 flag will try build a 32 bit linux version which does not work.

`electron-builder -w --ia32 --x64 -p always`

SHA256 values are generated for the local build files.

`(cd dist/ ; for i in *.*; do shasum -a 256 "$i" ; done)`

Once release has been published the release is gpg signed.

This is done via downloading the zipped archive. cant be downloaded with Safari as it automatically unzips the folder.

`gpg --armor --detach-sign mymonero-app-js-1.x.xx.tar.gz`

This produces the .asc file which is then uploaded and added to the release