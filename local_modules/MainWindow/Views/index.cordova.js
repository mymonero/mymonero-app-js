// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/* global StatusBar, device */
//
"use strict"
//
window.BootApp = function()
{ // encased in a function to prevent scope being lost/freed on mobile
	var rootView;
	var context;
	const cached_metadata = {}
	const app = 
	{ // implementing some methods to provide same API as electron
		getVersion: function() { return cached_metadata.app_version },
		getName: function() { return cached_metadata.app_name },
		getDeviceManufacturer: function() { return cached_metadata.deviceManufacturer },
		getPath: function(pathType)
		{
			if (pathType == 'userData') {
				return cached_metadata.userDataAbsoluteFilepath
			}
			throw 'app.getPath(): unrecognized pathType'
		}
	}	
	const isRunningInNonMobileBrowser = window.cordova.platformId == "browser"
	cached_metadata.isRunningInNonMobileBrowser = isRunningInNonMobileBrowser
	//
	if (window.cordova && isRunningInNonMobileBrowser == false) { // Cordova
		document.addEventListener(
			'deviceready', 
			function() { _proceedTo_loadCordovaEnvBeforeLoadingCachedMetadata() }, 
			false
		)
	} else { // Web page, i.e. `cordova serve`
		// mock cached_metadata values for browser-/non-cordova env… probably can be improved
		cached_metadata.isDebug = true
		cached_metadata.deviceManufacturer = "Debug"
		cached_metadata.userDataAbsoluteFilepath = "Debug"
		cached_metadata.app_version = "0.0.1"
		cached_metadata.app_name = "MyMonero"
		cached_metadata.crossPlatform_appBundledAssetsRootPath = "../.." // cause can't access via browser at abs path for some reason
		//
		// patch straight to
		_proceedTo_createContextAndRootView()
	}  
	// Implementations - Setup - Cordova-specific
	function _proceedTo_loadCordovaEnvBeforeLoadingCachedMetadata()
	{
		// just going to pre-emptively fetch whether isDebug before loading main body of metadata
		cordova.plugins.DeviceMeta.getDeviceMeta(function(result)
		{
			cached_metadata.isDebug = result.debug
			cached_metadata.deviceManufacturer = result.manufacturer
			if (cached_metadata.isDebug === true) {
				// this is to give developer chance to open inspector - remove
				navigator.notification.alert(
					"DEBUG MODE: Press OK to load app", 
					_proceedTo_loadAsyncMetaDataBeforeAppSetup,
					"MyMonero", 
					"OK"
				)
			} else {
				_proceedTo_loadAsyncMetaDataBeforeAppSetup()
			}
		})
	}
	function _proceedTo_loadAsyncMetaDataBeforeAppSetup()
	{ // cordova-specific - need to request various info - and they're mostly async, which sucks
		// synchronous fetches:
		cached_metadata.userDataAbsoluteFilepath = cordova.file.dataDirectory//applicationStorageDirectory
		cached_metadata.crossPlatform_appBundledAssetsRootPath = cordova.file.applicationDirectory + "www"
		// asynchronous fetches:
		cordova.getAppVersion.getVersionNumber(function(versionNumber)
		{
			cached_metadata.app_version = versionNumber
			cordova.getAppVersion.getAppName(function(appName)
			{
				cached_metadata.app_name = appName
				_proceedTo_createContextAndRootView()
			})
		})
	}
	// Implementations - Setup - Cordova and Browser/serve
	function _proceedTo_createContextAndRootView()
	{
		const isMobile = cached_metadata.isRunningInNonMobileBrowser !== true
		{
			const setup_utils = require('../../MMAppRendererSetup/renderer_setup.cordova')
			setup_utils({
				appVersion: app.getVersion(),
				reporting_processName: "CordovaWindow"
			})
		}
		{ // context
			context = require('./index_context.cordova').NewHydratedContext({
				app: app,
				isDebug: cached_metadata.isDebug,
				Cordova_isMobile: isMobile,
				crossPlatform_appBundledAssetsRootPath: cached_metadata.crossPlatform_appBundledAssetsRootPath, // in this case, an absolute path.
				platformSpecific_RootTabBarAndContentView: require('./RootTabBarAndContentView.cordova.web'), // slightly messy place to put this (thanks to Cordova port) but it works
				TabBarView_thickness: 48,
				TabBarView_isHorizontalBar: true,
				ThemeController_isMobileBrowser: isMobile == true,
				Tooltips_nonHoveringBehavior: isMobile == true, // be able to dismiss on clicks etc
				Emoji_renderWithNativeEmoji: true,
				appDownloadLink_domainAndPath: "mymonero.com/app",
				Settings_shouldDisplayAboutAppButton: true, // special case - since we don't have a system menu to place it in
				HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false,
				Views_selectivelyEnableMobileRenderingOptimizations: isMobile === true,
				CommonComponents_Forms_scrollToInputOnFocus: isMobile === true
			})
			window.MyMonero_context = context
		}
		if (cached_metadata.isRunningInNonMobileBrowser) { // then we don't have guaranteed native emoji support
			{ // since we're using emoji, now that we have the context, we can call PreLoadAndSetUpEmojiOne
				const emoji_web = require('../../Emoji/emoji_web')
				emoji_web.PreLoadAndSetUpEmojiOne(context)
			}
		}
		{ // configure native UI elements
			StatusBar.overlaysWebView(true)
			// already styled as lightcontent in config.xml
			//
			document.addEventListener("touchstart", function(){}, true) // to allow :active styles to work in your CSS on a page in Mobile Safari:
			//
			if (cached_metadata.isRunningInNonMobileBrowser == false) {
				cordova.plugins.Keyboard.disableScroll(true) // so top of app doesn't scroll out-of-view when keyboard becomes active
			}
			//
			// disable tap -> click delay on mobile browsers
			if (cached_metadata.isRunningInNonMobileBrowser == false) {
				var attachFastClick = require('fastclick')
				attachFastClick.attach(document.body)
			}
			// when window resized on mobile (i.e. possibly when device rotated - 
			// though we don't support that yet
			if (isMobile === true) {
				// if(/Android/.test(navigator.appVersion)) {
				const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
				window.addEventListener("resize", function()
				{
					console.log("💬  Window resized")
					commonComponents_forms.ScrollCurrentFormElementIntoView()
				})
				// }
			}
		}
		{ // when app backgrounded, let's lock down the app
			context.Cordova_disallowLockDownOnAppPause = 0 // initialize for usage
			// ^-- increment and decrement this from the application in order to put a lock on not locking-down.
			// e.g. on filesystem UI operations
			document.addEventListener("pause", function()
			{
				if (context.Cordova_disallowLockDownOnAppPause > 0) {
					console.log("📱  App backgrounded but not going to lock down app as Cordova_disallowLockDownOnAppPause > 0.")
					return
				}
				console.log("📱  App backgrounded.")
				context.passwordController.LockDownAppAndRequirePassword()
			}, false)
		}
		{ // root view
			const RootView = require('./RootView.web') // electron uses .web files as it has a web DOM
			rootView = new RootView({}, context) // hang onto reference
			rootView.superview = null // just to be explicit; however we will set a .superlayer
			// specially accounting for status bar height here…
			if (device.platform === 'iOS' && parseFloat(device.version) >= 7.0) {
				rootView.layer.style.paddingTop = "20px"
				rootView.layer.style.height = "calc(100% - 20px)"
			}
			// manually attach the rootView to the DOM and specify view's usual managed reference(s)
			const superlayer = document.body
			rootView.superlayer = superlayer
			superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
		}
	}
}
window.BootApp()