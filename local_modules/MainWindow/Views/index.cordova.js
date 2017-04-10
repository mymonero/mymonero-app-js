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
"use strict"
window.BootApp = function()
{ // encased in a functino to prevent scope being lost on mobile
	//
	// const setup_utils = require('../../renderer_utils/setup.cordova')
	// setup_utils({
	// 	reporting_processName: "MainWindow"
	// })
	//
	var rootView;
	var context;
	const cached_metadata = {}
	const app = 
	{ // implementing some methods to provide same API as electron
		getVersion: function() { return cached_metadata.app_version },
		getName: function() { return cached_metadata.app_name },
		getDeviceManufacturer: function() { return cached_metadata.deviceManufacturer },
		getIsDebug: function() { return cached_metadata.isDebug },
		getPath: function(pathType)
		{
			if (pathType == 'userData') {
				return cached_metadata.userDataAbsoluteFilepath
			}
			throw 'app.getPath(): unrecognized pathType'
		}
	}
	console.log("window.cordova.platformId" , window.cordova.platformId)
	if (window.cordova && window.cordova.platformId != "browser") { // Cordova
		document.addEventListener(
			'deviceready', 
			function() { _proceedTo_loadCordovaEnvBeforeLoadingCachedMetadata() }, 
			false
		)
	} else { // Web page, i.e. `cordova serve`
		// mock cached_metadata values for browser-/non-cordova env… probably can be improved
		cached_metadata.isDebug = true
		cached_metadata.deviceManufacturer = "Debug"
		cached_metadata.userDataAbsoluteFilepath = "./Debug"
		cached_metadata.app_version = "0.0.1"
		cached_metadata.app_name = "MyMonero"
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
				alert("Press OK to load app") // this is to give developer chance to open inspector - remove
				// after short delay so alert actually done(?)
				setTimeout(function() { _proceedTo_loadAsyncMetaDataBeforeAppSetup() }, 500)
			} else {
				_proceedTo_loadAsyncMetaDataBeforeAppSetup()
			}
		})
	}
	function _proceedTo_loadAsyncMetaDataBeforeAppSetup()
	{ // cordova-specific - need to request various info - and they're mostly async, which sucks
		cached_metadata.userDataAbsoluteFilepath = cordova.file.applicationStorageDirectory
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
		console.log("_proceedTo_setupApp")
		{ // context
			context = require('./index_context.cordova').NewHydratedContext(app)
		}
		{ // root view
			const RootView = require('./RootView.web') // electron uses .web files as it has a web DOM
			rootView = new RootView({}, context) // hang onto reference
			rootView.superview = null // just to be explicit; however we will set a .superlayer
			// manually attach the rootView to the DOM and specify view's usual managed reference(s)
			const superlayer = document.body
			rootView.superlayer = superlayer
			superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
		}
	}
}
window.BootApp()