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
const instantiation_description__hostedMoneroAPIClient =
{ // this one is broken out so we can configure options with `app` object once we have it
	module_path: __dirname + "/../../HostedMoneroAPIClient/HostedMoneroAPIClient.Full",
	instance_key: "hostedMoneroAPIClient",
	options: {
		request_conformant_module: require('xhr')
	}
}
const TXTRecordResolver = require(__dirname + "/../../OpenAlias/TXTResolver.electron.renderer")
const txtRecordResolver = new TXTRecordResolver({})
//
var context_object_instantiation_descriptions =
[
	{ // might as well put it in the renderer proc so we don't have to do IPC to pasteboard
		module_path: __dirname + "/../../Pasteboard/Pasteboard.electron",
		instance_key: "pasteboard",
		options: {}
	},
	{
		module_path: __dirname + "/../../FilesystemUI/FilesystemUI.electron",
		instance_key: "filesystemUI",
		options: {}
	},
	{
		module_path: __dirname + "/../../WindowDialogs/WindowDialogs.electron",
		instance_key: "windowDialogs",
		options: {}
	},	
	{
		module_path: __dirname + "/../../URLBrowser/URLBrowser.electron",
		instance_key: "urlBrowser",
		options: {}
	},
	//
	// services
	{
		module_path: __dirname + "/../../CcyConversionRates/Controller",
		instance_key: "CcyConversionRates_Controller_shared",
		options: {}
	},
	{
		module_path: __dirname + "/../../Locale/Locale.electron",
		instance_key: "locale",
		options: {}
	},
	{
		module_path: __dirname + "/../../symmetric_cryptor/BackgroundStringCryptor.electron",
		instance_key: "string_cryptor__background",
		options: {}
	},
	{
		module_path: __dirname + "/../../DocumentPersister/BackgroundDocumentPersister.Files.electron",
		instance_key: "persister",
		options: {}
	},
	{
		module_path: __dirname + "/../../HostedMoneroAPIClient/BackgroundResponseParser.electron.renderer",
		instance_key: "backgroundAPIResponseParser",
		options: {}
	},
	instantiation_description__hostedMoneroAPIClient,
	{ // depends upon txtRecordResolver ... maybe inject
		module_path: __dirname + "/../../OpenAlias/OpenAliasResolver",
		instance_key: "openAliasResolver",
		options: {
			txtRecordResolver: txtRecordResolver
		}
	},
	{
		module_path: __dirname + "/../../Theme/ThemeController",
		instance_key: "themeController",
		options: {}
	},
	//
	// app controllers
	{
		module_path: __dirname + "/../../Passwords/Controllers/PasswordController.Full",
		instance_key: "passwordController",
		options: {}
	},
	{
		module_path: __dirname + "/../../Settings/Controllers/SettingsController",
		instance_key: "settingsController",
		options: {}
	},
	{
		module_path: __dirname + "/../../UserIdle/UserIdleInWindowController",
		instance_key: "userIdleInWindowController",
		options: {}
	},
	// The following should go after the passwordController, persister, etc
	{
		module_path: __dirname + "/../../WalletsList/Controllers/WalletsListController.Full",
		instance_key: "walletsListController",
		options: {}
	},
	{
		module_path: __dirname + "/../../RequestFunds/Controllers/FundsRequestsListController",
		instance_key: "fundsRequestsListController",
		options: {}
	},
	{
		module_path: __dirname + "/../../Contacts/Controllers/ContactsListController",
		instance_key: "contactsListController",
		options: {}
	},
	{
		module_path: __dirname + "/../../WalletAppCoordinator/WalletAppCoordinator",
		instance_key: "walletAppCoordinator",
		options: {}
	},
	{
		module_path: __dirname + "/../../URLOpening/URLOpeningCoordinator.web",
		instance_key: "urlOpeningCoordinator",
		options: {}
	},
	//
	{ // Silly as it sounds, this class exists to integrate the main process menuController with event emissions from the renderer side so that integratees can remain able to operate independently.
		module_path: __dirname + "/../../Menus/MenuControllerController.renderer",
		instance_key: "menuControllerController", // probably won't need to access this ever though
		options: {}
	},
	{
		module_path: __dirname + "/../../AppUpdates/AppUpdatesBridgeToMain.electron.renderer",
		instance_key: "appUpdatesBridgeToMain", // probably won't need to access this ever though
		options: {}
	}
]
function NewHydratedContext(
	app, 
	menuController,
	urlOpeningController,
	appUpdatesController,
	monero_utils
) {
	var initialContext =
	{
		nettype: require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/nettype').network_type.MAINNET, // critical setting
		app: app,
		menuController: menuController,
		appUpdatesController: appUpdatesController,
		urlOpeningController: urlOpeningController,
		userDataAbsoluteFilepath: app.getPath('userData'),
		isDebug: process.env.NODE_ENV === 'development',
		crossPlatform_appBundledIndexRelativeAssetsRootPath: "../../", // must have trailing /
		platformSpecific_RootTabBarAndContentView: require('../Views/RootTabBarAndContentView.electron.web'), // slightly messy place to put this (thanks to Cordova port) but it works
		TabBarView_thickness: 79,
		rootViewFooterHeight: 0, // because we're not implementing any footer in Desktop mode
		TabBarView_isHorizontalBar: false,
		appDownloadLink_domainAndPath: "mymonero.com",
		HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false && process.env.NODE_ENV === 'development',
		monero_utils: monero_utils
	}
	// required options (which can only be obtained with `app`, etc.)
	instantiation_description__hostedMoneroAPIClient.options.appUserAgent_product = app.getName()
	instantiation_description__hostedMoneroAPIClient.options.appUserAgent_version = app.getVersion()	
	//
	return require("../../runtime_context/runtime_context").NewHydratedContext(
		context_object_instantiation_descriptions, 
		initialContext
	)
}
module.exports.NewHydratedContext = NewHydratedContext