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
const PasswordController_Base = require('./PasswordController_Base')
//
class PasswordController extends PasswordController_Base
{
	constructor(options, context)
	{
		super(options, context)
	}
	setupAndBoot()
	{
		const self = this
		if (self.context.isLiteApp != true) {
			throw "Expected self.context.isLiteApp=true"
		}
		setTimeout( // for effect / simulated synchronization
			function()
			{
				self.hasUserSavedAPassword = true
				self.password = "totally arbitrary"
				self.userSelectedTypeOfPassword = self.AvailableUserSelectableTypesOfPassword().FreeformStringPW
				self._setBooted() // all done! call waiting fns
			},
			1
		)
	}
	//
	// Runtime - Accessors - Overrides
	HasUserEnteredValidPasswordYet() {
		return true
	}
	IsUserChangingPassword() {
		return false
	}
	_new_incorrectPasswordValidationErrorMessageString() {
		throw "Not available"
	}
	//
	// Runtime - Imperatives - Public - Overrides
	WhenBootedAndPasswordObtained_PasswordAndType(
		fn, // (password, passwordType) -> Void
		optl__userDidCancel_fn
	)
	{ // this function is for convenience to wrap consumers' waiting for password readiness
		const userDidCancel_fn = optl__userDidCancel_fn || function() {}
		const self = this
		// we can just call back immediately
		setTimeout(
			function()
			{
				fn(self.password, self.userSelectedTypeOfPassword)
			}, 1
		)
	}
	OnceBooted_GetNewPasswordAndTypeOrExistingPasswordFromUserAndEmitIt() {
		throw "Not available"
	}
	Initiate_ChangePassword() {
		throw "Not available"
	}
	Initiate_VerifyUserAuthenticationForAction(
		customNavigationBarTitle_orNull, // String? -- null if you don't want one
		canceled_fn, // () -> Void
		entryAttempt_succeeded_fn // () -> Void
	) {
		entryAttempt_succeeded_fn() // rather than not implementing this in Lite mode, just going to return immediately - it's more convenient for app objects to be coded as if it exists
	}

	//
	// Runtime - Imperatives - Private - Overrides
	_getUserToEnterTheirExistingPassword(isForChangePassword, isForAuthorizingAppActionOnly, customNavigationBarTitle_orNull, fn) {
		throw "Not available"
	}
	_getUserToEnterNewPassword(isForChangePassword, fn) {
		throw "Not available"
	}
	obtainNewPasswordFromUser(isForChangePassword) {
		throw "Not available"
	}
	_executeWhenBooted(fn)
	{
		const self = this
		fn() // ready to execute
	}
	saveToDisk(fn) {
		throw "Not available"
	}
	//
	// Runtime - Delegation - Overrides
	_didObtainPassword(password) {
		throw "Not available"
	}
	_didBecomeIdleAfterHavingPreviouslyEnteredPassword()
	{ // special functionality here - we want to clear /all/ persisted data (i.e. clear sessionData)
		const self = this
		// so we'll bypass super's implementation and just clear everything
		if (self.context.walletsListController.records.length > 0) { // normally this directionality of coupling would be bad but we're already saying this is the .Lite version
			self.InitiateDeleteEverything(
				function()
				{
					setTimeout(function() { // after timeout b/c we absolutely don't want to prevent the main thread from rendering its deleteeverything changes
						alert("You've been logged out due to inactivity.") // just going to assume this is a browser. 🤥
					}, 500) // and it's ok to give them a moment to visually process the change before popping explanatory alert
				}
			)
		}
	}
}
module.exports = PasswordController
