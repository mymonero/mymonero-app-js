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
"use strict"
//
const TXTRecordResolver = require("../../OpenAlias/TXTResolver.web")
const txtRecordResolver = new TXTRecordResolver({})
function NewHydratedContext(initialContext)
{
	initialContext = initialContext || {}
	const app = initialContext.app
	if (!app) {
		throw "app required"
	}
	//
	// placing context_object_instantiation_descriptions in here so we can get the console opened in time to catch any errors (sigh)
	var context_object_instantiation_descriptions =
	[
		// using module+require instead of module_path+string b/c browserify/webpack can't handle dynamic requires
		{
			module: require("../../Pasteboard/Pasteboard.browser"),
			instance_key: "pasteboard",
			options: {}
		},
		{
			module: require("../../URLBrowser/URLBrowser.browser"),
			instance_key: "urlBrowser",
			options: {}
		},
		{
			module: require("../../FilesystemUI/FilesystemUI.browser"),
			instance_key: "filesystemUI",
			options: {}
		},
		{
			module: require("../../WindowDialogs/WindowDialogs.browser"),
			instance_key: "windowDialogs",
			options: {}
		},
		//
		// services
		{
			module: require("../../CcyConversionRates/Controller"),
			instance_key: "CcyConversionRates_Controller_shared",
			options: {}
		},
		{
			module: require("../../Locale/Locale.browser"),
			instance_key: "locale",
			options: {}
		},
		{ // is not actually background, at the moment
			module: require("../../symmetric_cryptor/BackgroundStringCryptor.noOp"),
			instance_key: "string_cryptor__background",
			options: {}
		},
		{
			module: require("../../DocumentPersister/DocumentPersister.InMemory"),
			instance_key: "persister",
			options: {
			}
		},
		{
			module: require("../../HostedMoneroAPIClient/BackgroundResponseParser.web"),
			instance_key: "backgroundAPIResponseParser",
			options: {
				coreBridge_instance: initialContext.monero_utils // the same as coreBridge_instance
			}
		},
		{
			module: require("../../HostedMoneroAPIClient/HostedMoneroAPIClient.Lite"),
			instance_key: "hostedMoneroAPIClient",
			options: {
				appUserAgent_product: app.getName(),
				appUserAgent_version: app.getVersion(),
				request_conformant_module: require('xhr') 
			}
		},
		{
			module: require("../../OpenAlias/OpenAliasResolver"),
			instance_key: "openAliasResolver",
			options: {
				txtRecordResolver: txtRecordResolver
			}
		},
		{
			module: require("../../Theme/ThemeController"),
			instance_key: "themeController",
			options: {}
		},
		//
		// app controllers
		{
			module: require("../../Passwords/Controllers/PasswordController.Lite"),
			instance_key: "passwordController",
			options: {}
		},
		{
			module: require("../../Settings/Controllers/SettingsController"),
			instance_key: "settingsController",
			options: {}
		},
		{
			module: require("../../UserIdle/UserIdleInWindowController"),
			instance_key: "userIdleInWindowController",
			options: {}
		},
		// The following should go after the passwordController, persister, etc
		{
			module: require("../../WalletsList/Controllers/WalletsListController.Lite"),
			instance_key: "walletsListController",
			options: {}
		},
		{
			module: require("../../WalletAppCoordinator/WalletAppCoordinator"),
			instance_key: "walletAppCoordinator",
			options: {}
		},
		{
			module: require("../Controllers/ExceptionAlerting.browser.web.js"),
			instance_key: "exceptionAlerting",
			options: {}
		}
	]	
	//
	return require("../../runtime_context/runtime_context").NewHydratedContext(
		context_object_instantiation_descriptions, 
		initialContext
	)
}
module.exports.NewHydratedContext = NewHydratedContext