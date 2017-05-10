# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Cordova Installation Notes

For full instructions on running the Cordova builds, please refer back to the [Readme](./README.md).

### System Requirements

 * Latest Android Studio/cli tools

### Android Notes

[Cordova: Android - 'dev' - Installing the Requirements](https://cordova.apache.org/docs/en/dev/guide/platforms/android/index.html#installing-the-requirements)

* **Note that this link goes to 'dev', not 'latest', as the 'latest' version appears to point to out-dated documentation.**

Cordova requires you to make various locations available via your PATH variable.

* Your shell configuration file, e.g. `.bash_profile` on MacOS, might be amended like so:

	```
	export JAVA_HOME="$(/usr/libexec/java_home)"
	export ANDROID_HOME="$HOME/Library/Android/sdk"
	export PATH="$PATH:$JAVA_HOME:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
	```
 
* How to find `android_path`: 
	* http://stackoverflow.com/questions/34532063/finding-android-sdk-on-mac-and-adding-to-path

* Gradle installation notes:
	* https://forum.ionicframework.com/t/error-could-not-find-gradle-wrapper-within-android-sdk-might-need-to-update-yo-ur-android-sdk/22056/22
	* http://stackoverflow.com/questions/42613882/error-could-not-find-gradle-wrapper-within-android-sdk-might-need-to-update-yo/42797817#42797817

* *(Coming soon)* Signing info will be removed from public repo via this process:
	* https://developer.android.com/studio/publish/app-signing.html#secure-key



