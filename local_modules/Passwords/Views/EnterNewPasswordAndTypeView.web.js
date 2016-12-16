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
class EnterNewPasswordAndTypeView extends View
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
	// Runtime - Accessors - Public - Events
	//
	EventName_UserSubmittedNonZeroPasswordAndPasswordType()
	{
		return "EventName_UserSubmittedNonZeroPasswordAndPasswordType"
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
	PasswordType()
	{
		const self = this
		const layer = self.selected_checked_passwordTypeRadioInput()
		if (typeof layer === 'undefined' || layer === null) {
			throw "layer undefined or null in Password()"
			return ""
		}
		//
		return layer.value
	}
	//
	//
	// Runtime - Accessors - Internal - UI & UI metrics - Shared
	//
	idPrefix()
	{
		return "EnterNewPasswordAndTypeView"
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
	// Runtime - Accessors - Internal - UI & UI metrics - Cancel button
	//
	idForChild_cancelButtonLayer()
	{
		const self = this
		//
		return self.idPrefix() + "_idForChild_cancelButtonLayer"
	}
	new_htmlStringFor_cancelButtonLayer()
	{
		const self = this
		const htmlString = `<a id="${ self.idForChild_cancelButtonLayer() }" href="#">Cancel</a>`
		//
		return htmlString
	}
	selected_cancelButtonLayer()
	{
		const self = this
		const layer = self.layer.querySelector(`a#${ self.idForChild_cancelButtonLayer() }`)
		//
		return layer
	}
	
	
	
	//
	//
	// Runtime - Imperatives - Interface - Configuration 
	//
	ConfigureToBeShown(isForChangingPassword)
	{
		const self = this
		{
			self.isForChangingPassword = isForChangingPassword
		}
		{
			const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
			if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == "" || typeof userSelectedTypeOfPassword === 'undefined') {
				throw "ConfigureToBeShown called but userSelectedTypeOfPassword undefined"
			}
			self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
		}
		self._configureUI()
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
	_configureUI()
	{
		const self = this
		// const availableUserSelectableTypesOfPassword = self.context.passwordController.AvailableUserSelectableTypesOfPassword()
		// var humanReadable_passwordType = 'password'
		// switch (self.userSelectedTypeOfPassword) {
		// 	case availableUserSelectableTypesOfPassword.FreeformStringPW:
		// 		humanReadable_passwordType = 'password'
		// 		break
		// 	case availableUserSelectableTypesOfPassword.SixCharPIN:
		// 		humanReadable_passwordType = 'PIN'
		// 		break
		// 	default:
		// 		throw "this switch should be exhaustive but no longer is"
		// }
		{ // constructing the innerHTML
			var htmlString = 
				self.new_htmlStringFor_validationMessageLabelLayer()
				+ `<h3>Please enter a new password or PIN:</h3>`
				+ self.new_htmlStringFor_inputFieldLayer()
			if (self.isForChangingPassword === true) {
				htmlString += self.new_htmlStringFor_cancelButtonLayer()
			}
			self.layer.innerHTML = htmlString
		}
		{ // JS-land setup, observation, etc:
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
							self._yield_nonZeroPasswordAndPasswordType()
						}
					}
				)
				setTimeout(function()
				{
					layer.focus()
				}, 100)
			}
			{ // validationMessageLabelLayer styling since we can't do that inline due to CSP
				const layer = self.selected_validationMessageLabelLayer() // now we can select it from the DOM
				layer.style.color = "red"
				layer.style.fontWeight = "bold"
				layer.style.display = "block"
			}
			{ // cancel button, if applicable
				if (self.isForChangingPassword === true) {
					const layer = self.selected_cancelButtonLayer() // now we can select it from the DOM
					layer.style.display = "block"
					layer.addEventListener(
						"click",
						function(event)
						{
							event.preventDefault()
							self._yield_cancelButtonPressed()
							//
							return false
						}
					)
				}
			}
		}
	}
	_yield_nonZeroPasswordAndPasswordType()
	{
		const self = this
		self.emit(
			self.EventName_UserSubmittedNonZeroPasswordAndPasswordType()
		)
	}
	_yield_cancelButtonPressed(cancelButton)
	{
		const self = this
		self.emit(
			self.EventName_CancelButtonPressed()
		)
	}
	
}
module.exports = EnterNewPasswordAndTypeView
