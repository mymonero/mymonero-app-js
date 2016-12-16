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
//
class EnterExistingPasswordView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
	}
	//
	//
	// Runtime - Accessors - Events
	//
	EventName_UserSubmittedNonZeroPassword()
	{
		return "EventName_UserSubmittedNonZeroPassword"
	}
	//
	//
	// Runtime - Accessors - Products
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
	// Runtime - Accessors - Internal - UI & UI metrics - Text input field
	//
	idForChild_inputField()
	{
		return "EnterExistingPasswordView_idForChild_inputField"
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
		return "EnterExistingPasswordView_idForChild_validationMessageLabel"
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
	ConfigureToBeShown()
	{
		const self = this
		const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
		if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == "" || typeof userSelectedTypeOfPassword === 'undefined') {
			throw "ConfigureToBeShown called but userSelectedTypeOfPassword undefined"
		}
		self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
		self._configureUIGivenPasswordType()
	}
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
	_configureUIGivenPasswordType()
	{
		const self = this
		const availableUserSelectableTypesOfPassword = self.context.passwordController.AvailableUserSelectableTypesOfPassword()
		var humanReadable_passwordType = 'password'
		switch (self.userSelectedTypeOfPassword) {
			case availableUserSelectableTypesOfPassword.FreeformStringPW:
				humanReadable_passwordType = 'password'
				break
			case availableUserSelectableTypesOfPassword.SixCharPIN:
				humanReadable_passwordType = 'PIN'
				break
			default:
				throw "this switch should be exhaustive but no longer is"
		}
		self.layer.innerHTML = 
			self.new_htmlStringFor_validationMessageLabelLayer()
			+ `<h3>Please enter your ${humanReadable_passwordType}:</h3>`
			+ self.new_htmlStringFor_inputFieldLayer()
		{ // inputFieldLayer
			const layer = self.selected_inputFieldLayer() // now we can select it from the DOM
			layer.addEventListener(
				"keyup",
				function(event)
				{
					if (event.keyCode === 13) {
						const password = layer.value
						if (typeof password === 'undefined' || password === null || password === "") {
							return // give feedback if necessary (beep?)
						}
						self._yieldNonZeroPassword(password)
					}
				}
			)
			setTimeout(function()
			{
				layer.focus()
			}, 5)
		}
		{ // validationMessageLabelLayer styling since we can't do that inline due to CSP
			const layer = self.selected_validationMessageLabelLayer() // now we can select it from the DOM
			layer.style.color = "red"
			layer.style.fontWeight = "bold"
			layer.style.display = "block"
		}
	}
	_yieldNonZeroPassword(password)
	{
		const self = this
		self.emit(
			self.EventName_UserSubmittedNonZeroPassword(),
			password
		)
	}	
}
module.exports = EnterExistingPasswordView
