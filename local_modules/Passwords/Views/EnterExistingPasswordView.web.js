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
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web')
//
class EnterExistingPasswordView extends View
{
	constructor(options, context)
	{
		super(options, context)
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
		// self.DEBUG_BorderAllLayers()
	}
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_validationMessageLayer()
		self._setup_inputFieldGroup()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.backgroundColor = "#272527"
		const paddingTop = 44 // the
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
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer("")
		layer.ClearAndHideMessage()
		layer.style.position = "absolute" // so as not to mess w/ layout
		layer.style.width = "100%"
		self.validationMessageLayer = layer
		self.layer.appendChild(layer)				
	}
	_setup_inputFieldGroup()
	{
		const self = this
		const table = document.createElement("table") // cause table are amazing
		table.style.height = "100%"
		table.style.width = "100%"
		table.style.marginTop = "-26px" // to get visual offset
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
			var layer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "To continue",
				target_width: 272
			})
			self.passwordInputLayer = layer
			layer.type = "password"
			layer.style.webkitAppRegion = "no-drag"
			layer.style.height = "32px"
			layer.addEventListener(
				"keyup",
				function(event)
				{
					const value = layer.value
					var submitEnabled;
					if (typeof value === 'undefined' || value === null || value === "") {
						submitEnabled = false
					} else {
						submitEnabled = true
					}
					self.navigationController.navigationBarView.rightBarButtonView.SetEnabled(submitEnabled)
					if (submitEnabled) {
						if (event.keyCode === 13) {
							self._tryToSubmitForm()
						}
					}
				}
			)
			containerLayer.appendChild(layer)
		}
		{ // 'Forgot?' btn
			const view = self._new_forgotLinkView()
			const a = view.layer
			containerLayer.appendChild(a)
		}
		td.appendChild(containerLayer)
		tr.appendChild(td)
		table.appendChild(tr)
		self.layer.appendChild(table)
		//
		setTimeout(function()
		{ // let's wait til we're all presented or we might cause scroll weirdness
			self.passwordInputLayer.focus()
		}, 400)
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
		const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
		return "Enter " + passwordType_humanReadableString
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		if (self.isForChangingPassword !== true) {
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
	// Runtime - Accessors 
	//
	_new_forgotLinkView()
	{
		const self = this
		const view = commonComponents_tables.New_clickableLinkButtonView(
			"Forgot?", 
			self.context, 
			function()
			{
				self._pushForgotPasswordView()
			}
		)
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
		self.passwordInputLayer.style.border = "1px solid #f97777"
		self.validationMessageLayer.SetValidationError(validationMessageString || "")
	}
	ClearValidationMessage()
	{
		const self = this
		self.passwordInputLayer.style.border = "none"//todo: factor this into method on component
		self.validationMessageLayer.SetValidationError("")
	}
	//
	//
	// Runtime - Imperatives - Internal
	//
	_tryToSubmitForm()
	{
		const self = this
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
		console.log("TODO: _pushForgotPasswordView")
	}
}
module.exports = EnterExistingPasswordView
