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
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_labeledRangeInputs = require('../../MMAppUICommonComponents/labeledRangeInputs.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_switchToggles = require('../../MMAppUICommonComponents/switchToggles.web')
//
class SettingsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.startObserving()
	}
	setup_views()
	{
		const self = this
		{ // metrics / caches
			self.margin_h = 0
		}
		self._setup_self_layer()
		self._setup_validationMessageLayer()
		self._setup_form_containerLayer()
		// self.DEBUG_BorderChildLayers()
	}
	_setup_self_layer()
	{
		const self = this
		//
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		layer.style.padding = `0 ${self.margin_h}px 0px ${self.margin_h}px` // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		layer.style.overflowY = "auto"
		// layer.style.webkitOverflowScrolling = "touch"
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "")
		layer.style.width = "calc(100% - 12px)"
		layer.style.marginLeft = "6px"
		layer.ClearAndHideMessage()
		self.validationMessageLayer = layer
		self.layer.appendChild(layer)				
	}
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		{
			if (self.context.Settings_shouldDisplayAboutAppButton === true) {
				self._setup_aboutAppButton()
			}
			self._setup_form_field_changePasswordButton()
			// self._setup_form_field_serverURL() // TODO: to implement
			self._setup_form_field_appTimeoutSlider()
			//self._setup_form_field_notifyOptions() //TODO: override current mock-fields
			self._setup_deleteEverythingButton()
		}
		self.layer.appendChild(containerLayer)
	}
	_setup_aboutAppButton()
	{
		const self = this
		const div = document.createElement("div")
		div.style.padding = "12px 0 12px 33px"
		const buttonView = commonComponents_tables.New_clickableLinkButtonView(
			"ABOUT MYMONERO",
			self.context,
			function()
			{
				const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
				const ModalStandaloneAboutView = require('../../AboutWindow/Views/ModalStandaloneAboutView.web')
				const options = {}
				const view = new ModalStandaloneAboutView(options, self.context)
				self.current_ModalStandaloneAboutView = view
				const navigationView = new StackAndModalNavigationView({}, self.context)
				navigationView.SetStackViews([ view ])
				self.navigationController.PresentView(navigationView, true)
			}
		)
		buttonView.layer.style.margin = "0"
		div.appendChild(buttonView.layer)
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_changePasswordButton()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.padding = "19px 24px 20px 24px"
		{
			const view = commonComponents_navigationBarButtons.New_GreyButtonView(self.context)
			view.layer.style.display = "inline-block"
			view.layer.style.padding = "0 10px"
			view.layer.style.margin = "0"
			self.changePasswordButtonView = view
			view.layer.addEventListener("click", function(e)
			{
				e.preventDefault()
				if (view.isEnabled !== false) {
					self.context.passwordController.InitiateChangePassword() // this will throw if no pw has been entered yet
				}
				return false
			})
			// this will set its title on VWA
			div.appendChild(view.layer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_serverURL()
	{ // TODO: This hasn't really been implemented. It should have a 'Saving…' activity indicator to-design and should let the user know it will cause the removal of their wallets and they'll have to add them back after changing servers
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SERVER URL", self.context)
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "Leave blank to use mymonero.com"
			})
			self.serverURLInputLayer = valueLayer
			valueLayer.addEventListener(
				"keyup",
				function(event)
				{
					console.log("Save server URL")
				}
			)
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_appTimeoutSlider()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingTop = "5px" // special case
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("APP TIMEOUT", self.context)
			div.appendChild(labelLayer)
			//
			const min = 5
			const max = 60 * 25
			const view = commonComponents_labeledRangeInputs.New_fieldValue_timeBasedLabeledRangeInputView({
				min: min,
				max: max,
				step: 5, // 5s at a time?
				//
				slideSideLabelFor_min: "5s",
				slideSideLabelStyleWidthFor_min: "20px",
				slideSideLabelFor_max: "Never",
				slideSideLabelStyleWidthFor_max: "34px",
				//
				displayAsMinutesAtXMin: 2,
				//
				isMaxInfinity: true,
				labelForInfinity: "Never",
				//
				changed_fn: function(value)
				{
					var valueToSave = value
					if (value == max) {
						valueToSave = self.context.settingsController.AppTimeoutNeverValue()
					}
					self.context.settingsController.Set_settings_valuesByKey(
						{
							appTimeoutAfterS: valueToSave
						},
						function(err)
						{
							if (err) {
								throw err
							}
						}
					)
				}
			}, self.context)
			const margin_h = 5
			view.layer.style.margin = `0 ${margin_h}px`
			view.layer.style.width = `calc(100% - ${2 * margin_h}px)`
			self.appTimeoutRangeInputView = view // NOTE: This must be torn down manually; see TearDown()
			div.appendChild(view.layer)
			//
			const messageLayer = commonComponents_forms.New_fieldAccessory_messageLayer(self.context)
			messageLayer.style.wordBreak = "break-word"
			self.appTimeoutSlider_messageLayer = messageLayer
			div.appendChild(messageLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_notifyOptions()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("NOTIFY ME WHEN", self.context)
			div.appendChild(labelLayer)

			const switch_notifyFundsComeIn = commonComponents_switchToggles.New_fieldValue_switchToggle({
				name: "notify_when_funds_come_in",
				note: "Funds come in",
				border: true,
			}, self.context)  
			div.appendChild(switch_notifyFundsComeIn.layer)

			const switch_notifyConfirmedOutgoing = commonComponents_switchToggles.New_fieldValue_switchToggle({
				name: "notify_when_outgoing_tx_confirmed",
				note: "Outgoing transactions are confirmed",
				border: true,
			}, self.context)

			div.appendChild(switch_notifyConfirmedOutgoing.layer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_deleteEverythingButton()
	{
		const self = this
		const div = document.createElement("div")
		div.style.paddingTop = "23px"
		const view = commonComponents_tables.New_redTextButtonView("DELETE EVERYTHING…", self.context)
		self.deleteEverything_buttonView = view
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (self.deleteEverything_buttonView.isEnabled !== true) {
					return false
				}
				var msg = 'Are you sure you want to delete all of your local data?\n\nAny wallets will remain permanently on the Monero blockchain but local data such as contacts will not be recoverable.'
				self.context.windowDialogs.PresentQuestionAlertDialogWith(
					'Delete everything?', 
					msg,
					[ 'Delete Everything', 'Cancel' ],
					function(err, selectedButtonIdx)
					{
						if (err) {
							throw err
						}
						const didChooseYes = selectedButtonIdx === 0
						if (didChooseYes) {
							self.context.passwordController.InitiateDeleteEverything(
								function(err)
								{
									/*
									self.viewWillAppear()
									self.viewDidAppear()
									*/
									// ^- this is to cause the UI to update itself with new values/states
									// but is commented out here because we do not need to call it -
									// we have the tab bar select the walletsTab for us, and if the user
									// does come back to Settings, both of these will be called
								}
							)
						}
					}
				)
				return false
			}
		)
		div.appendChild(layer)
		self.form_containerLayer.appendChild(div)
	}
	//
	startObserving()
	{
		const self = this
	}
	//
	//
	// Lifecycle - Teardown - Overrides
	//
	TearDown()
	{
		const self = this
		self.stopObserving()
		super.TearDown()
		//
		self.appTimeoutRangeInputView.TearDown() // must call this manually
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	tearDownAnySpawnedReferencedPresentedViews()
	{
		const self = this
		if (typeof self.current_ModalStandaloneAboutView !== 'undefined' && self.current_ModalStandaloneAboutView) {
			self.current_ModalStandaloneAboutView.TearDown()
			self.current_ModalStandaloneAboutView = null
		}
	}
	stopObserving()
	{
		const self = this
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Preferences"
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
			}
		}
		const passwordController = self.context.passwordController
		{ // config change pw btn text
			const layer = self.changePasswordButtonView.layer
			const userSelectedTypeOfPassword = passwordController.userSelectedTypeOfPassword
			const passwordType_humanReadableString = passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[userSelectedTypeOfPassword]
			if (typeof passwordType_humanReadableString !== 'undefined') {
				const capitalized_passwordType = passwordType_humanReadableString.charAt(0).toUpperCase() + passwordType_humanReadableString.slice(1)
				layer.innerHTML = "Change " + capitalized_passwordType
				self.appTimeoutSlider_messageLayer.innerHTML = "Amount of time before your " + passwordType_humanReadableString + " is required again"
			}
		}
		{
			if (passwordController.hasUserSavedAPassword !== true) {
				self.changePasswordButtonView.SetEnabled(false) // can't change til entered
				// self.serverURLInputLayer.disabled = false // enable - user may want to change URL before they add their first wallet
				self.appTimeoutRangeInputView.SetEnabled(true)
				self.deleteEverything_buttonView.SetEnabled(false)
			} else if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app - prevent tampering
				// however, user should never be able to see the settings view in this state
				self.changePasswordButtonView.SetEnabled(false)
				// self.serverURLInputLayer.disabled = true
				self.appTimeoutRangeInputView.SetEnabled(false)
				self.deleteEverything_buttonView.SetEnabled(false)
			} else { // has entered PW - unlock
				self.changePasswordButtonView.SetEnabled(true)
				// self.serverURLInputLayer.disabled = false
				self.appTimeoutRangeInputView.SetEnabled(true)
				self.deleteEverything_buttonView.SetEnabled(true)
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		{ // reconstitute slider value… NOTE: we're doing this on VDA and not ideally on VWA because offsetWidth is nil before element is in DOM
			const appTimeoutAfterS = self.context.settingsController.appTimeoutAfterS
			if (appTimeoutAfterS == self.context.settingsController.AppTimeoutNeverValue()) {
				self.appTimeoutRangeInputView.SetValueMax()
			} else {
				self.appTimeoutRangeInputView.SetValue(self.context.settingsController.appTimeoutAfterS)
			}
		}
	}
	// Runtime - Protocol / Delegation - Stack & modal navigation 
	// We don't want to naively do this on VDA as else tab switching may trigger it - which is bad
	navigationView_didDismissModalToRevealView()
	{
		const self = this
		if (super.navigationView_didDismissModalToRevealView) {
			super.navigationView_didDismissModalToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	navigationView_didPopToRevealView()
	{
		const self = this
		if (super.navigationView_didPopToRevealView) {
			super.navigationView_didPopToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
}
module.exports = SettingsView
