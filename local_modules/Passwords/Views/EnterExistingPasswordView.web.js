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
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
//
const ForgotPasswordView = require('./ForgotPasswordView.web')
//
class EnterExistingPasswordView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		self.isForChangingPassword = options.isForChangingPassword
		self.isForAuthorizingAppActionOnly = options.isForAuthorizingAppActionOnly
		self.customNavigationBarTitle_orNull = options.customNavigationBarTitle_orNull
		{
			const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
			if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == "" || typeof userSelectedTypeOfPassword === 'undefined') {
				throw "ConfigureToBeShown called but userSelectedTypeOfPassword undefined"
			}
			self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self._setup_views()
		// self.DEBUG_BorderAllLayers()
	}
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_inputFieldGroup()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.backgroundColor = "#272527"
		const paddingTop = 41 // the nav bar height - we should prolly do this on VDA and ask for actual height
		layer.style.paddingTop = paddingTop + "px"
		layer.style.width = "100%"
		layer.style.height = `calc(100% - ${paddingTop}px)`
		self.layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				self.passwordInputLayer.focus()
				return false
			}
		)
	}
	_setup_inputFieldGroup()
	{
		const self = this
		const table = document.createElement("table")
		table.style.height = "100%"
		table.style.width = "100%"
		table.style.marginTop = "-26px" // to get exact visual offset
		const tr = document.createElement("tr")
		tr.style.width = "100%"
		tr.style.height = "100%"
		const td = document.createElement("td")
		td.align = "center"
		td.valign = "middle"
		td.style.width = "100%"
		td.style.height = "100%"
		const containerLayer = document.createElement("div")
		containerLayer.style.width = "272px"
		containerLayer.style.textAlign = "left"
		{
			const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
			const layer = commonComponents_forms.New_fieldTitle_labelLayer(passwordType_humanReadableString.toUpperCase(), self.context)
			layer.style.width = "auto"
			layer.style.display = "inline-block"
			layer.style.float = "left"
			layer.style.marginTop = "0"
			self.passwordInputLabelLayer = layer
			containerLayer.appendChild(layer)
		}

		if (self.isForAuthorizingAppActionOnly != true) { // no need to show if true
			// 'Forgot?' btn
			const view = commonComponents_tables.New_clickableLinkButtonView(
				"Forgot?", 
				self.context, 
				function()
				{
					self._pushForgotPasswordView()
				}
			)
			self.forgotPassword_buttonView = view
			const layer = view.layer
			layer.style.margin = "0 9px 0 0" 
			
			layer.style.display = "inline-block"
			layer.style.float = "right"
			layer.style.clear = "none"
			containerLayer.appendChild(layer)
		}
		{
			var layer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "To continue",
				target_width: 272
			})
			self.passwordInputLayer = layer
			layer.type = "password"
			layer.style.webkitAppRegion = "no-drag"
			layer.style.height = "32px"
			function __updateRightBarButtonSubmittableByLayerContent()
			{
				const value = layer.value
				var submitEnabled; // TODO: factor this ala set_needsUpdate with canEnable etc
				if (typeof value === 'undefined' || value === null || value === "") {
					submitEnabled = false
				} else {
					submitEnabled = true
				}
				// v--- we're assuming we've been added to the nav C by any keyup
				self.navigationController.navigationBarView.rightBarButtonView.SetEnabled(submitEnabled)
				//
				return submitEnabled;
			}
			layer.addEventListener(
				"keyup",
				function(event)
				{
					const submitEnabled = __updateRightBarButtonSubmittableByLayerContent()
					if (submitEnabled) {
						if (event.keyCode === 13) {
							self._tryToSubmitForm()
						}
					}
				}
			)
			layer.addEventListener(
				"change",
				function(event)
				{
					__updateRightBarButtonSubmittableByLayerContent()
				}
			)
			layer.addEventListener(
				"paste",
				function(event)
				{
					setTimeout(function() {
						__updateRightBarButtonSubmittableByLayerContent()
					}, 300) // wait a little because value seems not to be readable otherwise
				}
			)
			containerLayer.appendChild(layer)
		}
		{
			const layer = commonComponents_forms.New_fieldAccessory_validationMessageLayer(self.context)
			layer.style.height = "24px"
			self.validationMessageLayer = layer
			containerLayer.appendChild(layer)
		}
		td.appendChild(containerLayer)
		tr.appendChild(td)
		table.appendChild(tr)
		self.layer.appendChild(table)
	}	
	//
	//
	// Runtime - Accessors - Public - Events
	//
	EventName_UserSubmittedNonZeroPassword()
	{
		return "EventName_UserSubmittedNonZeroPassword"
	}
	EventName_CancelButtonPressed()
	{
		return "EventName_CancelButtonPressed"
	}
	//
	//
	// Runtime - Accessors - Public - Products
	//
	Password()
	{
		const self = this
		return self.passwordInputLayer.value
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		if (self.customNavigationBarTitle_orNull != null && typeof self.customNavigationBarTitle_orNull !== 'undefined' && self.customNavigationBarTitle_orNull != "") {
			return self.customNavigationBarTitle_orNull
		}
		const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
		//
		return "Enter "+passwordType_humanReadableString.replace(/^\w/, function(chr) {
			return chr.toUpperCase()
		})
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		if (self.isForChangingPassword !== true && self.isForAuthorizingAppActionOnly !== true) {
			return null
		}
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				self.emit(self.EventName_CancelButtonPressed())
				return false
			}
		)
		return view
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		view.layer.innerHTML = "Next"
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (view.isEnabled === true) {
					self._tryToSubmitForm()
				}
				return false
			}
		)
		const passwordInputValue = self.passwordInputLayer.value
		var canEnable = true
		if (typeof passwordInputValue === 'undefined' || passwordInputValue === null || passwordInputValue === "") {
			canEnable = false // need to enter PW first
		}
		self.rightBarButtonView = view
		view.SetEnabled(canEnable) 
		return view
	}
	//
	//
	// Runtime - Imperatives - Interface - Configuration 
	//
	ReEnableSubmittingForm()
	{
		const self = this
		self.__reEnableForm()
	}
	SetValidationMessage(validationMessageString)
	{
		const self = this
		if (validationMessageString === "" || !validationMessageString) {
			self.ClearValidationMessage()
			return
		}
		self.passwordInputLayer.style.border = "1px solid #f97777"
		self.validationMessageLayer.innerHTML = validationMessageString
	}
	ClearValidationMessage()
	{
		const self = this
		self.passwordInputLayer.style.border = "1px solid rgba(0,0,0,0)"//todo: factor this into method on component
		self.validationMessageLayer.innerHTML = ""
	}
	//
	// Runtime - Imperatives - Submit button enabled state
	disable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== true) {
			self.isSubmitButtonDisabled = true
			self.rightBarButtonView.SetEnabled(false)
		}
	}
	enable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== false) {
			self.isSubmitButtonDisabled = false
			self.rightBarButtonView.SetEnabled(true)
		}
	}
	//
	//
	// Runtime - Imperatives - Internal
	//
	__disableForm()
	{
		const self = this
		self.disable_submitButton()
		self.passwordInputLayer.disabled = true
		if (typeof self.forgotPassword_buttonView !== 'undefined' && self.forgotPassword_buttonView) {
			self.forgotPassword_buttonView.SetEnabled(false)
		}
	}
	__reEnableForm()
	{
		const self = this
		self.enable_submitButton()
		self.passwordInputLayer.disabled = undefined
		self.passwordInputLayer.focus() // since disable would have de-focused
		if (typeof self.forgotPassword_buttonView !== 'undefined' && self.forgotPassword_buttonView) {
			self.forgotPassword_buttonView.SetEnabled(true)
		}
	}
	//
	_tryToSubmitForm()
	{
		const self = this
		self.__disableForm()
		// we can assume pw is not "" here
		self.__yield_nonZeroPassword(self.Password())
	}
	__yield_nonZeroPassword(password)
	{
		const self = this
		self.emit(
			self.EventName_UserSubmittedNonZeroPassword(),
			password
		)
	}
	//
	_pushForgotPasswordView()
	{
		const self = this
		const view = new ForgotPasswordView({}, self.context)
		self.navigationController.PushView(view, true)
	}
	//
	//
	// Delegation - View visibility
	// 
	viewDidAppear()
	{
		super.viewDidAppear()
		//
		const self = this
		setTimeout(function()
		{ // let's wait til we're all presented or we might cause scroll weirdness
			// and we'll do this in VDA instead of setup so it focuses selects every time we pop back to it too
			self.passwordInputLayer.focus()
		}, 440)
	}
}
module.exports = EnterExistingPasswordView
