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
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_tooltips = require('../../MMAppUICommonComponents/tooltips.web')
//
const BaseView_Wallet_MetaInfo = require('./BaseView_Wallet_MetaInfo.web')
//
const Modes_LoginWith =
{
	MnemonicSeed: "MnemonicSeed",
	AddrAndPrivKeys: "AddrAndPrivKeys"
}
//
class UseExisting_MetaInfo_View extends BaseView_Wallet_MetaInfo
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{ // state
			self.mode_loginWith = Modes_LoginWith.MnemonicSeed
		}
		{
			self._setup_form_walletMnemonicField()
			self._setup_form_walletAddrAndKeysFields()
			self._setup_form_toggleLoginModeLayer()		
		}
		{
			self._setup_form_walletNameField()
			self._setup_form_walletSwatchField()
		}
		setTimeout(function()
		{ // after visible… (TODO: improve by doing on VDA or other trigger)
			self.mnemonicTextAreaView.layer.focus()
		}, 600)
	}
	_setup_form_walletMnemonicField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		div.style.paddingBottom = "0" // instead of 20, here, special case... we will move the 20 to the "Or, use…" layer
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SECRET MNEMONIC", self.context)
			div.appendChild(labelLayer)
			{
				const tooltipText = "This secret mnemonic is never<br/>sent to the MyMonero server."
				const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
				const layer = view.layer
				labelLayer.appendChild(layer)
			}
			//
			const view = commonComponents_forms.New_fieldValue_textAreaView({
				placeholderText: "From your existing wallet"
			}, self.context)
			view.layer.autocorrect = "off"
			view.layer.autocomplete = "off"
			view.layer.autocapitalize = "none"
			view.layer.spellcheck = "false"
			div.appendChild(view.layer)
			self.mnemonicTextAreaView = view
			view.layer.addEventListener(
				"keypress",
				function(event)
				{
					self.AWalletFieldInput_did_keypress(event) // defined on super
				}
			)
			view.layer.addEventListener(
				"keyup",
				function(event)
				{
					self.AWalletFieldInput_did_keyup(event) // defined on super
				}
			)
		}
		self.walletMnemonicField_layer = div
		self.form_containerLayer.appendChild(div)
	}
	_setup_form_walletAddrAndKeysFields()
	{
		const self = this
		self.addrAndKeysFieldsContainerLayer = document.createElement("div")
		self.addrAndKeysFieldsContainerLayer.style.display = "none" // for now
		{ // wallet address
			const div = commonComponents_forms.New_fieldContainerLayer(self.context)
			div.style.paddingBottom = "0" // instead of 20, here, special case... we will move the 20 to the "Or, use…" layer
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("ADDRESS", self.context)
				div.appendChild(labelLayer)
				{
					const tooltipText = "Your wallet's public address"
					const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
					const layer = view.layer
					labelLayer.appendChild(layer)
				}
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				view.layer.autocorrect = "off"
				view.layer.autocomplete = "off"
				view.layer.autocapitalize = "none"
				view.layer.spellcheck = "false"
				div.appendChild(view.layer)
				self.addrTextAreaView = view
				view.layer.addEventListener(
					"keypress",
					function(event)
					{
						self.AWalletFieldInput_did_keypress(event) // defined on super
					}
				)
				view.layer.addEventListener(
					"keyup",
					function(event)
					{
						self.AWalletFieldInput_did_keyup(event) // defined on super
					}
				)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		{ // wallet viewKey
			const div = commonComponents_forms.New_fieldContainerLayer(self.context)
			div.style.paddingBottom = "0" // instead of 20, here, special case... we will move the 20 to the "Or, use…" layer
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("VIEW KEY", self.context)
				div.appendChild(labelLayer)
				{
					const tooltipText = "This private view key and the wallet<br/>address are the only things sent<br/>to the MyMonero server."
					const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
					const layer = view.layer
					labelLayer.appendChild(layer)
				}
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				view.layer.autocorrect = "off"
				view.layer.autocomplete = "off"
				view.layer.autocapitalize = "none"
				view.layer.spellcheck = "false"
				div.appendChild(view.layer)
				self.viewKeyTextAreaView = view
				view.layer.addEventListener(
					"keypress",
					function(event)
					{
						self.AWalletFieldInput_did_keypress(event) // defined on super
					}
				)
				view.layer.addEventListener(
					"keyup",
					function(event)
					{
						self.AWalletFieldInput_did_keyup(event) // defined on super
					}
				)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		{ // wallet spendKey
			const div = commonComponents_forms.New_fieldContainerLayer(self.context)
			div.style.paddingBottom = "0" // instead of 20, here, special case... we will move the 20 to the "Or, use…" layer
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SPEND KEY", self.context)
				div.appendChild(labelLayer)
				{
					const tooltipText = "This private spend key is never<br/>sent to the MyMonero server."
					const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
					const layer = view.layer
					labelLayer.appendChild(layer)
				}
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				view.layer.autocorrect = "off"
				view.layer.autocomplete = "off"
				view.layer.autocapitalize = "none"
				view.layer.spellcheck = "false"
				div.appendChild(view.layer)
				self.spendKeyTextAreaView = view
				view.layer.addEventListener(
					"keypress",
					function(event)
					{
						self.AWalletFieldInput_did_keypress(event) // defined on super
					}
				)
				view.layer.addEventListener(
					"keyup",
					function(event)
					{
						self.AWalletFieldInput_did_keyup(event) // defined on super
					}
				)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		self.form_containerLayer.appendChild(self.addrAndKeysFieldsContainerLayer)
	}
	_setup_form_toggleLoginModeLayer()
	{
		const self = this
		const layer = document.createElement("div")
		self.context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
		layer.style.fontSize = "11px" // must set 11px so it matches visual weight of other labels
		layer.style.letterSpacing = "0"
		layer.style.color = "#8d8b8d"
		layer.style.letterSpacing = "0"
		layer.style.margin = "9px 0 17px 32px"
		layer.style.paddingBottom = "8px"
		{
			const span = document.createElement("span")
			span.innerHTML = "Or, use&nbsp;"
			layer.appendChild(span)
		}
		{
			function _new_titleFor_loginModeButton()
			{
				if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
					return "Address and Private Keys"
				} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
					return "Secret Mnemonic"
				} else {
					throw "unrecognized self.mode_loginWith"
					// return undefined
				}
			}
			const view = commonComponents_tables.New_clickableLinkButtonView(
				_new_titleFor_loginModeButton(),
				self.context, 
				function()
				{
					self.toggle_loginWithMode()
				}
			)
			self.toggleLoginModeButtonATagLayerView = view
			const a = view.layer
			a.style.margin = "0" // since this is not a standalone button
			a.style.fontSize = "11px" // chrome renders 11px too big compared to sketch
			a.style.letterSpacing = "0"
			a.style.fontWeight = "200"
			a.style.display = "inline" // special case, line text - else it's block
			a.style.float = "none"
			a.style.clear = "none"
			view.ConfigureWithLoginMode = function()
			{
				a.innerHTML = _new_titleFor_loginModeButton()
			}
			layer.appendChild(a)
		}
		self.form_containerLayer.appendChild(layer)
	}
	_setup_form_walletNameField()
	{
		const self = this
		super._setup_form_walletNameField()
		self.walletNameFieldContainerLayer.style.paddingBottom = "11px" // special case for this screen - packed more tightly
	}
	_setup_form_walletSwatchField()
	{
		const self = this
		super._setup_form_walletSwatchField()
		self.walletSwatchFieldContainerLayer.style.paddingTop = "0px" // special case for this screen - packed more tightly
	}
	_setup_startObserving()
	{
		const self = this
		super._setup_startObserving()
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
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Log Into Your Wallet"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		if (self.options.wizardController_current_wizardTaskModeName != self.wizardController.WizardTask_Mode_FirstTime_UseExisting()) {
			return null // cause we either want null or maybe a back button
		}
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (view.isEnabled !== false) {
					self.wizardController._fromScreen_userPickedCancel()
				}
				return false
			}
		)
		return view
	}
	// Navigation_New_RightBarButtonView()
	// {
	// 	const self = this
	// 	const view = super.Navigation_New_RightBarButtonView()
	// 	view.layer.innerHTML = "Add"
	// 	return view
	// }
	//
	//
	// Runtime - Accessors - Overridable
	//
	_overridable_canEnableSubmitButton()
	{
		const self = this
		const supers_value = super._overridable_canEnableSubmitButton()
		if (supers_value == false) { // i.e. no wallet name
			return supers_value
		}
		if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
			const mnemonicSeed = self.lookup__mnemonicSeed()
			if (!mnemonicSeed || typeof mnemonicSeed === 'undefined') {
				return false
			}
		} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
			const addr = self.lookup__addr()
			const viewKey = self.lookup__viewKey()
			const spendKey = self.lookup__spendKey()
			if (!addr || typeof addr === 'undefined') {
				return false
			}
			if (!viewKey || typeof viewKey === 'undefined') {
				return false
			}
			if (!spendKey || typeof spendKey === 'undefined') {
				return false
			}
		} else {
			throw "unrecognized self.mode_loginWith"
			// return false
		}
		
		return true
	}
	//
	//
	// Runtime - Accessors - Lookups - Field values
	//
	lookup__walletName()
	{
		const self = this
		return self.walletNameInputLayer.value
	}
	lookup__colorHexString()
	{
		const self = this
		return self.walletColorPickerInputView.Component_Value()
	}
	lookup__mnemonicSeed()
	{
		const self = this
		return (self.mnemonicTextAreaView.layer.value || "").trim()
	}
	lookup__addr()
	{
		const self = this
		return (self.addrTextAreaView.layer.value || "").trim()
	}
	lookup__viewKey()
	{
		const self = this
		return (self.viewKeyTextAreaView.layer.value || "").trim()
	}
	lookup__spendKey()
	{
		const self = this
		return (self.spendKeyTextAreaView.layer.value || "").trim()
	}
	//
	//
	// Runtime - Imperatives - Login mode 
	//
	toggle_loginWithMode()
	{
		const self = this
		var otherMode;
		if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
			otherMode = Modes_LoginWith.AddrAndPrivKeys
		} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
			otherMode = Modes_LoginWith.MnemonicSeed
		} else {
			throw "unrecognized self.mode_loginWith"
		}
		self.mode_loginWith = otherMode
		//
		self.toggleLoginModeButtonATagLayerView.ConfigureWithLoginMode()
		//
		if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
			self.mnemonicTextAreaView.layer.value = ""
			self.walletMnemonicField_layer.style.display = "block"
			//
			self.addrAndKeysFieldsContainerLayer.style.display = "none"
		} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
			self.walletMnemonicField_layer.style.display = "none"
			//
			self.addrTextAreaView.layer.value = ""
			self.viewKeyTextAreaView.layer.value = ""
			self.spendKeyTextAreaView.layer.value = ""			
			self.addrAndKeysFieldsContainerLayer.style.display = "block"
		}
		self.set_submitButtonNeedsUpdate()
	}
	//
	//
	// Runtime - Delegation - Navigation View special methods
	//
	navigationView_viewIsBeingPoppedFrom()
	{	// this will only get popped from when it's not the first in the nav stack, i.e. not adding first wallet,
		// so we'll need to get back into Mode_PickCreateOrUseExisting
		const self = this
		self.wizardController.PatchToDifferentWizardTaskMode_withoutPushingScreen( // to maintain the correct state
			self.wizardController.WizardTask_Mode_PickCreateOrUseExisting(), 
			0 // back to 0 from 1
		)
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this
		{
			self.isDisabledFromSubmission = true
			self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.keepAwake() // disable screen dim/off
			}
			//
			self.validationMessageLayer.ClearAndHideMessage()
			//
			self.rightBarButtonView.layer.innerHTML = "Loading…"
			self.disable_submitButton()
			self.navigationController.navigationBarView.leftBarButtonView.SetEnabled(false)
			//
			self.toggleLoginModeButtonATagLayerView.SetEnabled(false)
			self.walletColorPickerInputView.SetEnabled(false)
			self.walletNameInputLayer.disabled = true
			self.mnemonicTextAreaView.layer.disabled = true
			self.addrTextAreaView.layer.disabled = true
			self.viewKeyTextAreaView.layer.disabled = true
			self.spendKeyTextAreaView.layer.disabled = true
			self.addrAndKeysFieldsContainerLayer.disabled = true
		}
		function ____reEnable_userIdleAndScreenSleepFromSubmissionDisable()
		{ // factored because we would like to call this on successful submission too!
			self.context.userIdleInWindowController.ReEnable_userIdle()					
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.allowSleepAgain() // re-enable screen dim/off
			}
		}
		function ___reEnableFormFromSubmissionDisable()
		{
			self.isDisabledFromSubmission = false
			____reEnable_userIdleAndScreenSleepFromSubmissionDisable()
			//
			self.rightBarButtonView.layer.innerHTML = "Next"
			self.enable_submitButton()
			self.navigationController.navigationBarView.leftBarButtonView.SetEnabled(true)
			//
			self.toggleLoginModeButtonATagLayerView.SetEnabled(true)
			self.walletColorPickerInputView.SetEnabled(true)
			self.walletNameInputLayer.disabled = undefined
			self.mnemonicTextAreaView.layer.disabled = undefined
			self.addrTextAreaView.layer.disabled = undefined
			self.viewKeyTextAreaView.layer.disabled = undefined
			self.spendKeyTextAreaView.layer.disabled = undefined
			self.addrAndKeysFieldsContainerLayer.disabled = undefined
		}
		function __trampolineFor_failedWithErrStr(errStr)
		{
			self.layer.scrollTop = 0 // because we want to show the validation err msg
			self.validationMessageLayer.SetValidationError(errStr)
			___reEnableFormFromSubmissionDisable()
		}
		function __trampolineFor_didAddWallet()
		{
			____reEnable_userIdleAndScreenSleepFromSubmissionDisable() // we must call this manually as we are not re-enabling the form (or it will break user idle!!)
			self.wizardController.ProceedToNextStep() // will dismiss
		}
		//
		const walletsListController = self.context.walletsListController
		const walletName = self.lookup__walletName()
		const colorHexString = self.lookup__colorHexString()
		if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
			const mnemonicSeed = self.lookup__mnemonicSeed()
			walletsListController.WhenBooted_ObtainPW_AddExtantWalletWith_MnemonicString(
				walletName,
				colorHexString,
				mnemonicSeed,
				function(err, walletInstance, wasWalletAlreadyInserted)
				{
					if (err) {
						__trampolineFor_failedWithErrStr(err)
						return
					}
					if (wasWalletAlreadyInserted === true) {
						__trampolineFor_failedWithErrStr("That wallet has already been added.")
						return // consider a 'fail'
					}
					// success
					__trampolineFor_didAddWallet()
				},
				function()
				{ // user canceled password entry
					___reEnableFormFromSubmissionDisable()
				}
			)
			
		} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
			const addr = self.lookup__addr()
			const viewKey = self.lookup__viewKey()
			const spendKey = self.lookup__spendKey()
			walletsListController.WhenBooted_ObtainPW_AddExtantWalletWith_AddressAndKeys(
				walletName,
				colorHexString,
				addr,
				viewKey,
				spendKey,
				function(err, walletInstance, wasWalletAlreadyInserted)
				{
					if (err) {
						__trampolineFor_failedWithErrStr(err)
						return
					}
					if (wasWalletAlreadyInserted === true) {
						__trampolineFor_failedWithErrStr("That wallet has already been added.")
						return // consider a 'fail'
					}
					// success
					__trampolineFor_didAddWallet()
				},
				function()
				{ // user canceled password entry
					___reEnableFormFromSubmissionDisable()
				}
			)
		} else {
			throw "unrecognized self.mode_loginWith"
		}
	}
}
module.exports = UseExisting_MetaInfo_View