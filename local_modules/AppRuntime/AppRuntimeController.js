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
class AppRuntimeController
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		const self = this
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Proxying - Password controller

	passwordController__obtainPasswordFromUser_wOptlValidationErrMsg_cb(
		passwordController,
		obtainedErrOrPwAndType_cb,
		showingValidationErrMsg_orUndefined
	)
	{
		const self = this
		if (typeof showingValidationErrMsg_orUndefined !== 'undefined') {
			console.log("Password entry validation error:", showingValidationErrMsg_orUndefined)
		}
		var errToPassBack = null // use err if user cancelled - err will cancel the pw change
		var obtained_passwordString;
		var obtained_typeOfPassword;
		obtained_passwordString = theOriginalPassword
		obtained_typeOfPassword = passwordController.AvailableUserSelectableTypesOfPassword().FreeformStringPW
		obtainedErrOrPwAndType_cb(
			errToPassBack,
			obtained_passwordString,
			obtained_typeOfPassword
		)
	}
	didSetFirstPasswordDuringThisRuntime_cb(passwordController, password)
	{
		// TODO: funnel into a singular function which tells the wallets and contacts list controllers to re-save
		const self = this
	}
	didChangePassword_cb(passwordController, password)
	{
		// TODO: funnel into a singular function which tells the wallets and contacts list controllers to re-save
		const self = this
	}


}
module.exports = AppRuntimeController
