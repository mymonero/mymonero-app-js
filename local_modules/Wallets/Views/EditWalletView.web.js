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
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_walletColorPicker = require('../../MMAppUICommonComponents/walletColorPicker.web')
//
const emoji_selection = require('../../Emoji/emoji_selection')
//
class EditWalletView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		{ // options
			self.wallet = self.options.wallet
			if (!self.wallet) {
				throw self.constructor.name + " requires an options.wallet"
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		{
			const layer = self.layer
			layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
			//
			layer.style.width = "100%"
			layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
			layer.style.boxSizing = "border-box"
			//
			layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
			//
			layer.style.color = "#c0c0c0" // temporary
			//
			layer.style.overflowY = "auto"
			layer.classList.add( // so that we get autoscroll to form field inputs on mobile platforms
				commonComponents_forms.ClassNameForScrollingAncestorOfScrollToAbleElement()
			)

			// layer.style.webkitOverflowScrolling = "touch"
			layer.style.padding = "0 0 40px 0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
			//
			layer.style.wordBreak = "break-all" // to get the text to wrap
		}
		{ // validation message
			const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "", false)
			layer.style.width = "calc(100% - 30px)"
			layer.style.marginLeft = "16px"
			layer.ClearAndHideMessage()
			self.validationMessageLayer = layer
			self.layer.appendChild(layer)				
		}
		{ // form
			const containerLayer = document.createElement("div")
			self.form_containerLayer = containerLayer
			{
				self._setup_form_walletNameField()
				self._setup_form_walletSwatchField()
				self._setup_deleteRecordButtonLayer()
			}
			self.layer.appendChild(containerLayer)
		}
	}
	_setup_form_walletNameField()
	{ // Wallet Name
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingBottom = "10px" // special case
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("WALLET NAME", self.context)
			div.appendChild(labelLayer)
			//
			const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
				placeholderText: "For your reference only"
			})
			valueLayer.value = self.wallet.walletLabel
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
				self.wallet.swatch // select the current swatch for the wallet
			)
			self.walletColorPickerInputView = view
			div.appendChild(view.layer)
		}
		self.form_containerLayer.appendChild(div)
	}
	_setup_deleteRecordButtonLayer()
	{
		const self = this
		const view = commonComponents_tables.New_deleteRecordNamedButtonView("wallet", self.context, "REMOVE")
		const layer = view.layer
		function __proceedTo_deleteRecord()
		{
			const record_id = self.wallet._id
			self.context.walletsListController.WhenBooted_DeleteRecordWithId(
				record_id,
				function(err)
				{
					if (err) {
						throw err
					}
					self._thisRecordWasDeleted()
				}
			)
		}
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (view.isEnabled === false) {
						console.warn("Delete btn not enabled")
						return false
					}
					self.context.windowDialogs.PresentQuestionAlertDialogWith(
						'Remove this wallet?', 
						'You are about to locally delete a wallet.\n\nMake sure you saved your mnemonic! It can be found by clicking the arrow next to Address on the Wallet screen. You will need it to recover access to this wallet.\n\nAre you sure you want to remove this wallet?',
						[ 'Remove', 'Cancel' ],
						function(err, selectedButtonIdx)
						{
							if (err) {
								throw err
							}
							const didChooseYes = selectedButtonIdx === 0
							if (didChooseYes) {
								setTimeout(function()
								{ // make sure we're on next tick from this dialog cb
									__proceedTo_deleteRecord()
								})
							}
						}
					)
				}
				return false
			}
		)
		self.form_containerLayer.appendChild(layer)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Edit Wallet"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{ // v--- self.navigationController because self is presented packaged in a StackNavigationView
						self.navigationController.modalParentView.DismissTopModalView(true)
					}
					return false
				}
			)
		}
		return view
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
		self.rightBarButtonView = view
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self._saveButtonView_pressed()
					}
					return false
				}
			)
		}
		self.set_submitButtonNeedsUpdate()
		return view
	}
	//
	//
	// Runtime - Accessors - Lookups
	//
	_canEnableSubmitButton()
	{
		const self = this
		if (self.walletNameInputLayer.value.length == 0) {
			return false
		}
		if (self.isSaving == true) {
			return false
		}
		return true
	}	
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
	set_submitButtonNeedsUpdate()
	{
		const self = this
		setTimeout(function()
		{ // to make sure consumers' prior updates have a chance to kick in
			// v- we use a local property instead of the one on the nav C cause we can't guarantee it is set yet
			self.rightBarButtonView.SetEnabled(self._canEnableSubmitButton())
		})
	}
	//
	//
	// Runtime - Delegation - Nav bar btn events - Overridable but call on super
	//
	_saveButtonView_pressed()
	{
		const self = this
		const walletColorHexString = self.walletColorPickerInputView.Component_Value()
		const walletName = self.walletNameInputLayer.value
		{
			self.isSaving = true
			self.set_submitButtonNeedsUpdate()
		}
		self.wallet.Set_valuesByKey(
			{
				walletLabel: walletName,
				swatch: walletColorHexString
			},
			function(err)
			{
				{
					self.isSaving = false
					self.set_submitButtonNeedsUpdate()
				}
				if (err) {
					console.error("Error while saving wallet", err)
					self.validationMessageLayer.SetValidationError(err.message)
					return
				}
				self.validationMessageLayer.ClearAndHideMessage()
				//
				self._didSaveWallet()
			}
		)		
	}
	//
	//
	// Runtime - Imperatives - UI
	//
	dismissView()
	{
		const self = this
		const modalParentView = self.navigationController.modalParentView
		setTimeout(function()
		{ // just to make sure the PushView is finished
			modalParentView.DismissTopModalView(true)
		})
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
			self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		}
	}
	//
	//
	// Runtime - Delegation - Deletion -> navigation handling
	//
	_thisRecordWasDeleted()
	{
		const self = this
		self.dismissView()
	}
	//
	//
	// Runtime - Delegation - Yield
	//
	_didSaveWallet()
	{
		const self = this
		self.dismissView()
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	AWalletFieldInput_did_keypress(event)
	{
		const self = this
		if (event.keyCode === 13) { // return key
			event.preventDefault() // do not let return/accept create a newline ; in case this is a textarea
			if (self.isSubmitButtonDisabled !== true) {
				self._saveButtonView_pressed() // patch to 
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
module.exports = EditWalletView