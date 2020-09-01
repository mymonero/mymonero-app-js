// Copyright (c) 2014-2019, MyMonero.com
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
	const isDebug = false
	const app = 
	{ // implementing some methods to provide same API as electron
		getVersion: function() 
		{ 
			return "1.1.13" // TODO: read from config.. don't want to ship package.json with app though
		},
		getName: function() 
		{ 
			return "MyMonero"
		},
		getDeviceManufacturer: function() { 
			throw 'app.getDeviceManufacturer(): Unsupported platform'
		},
		getPath: function(pathType)
		{
			throw 'app.getPath(): Unsupported platform'
		}
	}	
	//
	var isTouchDevice = ('ontouchstart' in document.documentElement);
	const isMobile = isTouchDevice // an approximation for 'mobile'
	//
	const setup_utils = require('../../MMAppRendererSetup/renderer_setup.browser')
	setup_utils({
		appVersion: app.getVersion(),
		reporting_processName: "BrowserWindow"
	})
	//
	// context
	var isHorizontalBar = isMobile;
	require('../../mymonero_libapp_js/libapp_js/MyMoneroLibAppBridge')({}).then(function(coreBridge_instance) // we can just use this directly in the browser version
	{
		const context = require('../Models/index_context.browser').NewHydratedContext({
			nettype: require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/nettype').network_type.MAINNET, // critical setting
			app: app,
			isDebug: isDebug,
			isLiteApp: true, // used sparingly for to disable (but not redact) functionality
			isRunningInBrowser: true, // categorically
			isMobile: isMobile,
			Cordova_isMobile: false, // (this can be renamed or maybe deprecated)
			crossPlatform_appBundledIndexRelativeAssetsRootPath: "",
			crossPlatform_indexContextRelativeAssetsRootPathSuffix: "../../", // b/c index_context is in MainWindow/Views; must end up /
			platformSpecific_RootTabBarAndContentView: require('./RootTabBarAndContentView.browser.web'), // slightly messy place to put this but it works
			TabBarView_thickness: isHorizontalBar ? 48 : 79,
			rootViewFooterHeight: 32,
			TabBarView_isHorizontalBar: isHorizontalBar,
			ThemeController_isMobileBrowser: isMobile == true,
			Tooltips_nonHoveringBehavior: isMobile == true, // be able to dismiss on clicks etc
			Emoji_renderWithNativeEmoji: isMobile == true, // b/c this is a browser, we could be on desktop, i.e. w/o guaranteed native emoji support
			// TODO: detect if Mac … if so, render w/o native emoji (need holistic fallback solution though - see Gitlab post referenced by https://github.com/mymonero/mymonero-app-js/issues/194)
			//
			appDownloadLink_domainAndPath: "mymonero.com",
			Settings_shouldDisplayAboutAppButton: true, // special case - since we don't have a system menu to place it in
			HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false,
			Views_selectivelyEnableMobileRenderingOptimizations: isMobile === true,
			CommonComponents_Forms_scrollToInputOnFocus: isMobile === true,
			monero_utils: coreBridge_instance
		})
		window.MyMonero_context = context
		//
		if (isMobile == false) { // then we don't have guaranteed native emoji support
			{ // since we're using emoji, now that we have the context, we can call PreLoadAndSetUpEmojiOne
				const emoji_web = require('../../Emoji/emoji_web')
				emoji_web.PreLoadAndSetUpEmojiOne(context)
			}
		}
		{ // configure native UI elements
			document.addEventListener("touchstart", function(){}, true) // to allow :active styles to work in your CSS on a page in Mobile Safari:
			//
			if (isMobile) {
				// disable tap -> click delay on mobile browsers
				var attachFastClick = require('fastclick')
				attachFastClick.attach(document.body)
				//
				// when window resized on mobile (i.e. possibly when device rotated - 
				// though we don't support that yet
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
		{ // root view
			const RootView = require('../Views/RootView.Lite.web') // electron uses .web files as it has a web DOM
			const rootView = new RootView({}, context) // hang onto reference
			rootView.superview = null // just to be explicit; however we will set a .superlayer
			// manually attach the rootView to the DOM and specify view's usual managed reference(s)
			const superlayer = document.body
			rootView.superlayer = superlayer
			superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
		}
		{ // and remove the loader (possibly fade this out)
			const el = document.getElementById("loading-spinner")
			el.parentNode.removeChild(el)
		}
	}).catch(function(e)
	{
		throw e
	});
}
window.BootApp()