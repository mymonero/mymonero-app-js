# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png "Logo")

## Cordova Installation Notes

For full instructions on running the Cordova builds, please refer back to the [Readme](./README.md).

### System Requirements

 * Latest Xcode
 * Latest Android Studio/cli tools

### iOS Notes

[Cordova: iOS - Installing the Requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#installing-the-requirements)

For running the app in Debug mode on the Simulator:

* `brew install ios-sim`

* In Safari, you may need to enable the Develop menu

* You may need to select Simulator > iPhone > Use for development

#### Device Builds

For running the app in Debug mode on your device:

* `npm install -g ios-deploy`

* You may need to open the Xcode `.xcworkspace` file and select your development team in the Project.


* If you get the error "Unable to mount developer disk image", it may be related to [issue #221 on `phonegap/ios-deploy`](https://github.com/phonegap/ios-deploy/issues/221) or, possibly more likely, that your device is locked, and that it must be unlocked while `ios-deploy` is trying to deploy the app to it.

* You may need to approve your team or certificate on your testing device in Settings.app -> General -> Profiles

* Signing info for iOS device builds can be specified in the file `cordova.ios.build.json`, but it is redacted from this repo via gitignore. An example is provided (`….build.EXAMPLE.json`) and the live file (`….build.json`) is produced so it is ready for you to edit by having called `setup_repo_for_cordova`. 


### Android Notes

[Cordova: Android - Installing the Requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/android/#installing-the-requirements)


Cordova requires you to make various locations available via your PATH variable.
 
* How to find `android_path`: 
	* http://stackoverflow.com/questions/34532063/finding-android-sdk-on-mac-and-adding-to-path

* Gradle installation notes:
	* https://forum.ionicframework.com/t/error-could-not-find-gradle-wrapper-within-android-sdk-might-need-to-update-yo-ur-android-sdk/22056/22
	* http://stackoverflow.com/questions/42613882/error-could-not-find-gradle-wrapper-within-android-sdk-might-need-to-update-yo/42797817#42797817


*(Coming soon)*

* Signing info will be removed from public repo via this process:
	* https://developer.android.com/studio/publish/app-signing.html#secure-key



