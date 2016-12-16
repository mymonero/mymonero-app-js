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

"use strict"
//
// Hydrate context
var context_object_instantiation_descriptions =
[
	{
		module_path: __dirname + "/../../NeDBPersister/NeDBPersister",
		instance_key: "persister",
		options: {}
	},
	{
		module_path: __dirname + "/../../HostedMoneroAPIClient/HostedMoneroAPIClient",
		instance_key: "hostedMoneroAPIClient",
		options: {}
	},
	{
		module_path: __dirname + "/../../Passwords/Controllers/PasswordController",
		instance_key: "passwordController",
		options: {}
	},
	//
	// The following should go after the passwordController, persister, etc
	{
		module_path: __dirname + "/../../WalletsList/Controllers/WalletsListController",
		instance_key: "walletsListController",
		options: {}
	},
	{
		module_path: __dirname + "/../../Contacts/Controllers/ContactsListController",
		instance_key: "contactsListController",
		options: {}
	},
	//
	{ // Silly as it sounds, this class exists to integrate the main process menuController with event 
  	  // emissions from the renderer side so that integratees can remain able to operate independently.
		module_path: __dirname + "/../../Menus/MenuControllerController.renderer",
		instance_key: "menuControllerController", // we/you probably won't need to access this ever though
		options: {}
	},
]
function NewHydratedContext(
	app, 
	document_cryptor__background, 
	menuController
)
{
	var initialContext =
	{
		app: app,
		document_cryptor__background: document_cryptor__background,
		menuController: menuController,
		userDataAbsoluteFilepath: app.getPath('userData')
	}

	return require("../../runtime_context/runtime_context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext