# MyMonero Desktop

<p align="center">
  <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 17.648C0 7.90128 7.43852 0 16.6257 0H133.374C142.556 0 150 7.90602 150 17.648V132.352C150 142.099 142.561 150 133.374 150H16.6257C7.4436 150 0 142.094 0 132.352V17.648Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M35.4404 100.954C35.4404 103.754 37.6404 105.954 40.4404 105.954C43.2404 105.954 45.5071 103.754 45.5071 100.954V77.7544L54.3738 91.4211C55.4404 93.0211 56.7738 94.0211 58.6404 94.0211C60.5071 94.0211 61.8404 93.0211 62.9071 91.4211L71.9071 77.5544V100.821C71.9071 103.621 74.1738 105.954 76.9738 105.954C79.8404 105.954 82.1071 103.688 82.1071 100.821V63.7544C82.1071 60.8878 79.8404 58.6211 76.9738 58.6211H75.8404C73.7738 58.6211 72.3071 59.4878 71.2404 61.2211L58.7738 81.4878L46.3738 61.2878C45.4404 59.7544 43.9071 58.6211 41.7071 58.6211H40.5738C37.7071 58.6211 35.4404 60.8878 35.4404 63.7544V100.954Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M80.9104 100.954V77.7544L89.777 91.4211C90.8437 93.0211 92.177 94.0211 94.0437 94.0211C95.9103 94.0211 97.2437 93.0211 98.3103 91.4211L107.31 77.5544V100.821C107.31 103.621 109.577 105.954 112.377 105.954C115.244 105.954 117.51 103.688 117.51 100.821V63.7544C117.51 60.8878 115.244 58.6211 112.377 58.6211H111.244C109.177 58.6211 107.71 59.4878 106.644 61.2211L94.177 81.4878L81.777 61.2878C80.8437 59.7544 79.3104 58.6211 77.1104 58.6211C77.1104 58.6211 80.9104 103.754 80.9104 100.954Z" fill="white"/>
<path d="M14.0625 23.4375C14.0625 18.2598 18.2598 14.0625 23.4375 14.0625H126.563C131.74 14.0625 135.938 18.2598 135.938 23.4375V23.4375H14.0625V23.4375Z" fill="#00BDF4"/>
</svg>
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