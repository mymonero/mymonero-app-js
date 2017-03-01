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
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
//
class EnterNewPasswordView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.isForChangingPassword = options.isForChangingPassword
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
	}
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_form()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.backgroundColor = "#272527"
		const paddingTop = 41 // the nav bar height - we should prolly do this on VDA and ask for actual height
		const padding_h = 10
		layer.style.paddingTop = paddingTop + "px"
		layer.style.width = `calc(100% - ${2 * 14}px)`
		layer.style.paddingLeft = padding_h + "px"
		layer.style.height = `calc(100% - ${paddingTop}px)`
	}
	_setup_form()
	{
		const self = this
		self._setup_form_containerLayer()
	}
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		self._setup_form_passwordInputField()
		self._setup_form_confirmPasswordInputField()
		self.layer.appendChild(containerLayer)
	}
	_setup_form_passwordInputField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		div.style.paddingBottom = "10px" // extra spacer
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("PIN OR PASSWORD", self.context)
			div.appendChild(labelLayer)
			//
			const layer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: ""
			})
			layer.type = "password"
			self.passwordInputLayer = layer
			layer.addEventListener(
				"keyup",
				function(event)
				{
					self.APasswordFieldInput_did_keyup(event)
				}
			)
			div.appendChild(layer)
			//
			const messageLayer = commonComponents_forms.New_fieldAccessory_messageLayer(self.context)
			messageLayer.innerHTML = "This will be used to encrypt your data on your computer. Don't forget it!"
			div.appendChild(messageLayer)
		}
		self.form_containerLayer.appendChild(div)
		//
		setTimeout(function()
		{ // let's wait til we're all presented or we might cause scroll weirdness
			self.passwordInputLayer.focus()
		}, 400)
	}
	_setup_form_confirmPasswordInputField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer()
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("CONFIRM", self.context)
			div.appendChild(labelLayer)
			//
			const layer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: ""
			})
			layer.type = "password"
			self.confirmPasswordInputLayer = layer
			layer.addEventListener(
				"keyup",
				function(event)
				{
					self.APasswordFieldInput_did_keyup(event)
				}
			)
			div.appendChild(layer)
			//
			const validationMessageLayer = commonComponents_forms.New_fieldAccessory_validationMessageLayer(self.context)
			validationMessageLayer.style.display = "none"
			self.validationMessageLayer = validationMessageLayer
			div.appendChild(validationMessageLayer)
		}
		self.form_containerLayer.appendChild(div)
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
		const layer = self.passwordInputLayer
		if (typeof layer === 'undefined' || layer === null) {
			throw "layer undefined or null in Password()"
			return ""
		}
		//
		return layer.value
	}
	ConfirmationPassword()
	{
		const self = this
		const layer = self.confirmPasswordInputLayer
		if (typeof layer === 'undefined' || layer === null) {
			throw "layer undefined or null in Password()"
			return ""
		}
		//
		return layer.value
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		if (self.isForChangingPassword === true) {
			return "Create New PIN or Password"
		}
		return "Create PIN or Password"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
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
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						if (view.isEnabled === true) {
							self._tryToSubmitForm()
						}
					}
					return false
				}
			)
		}
		view.SetEnabled(false) // need to enter PW first
		return view
	}
	//
	//
	// Runtime - Imperatives - Interface - Configuration 
	//
	SetValidationMessage(validationMessageString)
	{
		const self = this
		if (validationMessageString === "" || !validationMessageString) {
			self.ClearValidationMessage()
			return
		}
		self.confirmPasswordInputLayer.style.border = "1px solid #f97777"
		self.validationMessageLayer.style.display = "block"
		self.validationMessageLayer.innerHTML = validationMessageString
	}
	ClearValidationMessage()
	{
		const self = this
		self.confirmPasswordInputLayer.style.border = "1px solid rgba(0,0,0,0)"//todo: factor this into method on component
		self.validationMessageLayer.style.display = "none"
		self.validationMessageLayer.innerHTML = ""
	}
	//
	//
	// Runtime - Imperatives - Internal
	//
	_tryToSubmitForm()
	{
		const self = this
		const password = self.Password()
		const confirmationPassword = self.ConfirmationPassword()
		if (password !== confirmationPassword) {
			self.SetValidationMessage("Oops, that doesn't match")
			return
		}
		if (confirmationPassword.length < 6) {
			self.SetValidationMessage("Please enter more than 6 characters")
			return
		}
		self.ClearValidationMessage()
		self._yield_nonZeroPasswordAndPasswordType()
	}
	_yield_nonZeroPasswordAndPasswordType()
	{
		const self = this
		self.emit(
			self.EventName_UserSubmittedNonZeroPassword(),
			self.Password()
		)
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	APasswordFieldInput_did_keyup(e)
	{
		const self = this
		if (event.keyCode === 13) {
			if (self.navigationController.navigationBarView.rightBarButtonView.isEnabled !== false) {
				self._tryToSubmitForm()
			}
		}
		//
		const password = self.Password()
		const confirmationPassword = self.ConfirmationPassword()
		var submitEnabled;
		if (typeof password === 'undefined' || password === null || password === "") {
			submitEnabled = false
		} else if (typeof confirmationPassword === 'undefined' || confirmationPassword === null || confirmationPassword === "") {
			submitEnabled = false
		} else {
			submitEnabled = true
		}
		self.navigationController.navigationBarView.rightBarButtonView.SetEnabled(submitEnabled)
	}
}
module.exports = EnterNewPasswordView
