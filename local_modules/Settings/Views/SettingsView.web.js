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
//
"use strict"
//
const View = require('../../Views/View.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_labeledRangeInputs = require('../../MMAppUICommonComponents/labeledRangeInputs.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_switchToggles = require('../../MMAppUICommonComponents/switchToggles.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const commonComponents_ccySelect = require('../../MMAppUICommonComponents/ccySelect.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
const commonComponents_tooltips = require('../../MMAppUICommonComponents/tooltips.web')
//
const config__MyMonero = require('../../HostedMoneroAPIClient/config__MyMonero')
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
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		{
			if (self.context.Settings_shouldDisplayAboutAppButton === true) {
				self._setup_aboutAppButton()
			}
			if (self.context.isLiteApp != true) {
				self._setup_form_field_changePasswordButton()
			}
			self._setup_form_field_appTimeoutSlider()
			if (self.context.isLiteApp != true) {
				self._setup_form_field_authentication() // no password protecting Lite app
			}
			self._setup_form_field_displayCcy()
			if (self.context.isLiteApp != true) {
				self._setup_form_field_serverURL()
			}
			if (self.context.isLiteApp != true) {
				const isLinux = typeof process.platform !== 'undefined' && process.platform && /linux/.test(process.platform)
				if (isLinux != true) { // because there is no software update support under linux (yet) .. TODO: possibly just encode this under a self.context.appHasSoftwareUpdateSupport so we can switch it in one place
					self._setup_form_field_appUpdates()
				}
			}
			self._setup_deleteEverythingButton()
			//
			containerLayer.style.paddingBottom = "64px"
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
					self.context.passwordController.Initiate_ChangePassword() // this will throw if no pw has been entered yet
				}
				return false
			})
			// this will set its title on VWA
			div.appendChild(view.layer)
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
			const min = 15
			const max = 60 * 25
			const view = commonComponents_labeledRangeInputs.New_fieldValue_timeBasedLabeledRangeInputView({
				min: min,
				max: max,
				step: 15, // 15s at a time
				//
				slideSideLabelFor_min: "15s",
				slideSideLabelStyleWidthFor_min: "20px",
				slideSideLabelFor_max: "Never",
				slideSideLabelStyleWidthFor_max: "34px",
				//
				displayAsMinutesAtXMin: 1,
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
	_setup_form_field_authentication()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("AUTHENTICATE", self.context)
			{
				const tooltipText = `An extra layer of security<br/>for approving certain<br/>actions after you've<br/>unlocked the app`
				const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
				const layer = view.layer
				labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
			}
			div.appendChild(labelLayer)
			{
				const switchView = commonComponents_switchToggles.New_fieldValue_switchToggleView({
					note: "When sending",
					border: true,
					changed_fn: function(isChecked)
					{
						self.context.settingsController.Set_settings_valuesByKey(
							{
								authentication_requireWhenSending: isChecked
							},
							function(err)
							{
								if (err) {
									throw err
								}
							}
						)
					},
					shouldToggle_fn: function(to_isSelected, async_shouldToggle_fn) 
					{
						if (to_isSelected == false) { // if it's being turned OFF
							// then they need to authenticate
							self.context.passwordController.Initiate_VerifyUserAuthenticationForAction(
								"Authenticate",
								function()
								{
									async_shouldToggle_fn(false) // disallowed
								},
								function()
								{
									setTimeout(
										function()
										{
											async_shouldToggle_fn(true) // allowed
										},
										400 // this delay is purely for visual effect, waiting for pw entry to dismiss
									)
								}
							)
						} else {
							async_shouldToggle_fn(true) // no auth needed
						}
					}
				}, self.context)  
				div.appendChild(switchView.layer)
				self.requireWhenSending_switchView = switchView
			}
			{
				const switchView = commonComponents_switchToggles.New_fieldValue_switchToggleView({
					note: "To show wallet secrets",
					border: true,
					changed_fn: function(isChecked)
					{
						self.context.settingsController.Set_settings_valuesByKey(
							{
								authentication_requireWhenDisclosingWalletSecrets: isChecked
							},
							function(err)
							{
								if (err) {
									throw err
								}
							}
						)
					},
					shouldToggle_fn: function(to_isSelected, async_shouldToggle_fn) 
					{
						if (to_isSelected == false) { // if it's being turned OFF
							// then they need to authenticate
							self.context.passwordController.Initiate_VerifyUserAuthenticationForAction(
								"Authenticate",
								function()
								{
									async_shouldToggle_fn(false) // disallowed
								},
								function()
								{
									setTimeout(
										function()
										{
											async_shouldToggle_fn(true) // allowed
										},
										400 // this delay is purely for visual effect, waiting for pw entry to dismiss
									)
								}
							)
						} else {
							async_shouldToggle_fn(true) // no auth needed
						}
					}
				}, self.context)  
				div.appendChild(switchView.layer)
				self.requireWhenDisclosingWalletSecrets_switchView = switchView
			}
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_serverURL()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SERVER ADDRESS", self.context)
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "Leave blank to use mymonero.com"
			})
			valueLayer.autocomplete = "off"
			valueLayer.autocorrect = "off"
			valueLayer.autocapitalize = "off"
			valueLayer.spellcheck = "false"
			self.serverURLInputLayer = valueLayer
			valueLayer.addEventListener(
				"keyup",
				function(event)
				{
					self._serverURLInputLayer_did_keyUp()
				}
			)
			div.appendChild(valueLayer)
		}
		{
			const validationMessageLayer = commonComponents_forms.New_fieldAccessory_validationMessageLayer(self.context)
			validationMessageLayer.style.display = "none"
			self.serverURL_validationMessageLayer = validationMessageLayer
			div.appendChild(validationMessageLayer)
		}
		{
			const layer = commonComponents_activityIndicators.New_GraphicAndLabel_ActivityIndicatorLayer( // will call `__inject…`
				"CONNECTING…",
				self.context
			)
			layer.style.display = "none" // initial state
			layer.style.paddingLeft = "7px"
			self.serverURL_connecting_activityIndicatorLayer = layer
			div.appendChild(layer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_appUpdates()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SOFTWARE UPDATES", self.context)
			div.appendChild(labelLayer)
			{
				const switchView = commonComponents_switchToggles.New_fieldValue_switchToggleView({
					note: "Download automatically",
					border: true,
					changed_fn: function(isChecked)
					{
						self.context.settingsController.Set_settings_valuesByKey(
							{
								autoDownloadUpdatesEnabled: isChecked
							},
							function(err)
							{
								if (err) {
									throw err
								}
							}
						)
					},
					shouldToggle_fn: function(to_isSelected, async_shouldToggle_fn) 
					{
						if (to_isSelected == true) { // if it's being turned ON
							// then they need to authenticate
							self.context.passwordController.Initiate_VerifyUserAuthenticationForAction(
								"Authenticate",
								function()
								{
									async_shouldToggle_fn(false) // disallowed
								},
								function()
								{
									setTimeout(
										function()
										{
											async_shouldToggle_fn(true) // allowed
										},
										400 // this delay is purely for visual effect, waiting for pw entry to dismiss
									)
								}
							)
						} else {
							async_shouldToggle_fn(true) // no auth needed
						}
					}
				}, self.context)  
				div.appendChild(switchView.layer)
				self.autoDownloadUpdatesEnabled_switchView = switchView
			}
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_field_displayCcy()
	{
		const self = this
		let selectLayer_w = 132 // disclosure arrow visual alignment with change pw content right edge
		let selectLayer_h = 32
		//
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("DISPLAY CURRENCY", self.context)
			div.appendChild(labelLayer)
			//
			let selectContainerLayer = document.createElement("div")
			selectContainerLayer.style.position = "relative" // to container pos absolute
			selectContainerLayer.style.left = "0"
			selectContainerLayer.style.top = "0"
			selectContainerLayer.style.width = selectLayer_w+"px"
			selectContainerLayer.style.height =selectLayer_h+"px"
			//
			let ccySelectLayer = commonComponents_ccySelect.new_selectLayer()
			self.displayCcySelectLayer = ccySelectLayer
			self._configure_displayCcySelectLayer_value()
			{
				let selectLayer = ccySelectLayer
				// selectLayer.style.textAlign = "center"
				// selectLayer.style.textAlignLast = "center"
				selectLayer.style.outline = "none"
				selectLayer.style.color = "#FCFBFC"
				selectLayer.style.backgroundColor = "#383638"
				selectLayer.style.width = selectLayer_w+"px"
				selectLayer.style.height =selectLayer_h+"px"
				selectLayer.style.border = "0"
				selectLayer.style.padding = "0"
				selectLayer.style.borderRadius = "3px"
				selectLayer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
				selectLayer.style.webkitAppearance = "none" // apparently necessary in order to activate the following style.border…Radius
				selectLayer.style.MozAppearance = "none"
				selectLayer.style.msAppearance = "none"
				selectLayer.style.appearance = "none"
				self.context.themeController.StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
					selectLayer,
					true // bright content, dark bg
				)
				if (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
					selectLayer.style.textIndent = "4px"
				} else {
					selectLayer.style.textIndent = "11px"
				}
				{ // hover effects/classes
					selectLayer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
					selectLayer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
					selectLayer.classList.add(commonComponents_hoverableCells.ClassFor_Disableable())
				}
				//
				// observation
				ccySelectLayer.addEventListener(
					"change", 
					function()
					{
						self._ccySelectLayer_did_change()
					}
				)
			}
			selectContainerLayer.appendChild(ccySelectLayer)
			{
				const layer = document.createElement("div")
				self.disclosureArrowLayer = layer
				layer.style.pointerEvents = "none" // mustn't intercept pointer events
				layer.style.border = "none"
				layer.style.position = "absolute"
				const w = 10
				const h = 8
				let top = Math.ceil((selectLayer_h - h)/2)
				layer.style.width = w+"px"
				layer.style.height = h+"px"
				layer.style.right = "13px"
				layer.style.top = top+"px"
				layer.style.zIndex = "100" // above options_containerView 
				layer.style.backgroundImage = "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"SelectView/Resources/dropdown-arrow-down@3x.png)" // borrowing this
				layer.style.backgroundRepeat = "no-repeat"
				layer.style.backgroundPosition = "center"
				layer.style.backgroundSize = w+"px "+ h+"px"
				selectContainerLayer.appendChild(layer)			
			}
			div.appendChild(selectContainerLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_deleteEverythingButton()
	{
		const self = this
		const div = document.createElement("div")
		div.style.paddingTop = "23px"
		const titleText = self.context.isLiteApp ? "LOG OUT" : "DELETE EVERYTHING"
		const view = commonComponents_tables.New_redTextButtonView(titleText, self.context)
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
				var msg;
				if (self.context.isLiteApp != true) { 
					msg = 'Are you sure you want to delete all of your local data?\n\nAny wallets will remain permanently on the Monero blockchain but local data such as contacts will not be recoverable.'
				} else {
					msg = 'Are you sure you want to log out?'
				}
				self.context.windowDialogs.PresentQuestionAlertDialogWith(
					self.context.isLiteApp != true ? 'Delete everything?' : 'Log out?', 
					msg,
					self.context.isLiteApp != true ? 'Delete Everything' : 'Log Out', 
					'Cancel',
					function(err, didChooseYes)
					{
						if (err) {
							throw err
						}
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
		self.registrantForDeleteEverything_token = self.context.passwordController.AddRegistrantForDeleteEverything(self)
	}
	//
	// Lifecycle - Teardown - Overrides
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
		self.context.passwordController.RemoveRegistrantForDeleteEverything(self.registrantForDeleteEverything_token)
		self.registrantForDeleteEverything_token = null
	}
	//
	// Runtime - Accessors - Navigation
	Navigation_Title()
	{
		return "Preferences"
	}
	//
	// Runtime - Imperatives - UI config
	_configure_displayCcySelectLayer_value()
	{
		let self = this
		self.displayCcySelectLayer.value = self.context.settingsController.displayCcySymbol
	}
	_updateValidationErrorForAddressInputView(fn_orNil)
	{
		const self = this
		if (self.serverURLInputLayer == null || typeof self.serverURLInputLayer == 'undefined') {
			return // not included
		}
		//
		const fn = fn_orNil || function(didError, savableValue) {}
		var mutable_value = (self.serverURLInputLayer.value || "").replace(/^\s+|\s+$/g, '') // whitespace-stripped
		//
		var preSubmission_validationError = null;
		{
			if (mutable_value != "") {
				if (mutable_value.indexOf(".") == -1 && mutable_value.indexOf(":") == -1 && mutable_value.indexOf("localhost") == -1) {
					preSubmission_validationError = `Please enter a valid URL authority, e.g. ${config__MyMonero.API__authority}.`
				} else { // important else in the absence of reorganizing this code 
					// strip http:// and https:// prefix here.. there's got to be a better way to do this..
					// ... probably not a good idea to naively strip "*://" prefix ... or is it?
					const strippablePrefixes =
					[
						"https://",
						"http://",
						"//" // we can strip it for https anyway
					]
					for (var i = 0 ; i < strippablePrefixes.length ; i++) {
						const prefix = strippablePrefixes[i]
						if (mutable_value.indexOf(prefix) === 0) {
							mutable_value = mutable_value.slice(prefix.length, mutable_value.length)
						}
					}
				}
			}
		}
		if (preSubmission_validationError != null) {
			self.serverURL_setValidationMessage(preSubmission_validationError)
			self.serverURL_connecting_activityIndicatorLayer.style.display = "none" // hide
			// BUT we're also going to save the value so that the validation error here is displayed to the user
			//
			fn(true, null)
			return
		}
		const final_value = mutable_value
		fn(false, final_value) // no error, save value
	}
	//
	// Runtime - Imperatives - UI config - Validation messages - Server URL
	serverURL_setValidationMessage(validationMessageString)
	{
		const self = this
		if (validationMessageString === "" || !validationMessageString) {
			self.ClearValidationMessage()
			return
		}
		self.serverURLInputLayer.style.border = "1px solid #f97777"
		self.serverURL_validationMessageLayer.style.display = "block"
		self.serverURL_validationMessageLayer.innerHTML = validationMessageString
	}
	serverURL_clearValidationMessage()
	{
		const self = this
		self.serverURLInputLayer.style.border = "1px solid rgba(0,0,0,0)"//todo: factor this into method on component
		self.serverURL_validationMessageLayer.style.display = "none"
		self.serverURL_validationMessageLayer.innerHTML = ""
	}
	//
	// Runtime - Delegation - Navigation/View lifecycle
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
		{ // config change pw btn text, app timeout slider, …
			if (self.context.isLiteApp == true) {
				if (self.changePasswordButtonView) {
					throw "Did not expect self.changePasswordButtonView"
				}
				self.appTimeoutSlider_messageLayer.innerHTML = "Idle time before automatic log-out"
			} else {
				if (!self.changePasswordButtonView) {
					throw "Expected self.changePasswordButtonView"
				}
				const layer = self.changePasswordButtonView.layer
				const userSelectedTypeOfPassword = passwordController.userSelectedTypeOfPassword
				const passwordType_humanReadableString = passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[userSelectedTypeOfPassword]
				if (typeof passwordType_humanReadableString !== 'undefined') {
					const capitalized_passwordType = passwordType_humanReadableString.charAt(0).toUpperCase() + passwordType_humanReadableString.slice(1)
					layer.innerHTML = "Change " + capitalized_passwordType
					self.appTimeoutSlider_messageLayer.innerHTML = "Idle time before your " + passwordType_humanReadableString + " is required"
				}
			}
		}
		if (self.context.isLiteApp) {
			if (self.changePasswordButtonView) {
				throw "Did not expect self.changePasswordButtonView"
			}
			if (self.serverURLInputLayer) {
				throw "Did not expect self.serverURLInputLayer"
			}
			const walletsExist = self.context.walletsListController.records.length > 0
			self.appTimeoutRangeInputView.SetEnabled(true)
			self.displayCcySelectLayer.disabled = false
			self.displayCcySelectLayer.classList.remove("disabled")
			self.deleteEverything_buttonView.SetEnabled(walletsExist) // cause this is actually the 'log out' btn
		} else {
			if (passwordController.hasUserSavedAPassword !== true) {
				if (self.changePasswordButtonView) {
					self.changePasswordButtonView.SetEnabled(false) // can't change til entered
				}
				if (self.serverURLInputLayer) {
					self.serverURLInputLayer.disabled = false // enable - user may want to change URL before they add their first wallet
				}
				self.displayCcySelectLayer.disabled = true
				self.displayCcySelectLayer.classList.add("disabled")
				self.appTimeoutRangeInputView.SetEnabled(false) 
				self.requireWhenSending_switchView.SetEnabled(false) // cannot have them turn it off w/o pw because it should require a pw to de-escalate security measure
				self.requireWhenDisclosingWalletSecrets_switchView.SetEnabled(false) // cannot have them turn it off w/o pw because it should require a pw to de-escalate security measure
				self.deleteEverything_buttonView.SetEnabled(false)
				// 'auto-install updates' this should remain enabled
			} else if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app - prevent tampering
				// however, user should never be able to see the settings view in this state
				if (self.changePasswordButtonView) {
					self.changePasswordButtonView.SetEnabled(false)
				}
				if (self.serverURLInputLayer) {
					self.serverURLInputLayer.disabled = true
				}
				self.displayCcySelectLayer.disabled = true
				self.displayCcySelectLayer.classList.add("disabled")
				self.appTimeoutRangeInputView.SetEnabled(false)
				self.requireWhenSending_switchView.SetEnabled(false) // "
				self.requireWhenDisclosingWalletSecrets_switchView.SetEnabled(false) // "
				self.deleteEverything_buttonView.SetEnabled(false)
				// 'auto-install updates' this should remain enabled
			} else { // has entered PW - unlock
				if (self.changePasswordButtonView) {
					self.changePasswordButtonView.SetEnabled(true)
				}
				if (self.serverURLInputLayer) {
					self.serverURLInputLayer.disabled = false
				}
				self.displayCcySelectLayer.disabled = false
				self.displayCcySelectLayer.classList.remove("disabled")
				self.appTimeoutRangeInputView.SetEnabled(true)
				self.requireWhenSending_switchView.SetEnabled(true)
				self.requireWhenDisclosingWalletSecrets_switchView.SetEnabled(true)
				self.deleteEverything_buttonView.SetEnabled(true)
				// 'auto-install updates' this should remain enabled
			}
			// we only have password authentication in the Full app
			self.requireWhenSending_switchView.setChecked(
				self.context.settingsController.authentication_requireWhenSending,
				true, // squelch_changed_fn_emit - or we'd get redundant saves
				true // setWithoutShouldToggle - or we get asked to auth
			)
			self.requireWhenDisclosingWalletSecrets_switchView.setChecked(
				self.context.settingsController.authentication_requireWhenDisclosingWalletSecrets,
				true, // squelch_changed_fn_emit - or we'd get redundant saves
				true // setWithoutShouldToggle - or we get asked to auth
			)
			if (typeof self.autoDownloadUpdatesEnabled_switchView !== 'undefined') { // since it might not be supported (Linux)
				self.autoDownloadUpdatesEnabled_switchView.setChecked(
					self.context.settingsController.autoDownloadUpdatesEnabled,
					true, // squelch_changed_fn_emit - or we'd get redundant saves
					true // setWithoutShouldToggle - or we get asked to auth
				)
			}
		}
		{
			if (self.serverURLInputLayer) {
				self.serverURLInputLayer.value = self.context.settingsController.specificAPIAddressURLAuthority || ""
			}
			// and now that the value is set…
			self._updateValidationErrorForAddressInputView() // so we get validation error from persisted but incorrect value, if necessary for user feedback
		}
		{
			self._configure_displayCcySelectLayer_value()
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
	//
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
	//
	// Delegation - Interactions
	_ccySelectLayer_did_change()
	{
		let self = this
		self.context.settingsController.Set_settings_valuesByKey(
			{
				displayCcySymbol: self.displayCcySelectLayer.value
			},
			function(err)
			{
				if (err) {
					throw err
				}
			}
		)
	}
	_serverURLInputLayer_did_keyUp()
	{
		const self = this
		function __teardown_timeout_toSave_serverURL()
		{
			if (self.timeout_toSave_serverURL != null && typeof self.timeout_toSave_serverURL !== 'undefined') {
				clearTimeout(self.timeout_toSave_serverURL)
				self.timeout_toSave_serverURL = null
			}
		}
		__teardown_timeout_toSave_serverURL()
		self.serverURL_clearValidationMessage()
		{
			const entered_serverURL_value = self.serverURLInputLayer.value || ""
			if (entered_serverURL_value == "") {
				self.serverURL_connecting_activityIndicatorLayer.style.display = "none" // no need to show 'connecting…'
			} else {
				self.serverURL_connecting_activityIndicatorLayer.style.display = "block" // show
			}
		}
		// now wait until user is really done typing…
		self.timeout_toSave_serverURL = setTimeout(
			function()
			{
				__teardown_timeout_toSave_serverURL() // zero timer pointer
				//
				self._updateValidationErrorForAddressInputView( // also called on init so we get validation error on load
					function(didError, savableValue)
					{
						if (didError) {
							return // not proceeding to save
						}
						const currentValue = self.context.settingsController.specificAPIAddressURLAuthority || ""
						if (savableValue == currentValue) {
							// do not clear/re-log-in on wallets if we're, e.g., resetting the password programmatically after the user has canceled deleting all wallets
							self.serverURL_connecting_activityIndicatorLayer.style.display = "none" // hide
							return
						}
						self.context.settingsController.Set_settings_valuesByKey(
							{
								specificAPIAddressURLAuthority: savableValue
							},
							function(err)
							{
								if (err) { // write failed
									self.serverURL_setValidationMessage("" + err)
									// so, importantly, revert the input contents, b/c the write failed
									self.serverURLInputLayer.value = self.context.settingsController.specificAPIAddressURLAuthority
									// but don't exit before hiding the 'connecting…' indicator
								}
								self.serverURL_connecting_activityIndicatorLayer.style.display = "none" // hide
							}
						)
					}
				)
			},
			600
		)
	}
	//
	// Delegation - Delete everything
	passwordController_DeleteEverything(
		fn // this MUST be called
	) {
		const self = this
		self.layer.scrollTop = 0
		//
		fn() // this MUST get called
	}
}
module.exports = SettingsView
