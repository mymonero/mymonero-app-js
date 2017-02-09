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
const View = require('../../Views/View.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
//
const passwordEntryTaskModes =
{
	None: 'None',
	//
	ForUnlockingApp_ExistingPasswordGivenType : 'ForUnlockingApp_ExistingPasswordGivenType',
	ForFirstEntry_NewPasswordAndType		  : 'ForFirstEntry_NewPasswordAndType',
	//
	ForChangingPassword_ExistingPasswordGivenType : 'ForChangingPassword_ExistingPasswordGivenType',
	ForChangingPassword_NewPasswordAndType		  : 'ForChangingPassword_NewPasswordAndType'
}
//
class PasswordEntryView extends StackAndModalNavigationView
{
	setup()
	{
		const self = this
		//
		super.setup()
		//
		self.passwordEntryTaskMode = passwordEntryTaskModes.None
		//
		self._setup_views()
		self._setup_startObserving()
		//
	}
	// Views/layers
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.width = "100%"
		layer.style.height = "100%"
	}
	// Observation
	_setup_startObserving()
	{
		const self = this
	}
	//
	//
	//
	//
	TearDown()
	{
		const self = this
		super.TearDown()
	}
	//
	//
	// Runtime - Accessors - Events
	//
	EventName_didDismissView()
	{
		return "EventName_didDismissView"
	}
	EventName_willDismissView()
	{
		return "EventName_willDismissView"
	}
	EventName_willPresentInView()
	{
		return "EventName_willPresentInView"
	}
	//
	//
	// Runtime - Accessors - Products
	//
	passwordTypeChosenWithPasswordIfNewPassword_orUndefined(withPassword)
	{
		const self = this
		switch (self.passwordEntryTaskMode) {
			case passwordEntryTaskModes.ForUnlockingApp_ExistingPasswordGivenType:
			case passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType:
				return undefined // we're going to allow this function to be called and simply return undefined because 
				// the caller needs to pass it to a general purpose function
			case passwordEntryTaskModes.ForFirstEntry_NewPasswordAndType:
			case passwordEntryTaskModes.ForChangingPassword_NewPasswordAndType:
				return self.context.passwordController.DetectedPasswordTypeFromPassword(withPassword) // since we're not letting the user enter their pw type with this UI, let's auto-detect 

			case passwordEntryTaskModes.None:
				throw "passwordTypeChosenWithPasswordIfNewPassword_orUndefined called when self.passwordEntryTaskMode .None"
				break
			default:
				throw "This switch ought to have been exhaustive"
				break
		}
		//
		return undefined
	}
	//
	//
	// Runtime - Accessors - UI state
	//	
	IsPresented()
	{
		const self = this
		const hasASuperview = typeof self.superview !== "undefined" && self.superview !== null
		//
		return hasASuperview ? true : false
	}
	//
	//
	// Runtime - Imperatives - Interface - Showing the view
	//
	GetUserToEnterExistingPasswordWithCB(
		root_tabBarViewAndContentView,
		isForChangePassword,
		existingPasswordType,
		enterPassword_cb
		// TODO: add flag for whether this is for a change pw
	)
	{
		const self = this
		const shouldAnimateToNewState = isForChangePassword
		{ // check legality
			if (self.passwordEntryTaskMode !== passwordEntryTaskModes.None) {
				throw "GetUserToEnterExistingPasswordWithCB called but self.passwordEntryTaskMode not .None"
				return
			}
		}
		{ // we need to hang onto the callback for when the form is submitted
			self.enterPassword_cb = enterPassword_cb
		}
		{ // put view into mode
			let taskMode;
			if (isForChangePassword === true) {
				taskMode = passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType
			} else {
				taskMode = passwordEntryTaskModes.ForUnlockingApp_ExistingPasswordGivenType
			}
			self.passwordEntryTaskMode = taskMode
			//
			self._configureWithMode(shouldAnimateToNewState)			
		}
		self.presentIn__root_tabBarViewAndContentView(
			root_tabBarViewAndContentView,
			shouldAnimateToNewState
		)
	}
	GetUserToEnterNewPasswordAndTypeWithCB(
		root_tabBarViewAndContentView,
		isForChangePassword,
		enterPasswordAndType_cb
		// TODO: add flag for whether this is for a change pw
	)
	{
		const self = this
		const shouldAnimateToNewState = isForChangePassword
		{ // check legality
			if (self.passwordEntryTaskMode !== passwordEntryTaskModes.None) {
				if (self.passwordEntryTaskMode !== passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType) {
					throw "GetUserToEnterNewPasswordAndTypeWithCB called but self.passwordEntryTaskMode not .None and not .ForChangingPassword_ExistingPasswordGivenType"
					return
				}
			}
		}
		{ // we need to hang onto the callback for when the form is submitted
			self.enterPasswordAndType_cb = enterPasswordAndType_cb
		}
		{ // put view into mode
			let taskMode;
			if (isForChangePassword === true) {
				taskMode = passwordEntryTaskModes.ForChangingPassword_NewPasswordAndType
			} else {
				taskMode = passwordEntryTaskModes.ForFirstEntry_NewPasswordAndType
			}
			self.passwordEntryTaskMode = taskMode
			//
			self._configureWithMode(shouldAnimateToNewState)			
		}
		self.presentIn__root_tabBarViewAndContentView(
			root_tabBarViewAndContentView,
			true // this is for NEW password, so we want this to show with an animation
			// because it's going to be requested after the user has already initiated activity
		)
	}
	//
	//
	// Runtime - Imperatives - Interface - Intra-task configuration
	//	
	ShowValidationErrorMessageToUser(validationMessageString)
	{
		const self = this
		self._setValidationMessage(validationMessageString)
	}
	//
	//
	// Runtime - Imperatives - Interface - Dismissing the view
	//
	Dismiss()
	{
		const self = this
		if (self.IsPresented() !== true) {
			console.error("Can't  dismiss password entry view as not presented")
			return
		}
		// TODO: animation
		self.emit(self.EventName_willDismissView())
		{ // clear state for next time
			self.passwordEntryTaskMode = passwordEntryTaskModes.None
		}
		{ // clear both callbacks as well since we're no longer going to call back with either of the current values
			self.enterPassword_cb = null
			self.enterPasswordAndType_cb = null
		}
		self.modalParentView.DismissTopModalView(
			true, // animated
			function()
			{
				self.emit(self.EventName_didDismissView())
			}
		)
	}
	//
	//
	// Runtime - Imperatives - Internal - Showing the view - Utilities
	//
	presentIn__root_tabBarViewAndContentView(
		root_tabBarViewAndContentView,
		optl__isAnimated
	)
	{
		const self = this
		if (typeof self.modalParentView !== 'undefined' && self.modalParentView !== null) {
			console.warn("Asked to presentIn__root_tabBarViewAndContentView while already presented. Bailing.")
			return
		}
		{
			self.emit(self.EventName_willPresentInView())
		}
		const tabBarContentView_navigationView = root_tabBarViewAndContentView.CurrentlySelectedTabBarContentView()
		// ^- we know it's a stack & modal nav view
		const animate = optl__isAnimated === true ? true : false // isAnimated dflt false
		tabBarContentView_navigationView.PresentView( // modally
			self,
			animate
		)
	}
	//
	//
	// Runtime - Imperatives - Internal - View configuration
	//
	_configureWithMode(shouldAnimate)
	{
		const self = this
		if (typeof shouldAnimate === 'undefined') {
			shouldAnimate = false
		}
		const isForChangingPassword = 
			self.passwordEntryTaskMode == passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType 
			|| self.passwordEntryTaskMode == passwordEntryTaskModes.ForChangingPassword_NewPasswordAndType
		//
		// we do not need to call self._clearValidationMessage() here because the ConfigureToBeShown() fns have the same effect
		{ // transition to screen
			switch (self.passwordEntryTaskMode) {
				case passwordEntryTaskModes.ForUnlockingApp_ExistingPasswordGivenType:
				case passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType:
					const EnterExistingPasswordView = require('./EnterExistingPasswordView.web')
					const enterExistingPasswordView = new EnterExistingPasswordView({
						isForChangingPassword: isForChangingPassword
					}, self.context)
					{ // observation
						enterExistingPasswordView.on(
							enterExistingPasswordView.EventName_UserSubmittedNonZeroPassword(),
							function(password)
							{
								self.submitForm(password)
							}
						)
						enterExistingPasswordView.on(
							enterExistingPasswordView.EventName_CancelButtonPressed(),
							function()
							{
								self.cancel()
							}
						)
					}
					self.SetStackViews([enterExistingPasswordView]) // i don't know of any cases where this should be true - and there are reasons we don't want it to be - there's no 'old_topStackView'
					break
				//	
				case passwordEntryTaskModes.ForFirstEntry_NewPasswordAndType:
				case passwordEntryTaskModes.ForChangingPassword_NewPasswordAndType:
					const EnterNewPasswordView = require('./EnterNewPasswordView.web')
					const enterNewPasswordView = new EnterNewPasswordView({
						isForChangingPassword: isForChangingPassword
					}, self.context)
					{ // observation
						enterNewPasswordView.on(
							enterNewPasswordView.EventName_UserSubmittedNonZeroPassword(),
							function(password)
							{
								self.submitForm(password)
							}
						)
						enterNewPasswordView.on(
							enterNewPasswordView.EventName_CancelButtonPressed(),
							function()
							{
								self.cancel()
							}
						)
					}
					self.enterNewPasswordView = enterNewPasswordView
					if (self.stackViews.length == 0) {
						self.SetStackViews([enterNewPasswordView])
					} else {
						self.PushView(enterNewPasswordView, shouldAnimate)
					}
					break
				//
				case passwordEntryTaskModes.None:
					throw "_configureWithMode called when self.passwordEntryTaskMode .None"
					break
				//	
				default:
					throw "This switch ought to have been exhaustive"
					break
			}
		}

	}
	_setValidationMessage(validationMessageString)
	{
		const self = this
		self.topStackView.SetValidationMessage(validationMessageString)
	}
	_clearValidationMessage()
	{
		const self = this
		self._setValidationMessage("")
	}	
	//
	//
	// Runtime - Imperatives - Internal - Form management
	//
	submitForm(password)
	{
		const self = this
		{
			self._clearValidationMessage()
		}
		// handles validation:
		const passwordType = self.passwordTypeChosenWithPasswordIfNewPassword_orUndefined(password)
		self._passwordController_callBack_trampoline(
			false, // didCancel
			password,
			passwordType
		)
	}
	cancel()
	{
		const self = this
		//
		self._passwordController_callBack_trampoline(
			true, // didCancel
			undefined,
			undefined
		)
		//
		setTimeout(
			function()
			{
				self.Dismiss()
			}
		)
	}	
	_passwordController_callBack_trampoline(didCancel, password_orNil, passwordType_orNil)
	{
		const self = this
		//
		// NOTE: we unfortunately can't just clear the callbacks here even though this is where we use them because
		// if there's a validation error, and the user wants to try again, there would be no callback through which
		// to submit the subsequent try
		//
		switch (self.passwordEntryTaskMode) {
			case passwordEntryTaskModes.ForUnlockingApp_ExistingPasswordGivenType:
			case passwordEntryTaskModes.ForChangingPassword_ExistingPasswordGivenType:
				{ // validate cb state
					if (typeof self.enterPassword_cb === 'undefined' || self.enterPassword_cb === null) {
						throw "PasswordEntryView/_passwordController_callBack_trampoline: missing enterPassword_cb for passwordEntryTaskMode: " + self.passwordEntryTaskMode
						return
					}					
				}
				self.enterPassword_cb(
					didCancel,
					password_orNil
				)
				// we don't want to free/zero the cb here - user may get pw wrong and try again
				break
			//
			case passwordEntryTaskModes.ForFirstEntry_NewPasswordAndType:
			case passwordEntryTaskModes.ForChangingPassword_NewPasswordAndType:
				{ // validate cb state
					if (typeof self.enterPasswordAndType_cb === 'undefined' || self.enterPasswordAndType_cb === null) {
						throw "PasswordEntryView/_passwordController_callBack_trampoline: missing enterPasswordAndType_cb for passwordEntryTaskMode: " + self.passwordEntryTaskMode
						return
					}					
				}
				self.enterPasswordAndType_cb(
					didCancel,
					password_orNil,
					passwordType_orNil
				)
				// we don't want to free/zero the cb here - might trigger validation err & need to be called again
				break
			//
			case passwordEntryTaskModes.None:
				throw "_passwordController_callBack_trampoline called when self.passwordEntryTaskMode .None"
				return
				break
			//
			default:
				throw "This switch ought to have been exhaustive"
				return
				break
		}
	}
}
module.exports = PasswordEntryView
