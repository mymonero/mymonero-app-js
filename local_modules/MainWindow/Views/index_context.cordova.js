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
function NewHydratedContext(initialContext)
{
	initialContext = initialContext || {}
	const app = initialContext.app
	if (!app) {
		throw "app required"
	}
	//
	const APIResponseParser = require('../../HostedMoneroAPIClient/APIResponseParser.cordova.main')
	// placing context_object_instantiation_descriptions in here so we can get the console opened in time to catch any errors (sigh)
	var context_object_instantiation_descriptions =
	[
		// using module+require instead of module_path+string b/c browserify/webpack can't handle dynamic requires
		{
			module: require("../../URLOpening/URLOpeningController.cordova"),
			instance_key: "urlOpeningController",
			options: {}
		},
		{
			module: require("../../URLBrowser/URLBrowser.cordova"),
			instance_key: "urlBrowser",
			options: {}
		},
		{ // ios etc don't have menus, so this is just a stub so the root tab bar can include menuController observations
			module: require("../../Menus/MenuController_Stub.cordova"),
			instance_key: "menuController",
			options: {}
		},
		{
			module: require("../../Pasteboard/Pasteboard.cordova"),
			instance_key: "pasteboard",
			options: {}
		},
		{
			module: require("../../FilesystemUI/FilesystemUI.cordova"),
			instance_key: "filesystemUI",
			options: {}
		},
		{
			module: require("../../WindowDialogs/WindowDialogs.cordova"),
			instance_key: "windowDialogs",
			options: {}
		},
		//
		// services
		{
			module: require("../../Locale/Locale.cordova"),
			instance_key: "locale",
			options: {}
		},
		{ // is not actually background, at the moment
			module: require("../../symmetric_cryptor/BackgroundDocumentCryptor.cordova.main"),
			instance_key: "document_cryptor__background",
			options: {}
		},
		{
			module: require("../../DocumentPersister/DocumentPersister.Files"),
			instance_key: "persister",
			options: {
				userDataAbsoluteFilepath: app.getPath('userData'),
				fs: require('../../DocumentPersister/fs_shim.cordova.js')
			}
		},
		{
			module: require("../../HostedMoneroAPIClient/HostedMoneroAPIClient"),
			instance_key: "hostedMoneroAPIClient",
			options: {
				appUserAgent_product: app.getName(),
				appUserAgent_version: app.getVersion(),
				responseParser: new APIResponseParser({}),
				request_conformant_module: require('xhr')
			}
		},
		{
			module: require("../../OpenAlias/OpenAliasResolver"),
			instance_key: "openAliasResolver",
			options: {}
		},
		{
			module: require("../../Theme/ThemeController"),
			instance_key: "themeController",
			options: {}
		},
		//
		// app controllers
		{
			module: require("../../Passwords/Controllers/PasswordController"),
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
			module: require("../../WalletsList/Controllers/WalletsListController"),
			instance_key: "walletsListController",
			options: {}
		},
		{
			module: require("../../RequestFunds/Controllers/FundsRequestsListController"),
			instance_key: "fundsRequestsListController",
			options: {}
		},
		{
			module: require("../../Contacts/Controllers/ContactsListController"),
			instance_key: "contactsListController",
			options: {}
		},
		{
			module: require("../../WalletAppCoordinator/WalletAppCoordinator"),
			instance_key: "walletAppCoordinator",
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