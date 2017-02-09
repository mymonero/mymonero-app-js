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
const EventEmitter = require('events')
//
const PasswordEntryView = require('../Views/PasswordEntryView.web')
//
class PasswordEntryViewController extends EventEmitter
{
	constructor(
		root_tabBarViewAndContentView,
		passwordController // PasswordController
	)
	{
		super() // must call before can use `this`
		//
		const self = this
		if (typeof root_tabBarViewAndContentView === 'undefined' || root_tabBarViewAndContentView === null) {
			const errStr = "root_tabBarViewAndContentView must not be nil in new PasswordEntryViewController()"
			throw errStr
			return
		}
		self.root_tabBarViewAndContentView = root_tabBarViewAndContentView
		self.context = self.root_tabBarViewAndContentView.context
		if (typeof self.context === 'undefined' || self.context === null) {
			const errStr = "self.context of root_tabBarViewAndContentView must not be nil in new PasswordEntryViewController()"
			throw errStr
			return
		}
		self.passwordController = passwordController
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_startObserving()
	}
	setup_startObserving()
	{
		const self = this
		self.setup_startObserving_passwordController()
	}
	setup_startObserving_passwordController()
	{
		const self = this
		const controller = self.passwordController
		controller.on(
			controller.EventName_ObtainedNewPassword(),
			function() 
			{
				self.view.Dismiss()
			}
		)
		controller.on(
			controller.EventName_ObtainedCorrectExistingPassword(),
			function() 
			{
				self.view.Dismiss()
			}
		)
		controller.on(
			controller.EventName_ErroredWhileSettingNewPassword(),
			function(err)
			{
				self.view.ShowValidationErrorMessageToUser(
					err ? err.message : "Unknown error. Please try again."
				)
			}
		)
		controller.on(
			controller.EventName_ErroredWhileGettingExistingPassword(),
			function(err)
			{
				self.view.ShowValidationErrorMessageToUser(
					err ? err.message : "Unknown error. Please try again."
				)
			}
		)
		controller.on(
			controller.EventName_errorWhileChangingPassword(),
			function(err)
			{				
				self.view.ShowValidationErrorMessageToUser(
					err ? err.message : "Unknown error. Please try again."
				)
			}
		)
		//
		// supplying the password:
		controller.on(
			controller.EventName_SingleObserver_getUserToEnterExistingPasswordWithCB(),
			function(isForChangePassword, enterPassword_cb)
			{
				const existingPasswordType = self.passwordController.userSelectedTypeOfPassword 
				if (typeof existingPasswordType === 'undefined' || existingPasswordType === null || existingPasswordType.length == 0) {
					throw "existingPasswordType was missing when passwordController asked us to have the user enter their existing password (and asserting it exists)"
					existingPasswordType = self.passwordController.AvailableUserSelectableTypesOfPassword().FreeformStringPW // graceful fallback..? since freeform str is superset of numer. pin
				}
				if (self.view === null || typeof self.view === 'undefined') {
					self.view = self._new_passwordEntryView()
				}
				self.view.GetUserToEnterExistingPasswordWithCB(
					self.root_tabBarViewAndContentView,
					isForChangePassword,
					existingPasswordType,
					enterPassword_cb
				)
			}
		)
		controller.on(
			controller.EventName_SingleObserver_getUserToEnterNewPasswordAndTypeWithCB(),
			function(isForChangePassword, enterPasswordAndType_cb)
			{
				if (self.view === null || typeof self.view === 'undefined') {
					self.view = self._new_passwordEntryView()
				}
				self.view.GetUserToEnterNewPasswordAndTypeWithCB(
					self.root_tabBarViewAndContentView,
					isForChangePassword,
					enterPasswordAndType_cb
				)
			}
		)
	}
	//
	//
	// Runtime - Accessors - Events
	//
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
	// Runtime - Accessors - Factories
	//
	_new_passwordEntryView()
	{
		const self = this
		const view = new PasswordEntryView({}, self.context)
		{
			view.on(
				view.EventName_willDismissView(),
				function()
				{
					self.emit(self.EventName_willDismissView())
				}
			)
			view.on(
				view.EventName_willPresentInView(),
				function()
				{
					self.emit(self.EventName_willPresentInView())
				}
			)
			view.on(
				view.EventName_didDismissView(),
				function()
				{
					self.view.TearDown()
					self.view = null // essential we clear this 
				}
			)
		}
		return view
	}
}
module.exports = PasswordEntryViewController