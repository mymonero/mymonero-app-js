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
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_walletColorPicker = require('../../MMAppUICommonComponents/walletColorPicker.web')
//
const BaseView_AWalletWizardScreen = require('./BaseView_AWalletWizardScreen.web')
//
class BaseView_Wallet_MetaInfo extends BaseView_AWalletWizardScreen
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{ // metrics / caches
			self.margin_h = 10
		}
		self._setup_validationMessageLayer()
		self._setup_form_containerLayer()
	}
	__setup_self_layer()
	{
		const self = this
		super.__setup_self_layer()
		// adding padding
		self.layer.style.padding = `0 ${self.margin_h}px 0px ${self.margin_h}px`
	}
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "")
		layer.style.width = "calc(100% - 48px)"
		layer.style.marginLeft = "24px"
		layer.ClearAndHideMessage()
		self.validationMessageLayer = layer
		self.layer.appendChild(layer)				
	}
	_setup_form_containerLayer()
	{
		const self = this
		const containerLayer = document.createElement("div")
		self.form_containerLayer = containerLayer
		self.layer.appendChild(containerLayer)
	}
	_setup_startObserving()
	{
		const self = this
		super._setup_startObserving()
	}
	_setup_form_walletNameField()
	{ // Wallet Name
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("WALLET NAME", self.context)
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "For your reference"
			})
			self.walletNameInputLayer = valueLayer
			valueLayer.addEventListener(
				"keypress",
				function(event)
				{
					self.AWalletFieldInput_did_keypress(event)
				}
			)
			valueLayer.addEventListener(
				"keyup",
				function(event)
				{
					self.AWalletFieldInput_did_keyup(event) // defined on super
				}
			)
			div.appendChild(valueLayer)
		}
		self.walletNameFieldContainerLayer = div
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_walletSwatchField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingRight = "0px" // special case
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("COLOR", self.context)
			div.appendChild(labelLayer)
			//
			const view = commonComponents_walletColorPicker.New_1OfN_WalletColorPickerInputView(
				self.context,
				undefined // means select whatever color is not yet in use else the first one
			)
			self.walletColorPickerInputView = view
			div.appendChild(view.layer)
		}
		self.walletSwatchFieldContainerLayer = div
		self.form_containerLayer.appendChild(div)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
	}
	//
	//
	// Runtime - Accessors - Navigation Bar
	//
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		self.rightBarButtonView = view
		const layer = view.layer
		layer.innerHTML = "Next"
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (self.isSubmitButtonDisabled !== true) { // button is enabled
						self._userSelectedNextButton()
					}
				}
				return false
			}
		)
		self.set_submitButtonNeedsUpdate() // will be disabled on first push - but not necessarily on hitting Back
		return view
	}
	//
	//
	// Runtime - Accessors - Overridable
	//
	_overridable_canEnableSubmitButton()
	{
		const self = this
		if (self.walletNameInputLayer) { // it may be nil, e.g. in the lite app
			const walletName = self.walletNameInputLayer.value
			if (walletName.length == 0 || !walletName) {
				return false
			}
		}		
		return true
	}
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
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
	set_submitButtonNeedsUpdate()
	{
		const self = this
		setTimeout(function()
		{ // to make sure consumers' prior updates have a chance to kick in
			const canEnable = self._overridable_canEnableSubmitButton()
			if (canEnable == true) {
				self.enable_submitButton() // can just call directly cause it locks by state
			} else {
				self.disable_submitButton()
			}
		})
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this 
		throw "You must override " + self.constructor.name + "/_userSelectedNextButton() in your subclass."
	}
	AWalletFieldInput_did_keypress(event)
	{
		const self = this
		if (event.keyCode === 13) { // return key
			event.preventDefault() // do not let return/accept create a newline ; in case this is a textarea
			if (self.isSubmitButtonDisabled !== true) {
				self._userSelectedNextButton()
			}
			return false // do not let return/accept create a newline
		}
		self.set_submitButtonNeedsUpdate()
	}
	AWalletFieldInput_did_keyup(event)
	{
		const self = this
		self.set_submitButtonNeedsUpdate()
	}
}
module.exports = BaseView_Wallet_MetaInfo