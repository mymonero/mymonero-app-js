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

"use strict"
//
const tests_config = require('./tests_config.js')
if (typeof tests_config === 'undefined' || tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Passwords/tests/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
const theOriginalPassword = "123456"
const theNextPassword = "923162"
//
var controller; // we'll obtain this with bootController
//
const async = require('async')
async.series(
	[
		_proceedTo_test_bootController,
		//
		_proceedTo_test_gettingPassword
		//,
		// _proceedTo_test_changingPassword
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
			process.exit(1)
		} else {
			console.log("✅  Tests completed without error.")
			process.exit(0)
		}
	}
)
//
function _proceedTo_test_bootController(cb)
{
	console.log("▶️  _proceedTo_test_bootController")
	const options = {}
	const PasswordController = require('../Controllers/PasswordController')
	try {
		controller = new PasswordController(
			options,
			context
		)
	} catch (e) {
		cb(e)
		return
	}
	cb()
}

function _proceedTo_test_gettingPassword(cb)
{
	console.log("▶️  _proceedTo_test_gettingPassword")
	if (typeof controller === 'undefined' || controller === null) {
		cb(new Error("password controller was undefined/nil"))
		return
	}
	// the following call ought to defer till the controller is booted
	//
	//
	var hasAlreadyCalledBack = false 
	function __trampolineFor_callback()
	{
		if (hasAlreadyCalledBack === true) {
			console.warn("Already called back")
			return
		}
		hasAlreadyCalledBack = true
		cb()
	}
	
	
	controller.on(
		controller.EventName_ObtainedNewPassword(),
		function()
		{
			console.log("EventName_ObtainedNewPassword Password:", controller.password, "userSelectedTypeOfPassword:", controller.userSelectedTypeOfPassword)
			__trampolineFor_callback()
		}
	)
	controller.on(
		controller.EventName_ObtainedCorrectExistingPassword(),
		function()
		{
			console.log("EventName_ObtainedCorrectExistingPassword Password:", controller.password, "userSelectedTypeOfPassword:", controller.userSelectedTypeOfPassword)
			__trampolineFor_callback()
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
		function(isForChangePassword, isForAuthorizingAppActionOnly, customNavigationBarTitle_orNull, enterPassword_cb)
		{
			const didCancel_orNil = null
			const obtainedPassword = theOriginalPassword
			console.log("Replying with existing password of ", obtainedPassword)
			enterPassword_cb(
				didCancel_orNil, 
				obtainedPassword
			)
		}
	)
	controller.on(
		controller.EventName_SingleObserver_getUserToEnterNewPasswordAndTypeWithCB(),
		function(isForChangePassword, enterPasswordAndType_cb)
		{
			const didCancel_orNil = null // set this to true to test
			var obtained_passwordString;
			var obtained_typeOfPassword;
			if (controller.HasUserEnteredValidPasswordYet()) {
				console.log("Returning changed pw")
				obtained_passwordString = theNextPassword // we're being requested for the pw here during a change pw operation
				obtained_typeOfPassword = controller.AvailableUserSelectableTypesOfPassword().SixCharPIN
			} else {
				console.log("Returning first pw")
				obtained_passwordString = theOriginalPassword
				obtained_typeOfPassword = controller.AvailableUserSelectableTypesOfPassword().FreeformStringPW
			}
			enterPasswordAndType_cb(
				didCancel_orNil,
				obtained_passwordString,
				obtained_typeOfPassword
			)
		}
	)
	
	// kick off the request to get the PW from the user:
	controller.OnceBooted_GetNewPasswordAndTypeOrExistingPasswordFromUserAndEmitIt()
}

function _proceedTo_test_changingPassword(cb)
{
	console.log("▶️  _proceedTo_test_changingPassword")
	if (typeof controller === 'undefined' || controller === null) {
		cb(new Error("password controller was undefined/nil"))
		return
	}
	// the following call ought to defer till the controller is booted
	const existingPassword = theOriginalPassword
	controller.Initiate_ChangePassword(
		existingPassword
	)
}
