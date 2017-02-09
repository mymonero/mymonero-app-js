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
		layer.style.width = "100%"
		layer.style.height = "100%"
		self.layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				const inputFieldLayer = self.selected_inputFieldLayer() // now we can select it from the DOM
				if (typeof inputFieldLayer !== 'undefined' && inputFieldLayer !== null) {
					inputFieldLayer.focus()
				}
				return false
			}
		)
	}
	_setup_form()
	{
		const self = this
		const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
		{ // constructing the innerHTML
			var htmlString = 
				self.new_htmlStringFor_validationMessageLabelLayer()
				+ `<h3>Please enter your ${ self.isForChangingPassword ? "current " : "" }${passwordType_humanReadableString}:</h3>`
				+ self.new_htmlStringFor_inputFieldLayer()
			self.layer.innerHTML = htmlString
		}
		{ // DOM select -> setup, observe, etc:
			{ // validationMessageLabelLayer styling since we can't do that inline due to CSP
				const layer = self.selected_validationMessageLabelLayer() // now we can select it from the DOM
				layer.style.color = "red"
				layer.style.fontWeight = "bold"
				layer.style.fontSize = "16px"
				layer.style.height = "24px" // fix the height so layout doesn't move when validation error comes in
				layer.style.textAlign = "center"
				layer.style.display = "block"
				layer.style.width = "calc(100% - 60px)"
				layer.style.paddingLeft = "30px"
				layer.style.paddingRight = "30px"
			}
			{
				const layer = self.layer.querySelector("h3")
				layer.style.textAlign = "center"
				layer.style.width = "calc(100% - 60px)"
				layer.style.paddingLeft = "30px"
				layer.style.paddingRight = "30px"
			}
			{ // inputFieldLayer
				const layer = self.selected_inputFieldLayer() // now we can select it from the DOM
				{
					layer.style.webkitAppRegion = "no-drag"
					layer.style.textAlign = "center"
					layer.style.width = "150px"
					layer.style.height = "40px"
					layer.style.fontSize = "16px"
					layer.style.display = "block"
					layer.style.margin = "20px auto"
				}
				layer.addEventListener(
					"keyup",
					function(event)
					{
						if (event.keyCode === 13) {
							const password = layer.value
							if (typeof password === 'undefined' || password === null || password === "") {
								return // give feedback if necessary (beep?)
							}
							self._yield_nonZeroPassword(password)
						}
					}
				)
				setTimeout(function()
				{
					layer.focus()
				}, 400)
			}
		}
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
		const layer = self.selected_inputFieldLayer()
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
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	idPrefix()
	{
		return "EnterExistingPasswordView"
	}
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Text input field
	//
	idForChild_inputField()
	{
		const self = this
		//
		return self.idPrefix() + "_idForChild_inputField"
	}
	new_htmlStringFor_inputFieldLayer()
	{
		const self = this
		const htmlString = `<input type="password" id="${ self.idForChild_inputField() }" />`
		//
		return htmlString
	}
	selected_inputFieldLayer()
	{
		const self = this
		const layer = self.layer.querySelector(`input#${ self.idForChild_inputField() }`)
		//
		return layer
	}
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Validation message label
	//
	idForChild_validationMessageLabelLayer()
	{
		const self = this
		//
		return self.idPrefix() + "_idForChild_validationMessageLabel"
	}
	new_htmlStringFor_validationMessageLabelLayer()
	{
		const self = this
		const htmlString = `<span id="${ self.idForChild_validationMessageLabelLayer() }"></span>`
		//
		return htmlString
	}
	selected_validationMessageLabelLayer()
	{
		const self = this
		const layer = self.layer.querySelector(`span#${ self.idForChild_validationMessageLabelLayer() }`)
		//
		return layer
	}
	//
	//
	// Runtime - Imperatives - Interface - Configuration 
	//
	SetValidationMessage(validationMessageString)
	{
		const self = this
		const validationMessageLabelLayer = self.selected_validationMessageLabelLayer()
		validationMessageLabelLayer.innerHTML = validationMessageString || ""
	}
	//
	//
	// Runtime - Imperatives - Internal
	//
	_yield_nonZeroPassword(password)
	{
		const self = this
		self.emit(
			self.EventName_UserSubmittedNonZeroPassword(),
			password
		)
	}
}
module.exports = EnterExistingPasswordView
