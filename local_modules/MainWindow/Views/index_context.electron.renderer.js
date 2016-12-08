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
		module_path: __dirname + "/../../Passwords/PasswordController",
		instance_key: "passwordController",
		options: {
			// TODO: transition this to .emits and imperatives(?)
			obtainPasswordFromUser_wOptlValidationErrMsg_cb: function(passwordController, obtainedErrOrPwAndType_cb, showingValidationErrMsg_orUndefined)
			{
				if (typeof showingValidationErrMsg_orUndefined !== 'undefined') {
					console.log("Password entry validation error:", showingValidationErrMsg_orUndefined)
				}
				var errToPassBack = null // use err if user cancelled - err will cancel the pw change
				var obtained_passwordString;
				var obtained_typeOfPassword;
				// TODO: obtain PW from UI
				obtained_passwordString = "a much stronger password than before"
				obtained_typeOfPassword = passwordController.AvailableUserSelectableTypesOfPassword().FreeformStringPW
				obtainedErrOrPwAndType_cb(
					errToPassBack,
					obtained_passwordString,
					obtained_typeOfPassword
				)
			},
			didSetFirstPasswordDuringThisRuntime_cb: function(passwordController, password)
			{
			},
			didChangePassword_cb: function(passwordController, password)
			{
				// TODO: broadcast this instead and observe in wallets list and contacts list
				console.log("TODO: passwordController didChangePassword_cb; inform wallet + contact lists")
			}
		}
	},
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
]
function NewHydratedContext(app, document_cryptor__background)
{
	var initialContext =
	{
		app: app,
		document_cryptor__background: document_cryptor__background,
		userDataAbsoluteFilepath: app.getPath('userData')
	}

	return require("../../runtime_context/runtime_context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext