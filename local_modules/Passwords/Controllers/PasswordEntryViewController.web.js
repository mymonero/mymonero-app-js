"use strict"

const EventEmitter = require('events')
const PasswordEntryView = require('../Views/PasswordEntryView.web')

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
		}
		self.root_tabBarViewAndContentView = root_tabBarViewAndContentView
		self.context = self.root_tabBarViewAndContentView.context
		if (typeof self.context === 'undefined' || self.context === null) {
			const errStr = "self.context of root_tabBarViewAndContentView must not be nil in new PasswordEntryViewController()"
			throw errStr
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
				setTimeout(function()
				{ // give everything time to set up/reconstitute underneath - to avoid jitters 
					if (self.view != null && typeof self.view !== 'undefined') { // to ensure user didn't cancel while change pw was happening
						self.view.Dismiss()
					}
				}, 100)
			}
		)
		controller.on(
			controller.EventName_ObtainedCorrectExistingPassword(),
			function() 
			{
				setTimeout(function()
				{ // give everything time to set up/reconstitute underneath - to avoid jitters 
					if (self.view != null && typeof self.view !== 'undefined') { // to ensure user didn't cancel while change pw was happening
						self.view.Dismiss()
					}
				}, 100)
			}
		)
		controller.on(
			controller.EventName_successfullyAuthenticatedForAppAction(),
			function() 
			{
				setTimeout(function()
				{ // give everything time to set up/reconstitute underneath - to avoid jitters 
					if (self.view != null && typeof self.view !== 'undefined') { // to ensure user didn't cancel while change pw was happening
						self.view.Dismiss()
					}
				}, 100)
			}
		)
		controller.on(
			controller.EventName_ErroredWhileSettingNewPassword(),
			function(err)
			{
				self.view.ReEnableSubmittingForm()
				if ((typeof err === "string" && err == "") || !err) {
					self.view.ClearValidationErrorMessage()
				} else {
					self.view.ShowValidationErrorMessageToUser(err, "Unknown error. Please try again.")
				}
			}
		)
		controller.on(
			controller.EventName_ErroredWhileGettingExistingPassword(),
			function(err)
			{
				self.view.ReEnableSubmittingForm()
				if ((typeof err === "string" && err == "") || !err) {
					self.view.ClearValidationErrorMessage()
				} else {
					self.view.ShowValidationErrorMessageToUser(err, "Unknown error. Please try again.")
				}
			}
		)
		controller.on(
			controller.EventName_errorWhileChangingPassword(),
			function(err)
			{				
				self.view.ReEnableSubmittingForm()
				if ((typeof err === "string" && err == "") || !err) {
					self.view.ClearValidationErrorMessage()
				} else {
					self.view.ShowValidationErrorMessageToUser(err, "Unknown error. Please try again.")
				}
			}
		)
		controller.on(
			controller.EventName_errorWhileAuthorizingForAppAction(),
			function(err)
			{				
				self.view.ReEnableSubmittingForm()
				if ((typeof err === "string" && err == "") || !err) {
					self.view.ClearValidationErrorMessage()
				} else {
					self.view.ShowValidationErrorMessageToUser(err, "Unknown error. Please try again.")
				}
			}
		)
		//
		// supplying the password:
		controller.on(
			controller.EventName_SingleObserver_getUserToEnterExistingPasswordWithCB(),
			function(isForChangePassword, isForAuthorizingAppActionOnly, customNavigationBarTitle_orNull, enterPassword_cb)
			{
				const existingPasswordType = self.passwordController.userSelectedTypeOfPassword 
				if (typeof existingPasswordType === 'undefined' || existingPasswordType === null || existingPasswordType.length == 0) {
					// existingPasswordType = self.passwordController.AvailableUserSelectableTypesOfPassword().FreeformStringPW // graceful fallback..? since freeform str is superset of numer. pin
					throw "existingPasswordType was missing when passwordController asked us to have the user enter their existing password (and asserting it exists)"					
				}
				if (self.view === null || typeof self.view === 'undefined') {
					self.view = self._new_passwordEntryView()
				}
				self.view.GetUserToEnterExistingPasswordWithCB(
					self.root_tabBarViewAndContentView,
					isForChangePassword, // this will mean false for (1) enter pw on app launch; and (2) enter pw when user idle timer kicks in… we actually want false for #2
					// because in case the user is currently trying to change their pw, we still want to be able to lock-out the app if they step away, else security issue… and
					// we dismiss the 
					isForAuthorizingAppActionOnly, 
					customNavigationBarTitle_orNull,
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
		//
		// we don't want changing the pw to affect locking & deconstructing the UI if idle timer engages
		controller.on(
			controller.EventName_willDeconstructBootedStateAndClearPassword(),
			function(params)
			{
				const isForADeleteEverything = params.isForADeleteEverything === true ? true : false
				if (self.view !== null && typeof self.view !== 'undefined') {
					const isAnimated = isForADeleteEverything === true
					self.view.Cancel(isAnimated) // we must use Cancel to maintain pw controller state (or user idle while changing pw breaks ask-for-pw), and must have no animation unless it's for a 'delete everything' - teardown whole view and wait for imminent non-animated re-present of new self.view (which does not happen in the case of a 'delete everything')
				}
			}
		)
		controller.on(
			controller.EventName_didDeconstructBootedStateAndClearPassword(),
			function()
			{
			}
		)
	}
	//
	// TODO: Teardown and stopObserving - so far, wasn't necessary as self lives as long as app
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