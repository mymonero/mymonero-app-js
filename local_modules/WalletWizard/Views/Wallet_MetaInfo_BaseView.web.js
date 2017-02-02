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
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web')
const commonComponents_walletColorPicker = require('../../WalletAppCommonComponents/walletColorPicker.web')
//
const AddWallet_Wizard_ScreenBaseView = require('./AddWallet_Wizard_ScreenBaseView.web')
//
class Wallet_MetaInfo_BaseView extends AddWallet_Wizard_ScreenBaseView
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{ // metrics / caches
			self.margin_h = 10
		}
		self._setup_self_layer()
		self._setup_validationMessageLayer()
		self._setup_form_containerLayer()
	}
	_setup_self_layer()
	{
		const self = this
		//
		self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		self.layer.style.position = "relative"
		self.layer.style.width = `calc(100% - ${ 2 * self.margin_h }px)`
		self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		self.layer.style.padding = `0 ${self.margin_h}px 0px ${self.margin_h}px` // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		self.layer.style.overflowY = "scroll"
		//
		self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		self.layer.style.color = "#c0c0c0" // temporary
		//
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_validationMessageLayer()
	{ // validation message
		const self = this
		const layer = commonComponents_tables.New_inlineMessageDialogLayer("")
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
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("WALLET NAME") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
				placeholderText: "For your reference only"
			})
			self.walletNameInputLayer = valueLayer
			{
				valueLayer.addEventListener(
					"keyup",
					function(event)
					{
						self._walletNameInputLayer_did_keyup(event)
					}
				)
			}
			div.appendChild(valueLayer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_walletSwatchField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("COLOR") // note use of _forms.
			div.appendChild(labelLayer)
			//
			const view = commonComponents_walletColorPicker.New_1OfN_WalletColorPickerInputView(
				self.context,
				undefined // means select whatever color is not yet in use else the first one
			)
			div.appendChild(view.layer)
		}
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
		self.disable_submitButton()
		return view
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
			const buttonLayer = self.rightBarButtonView.layer
			buttonLayer.style.opacity = "0.5"
		}
	}
	enable_submitButton()
	{
		const self = this
		if (self.isSubmitButtonDisabled !== false) {
			self.isSubmitButtonDisabled = false
			const buttonLayer = self.rightBarButtonView.layer
			buttonLayer.style.opacity = "1.0"
		}
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this
	}
	_walletNameInputLayer_did_keyup(event)
	{
		const self = this
		if (event.keyCode === 13) { // return key
			// TODO?
		}
	}
}
module.exports = Wallet_MetaInfo_BaseView