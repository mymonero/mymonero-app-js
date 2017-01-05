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
const tests_config = require('./tests_config.js')
if (typeof tests_config === 'undefined' || tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/WalletsList/Tests/walletsListController/ in order to run this test.")
	process.exit(1)
	return
}
//
// Hydrate context
var context_object_instantiation_descriptions =
[
	{
		module_path: __dirname + "/../../../HostedMoneroAPIClient/HostedMoneroAPIClient",
		instance_key: "hostedMoneroAPIClient",
		options: {}
	},
	{
		module_path: __dirname + "/../../../DocumentPersister/DocumentPersister.NeDB",
		instance_key: "persister",
		options: {
			userDataAbsoluteFilepath: "./test_products"
		}
	},
	{
		module_path: __dirname + "/../../../symmetric_cryptor/BackgroundDocumentCryptor.interfaceForTests",
		instance_key: "document_cryptor__background",
		options: {}
	},
	{
		module_path: __dirname + "/../../../Passwords/Controllers/PasswordController",
		instance_key: "passwordController",
		options: {}
	}
]
function NewHydratedContext()
{
	var initialContext =
	{
	}
	const context = require("../../../runtime_context/runtime_context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
	startObserving_passwordController(context)
	//
	return context
}
module.exports.NewHydratedContext = NewHydratedContext
//
function startObserving_passwordController(context)
{
	const controller = context.passwordController
	//
	const password = tests_config.persistencePassword
	const passwordType = controller.AvailableUserSelectableTypesOfPassword().FreeformStringPW
	//
	controller.on(
		controller.EventName_ObtainedNewPassword(),
		function() 
		{
			console.log("~ got new pw")
		}
	)
	controller.on(
		controller.EventName_ObtainedCorrectExistingPassword(),
		function() 
		{
			console.log("~ got existing pw")
		}
	)
	controller.on(
		controller.EventName_ErroredWhileSettingNewPassword(),
		function(err)
		{ // where validation errors are received as well
			console.log("EventName_ErroredWhileSettingNewPassword err:", err)
		}
	)
	controller.on(
		controller.EventName_ErroredWhileGettingExistingPassword(),
		function(err)
		{ // where validation errors are received as well
			console.log("EventName_ErroredWhileGettingExistingPassword err:", err)
		}
	)
	//
	// supplying the password:
	controller.on(
		controller.EventName_SingleObserver_getUserToEnterExistingPasswordWithCB(),
		function(isForChangePassword, enterPassword_cb)
		{
			enterPassword_cb(
				null, // not a cancel
				password
			)
		}
	)
	controller.on(
		controller.EventName_SingleObserver_getUserToEnterNewPasswordAndTypeWithCB(),
		function(isForChangePassword, enterPasswordAndType_cb)
		{
			enterPasswordAndType_cb(
				null, // not a cancel
				password,
				passwordType
			)
		}
	)
}