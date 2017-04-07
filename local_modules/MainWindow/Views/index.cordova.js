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
//
// const setup_utils = require('../../renderer_utils/setup.cordova')
// setup_utils({
// 	reporting_processName: "MainWindow"
// })
//
var rootView;
var context;
var app_version;
var app_name;
var userDataAbsolutePath;
var app = 
{ // implementing some methods to provide same API as electron
	getVersion: function()
	{
		return app_version
	},
	getName: function()
	{
		return app_name
	},
	getPath: function(pathType)
	{
		if (pathType != 'userData') {
			throw 'app.getPath(): unrecognized pathType'
		}
		return "TODO"
	}
}
document.addEventListener(
	'deviceready', 
	function()
	{
		alert("app ready") // this is to give developer chance to open inspector - remove
		
		// cordova-specific - need to request various info - and it's async, which kinda sucks
		cordova.getAppVersion.getVersionNumber(function(versionNumber)
		{
			app_version = versionNumber
			cordova.getAppVersion.getAppName(function(appName)
			{
				app_name = appName
				// TODO: get/set userDataAbsoluteFilepath on app
				_proceedTo_setupApp()
			})
		})
	}, 
	false
)
// Setup
function _proceedTo_setupApp()
{
	console.log("_proceedTo_setupApp app" , app)
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