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
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
//
const Wallet_MetaInfo_BaseView = require('./Wallet_MetaInfo_BaseView.web')
//
const Modes_LoginWith =
{
	MnemonicSeed: "MnemonicSeed",
	AddrAndPrivKeys: "AddrAndPrivKeys"
}
//
class UseExisting_InformOfMnemonic_View extends Wallet_MetaInfo_BaseView
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
		{ // after visible…
			self.mnemonicTextAreaView.layer.focus()
		}, 400)
	}
	_setup_form_walletMnemonicField()
	{
		const self = this
		const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SECRET MNEMONIC", self.context)
			div.appendChild(labelLayer)
			//
			const view = commonComponents_forms.New_fieldValue_textAreaView({
				placeholderText: "From your existing wallet"
			}, self.context)
			self.mnemonicTextAreaView = view
			{
				view.layer.addEventListener(
					"keyup",
					function(event)
					{
						self.AWalletFieldInput_did_keyup(event) // defined on super
					}
				)
			}
			div.appendChild(view.layer)
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
			const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("ADDRESS", self.context)
				div.appendChild(labelLayer)
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				self.addrTextAreaView = view
				{
					view.layer.addEventListener(
						"keyup",
						function(event)
						{
							self.AWalletFieldInput_did_keyup(event) // defined on super
						}
					)
				}
				div.appendChild(view.layer)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		{ // wallet viewKey
			const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("VIEW KEY", self.context)
				div.appendChild(labelLayer)
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				self.viewKeyTextAreaView = view
				{
					view.layer.addEventListener(
						"keyup",
						function(event)
						{
							self.AWalletFieldInput_did_keyup(event) // defined on super
						}
					)
				}
				div.appendChild(view.layer)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		{ // wallet spendKey
			const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
			{
				const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("SPEND KEY", self.context)
				div.appendChild(labelLayer)
				//
				const view = commonComponents_forms.New_fieldValue_textAreaView({
				}, self.context)
				self.spendKeyTextAreaView = view
				{
					view.layer.addEventListener(
						"keyup",
						function(event)
						{
							self.AWalletFieldInput_did_keyup(event) // defined on super
						}
					)
				}
				div.appendChild(view.layer)
			}
			self.addrAndKeysFieldsContainerLayer.appendChild(div)
		}
		self.form_containerLayer.appendChild(self.addrAndKeysFieldsContainerLayer)
	}
	_setup_form_toggleLoginModeLayer()
	{
		const self = this
		const layer = document.createElement("div")
		layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
		layer.style.fontSize = "11px"
		layer.style.color = "#8d8b8d"
		layer.style.letterSpacing = "0"
		layer.style.margin = "10px 0 0 21px"
		layer.style.paddingBottom = "8px"
		{
			const span = document.createElement("span")
			span.innerHTML = "Or, use&nbsp;"
			layer.appendChild(span)
		}
		{
			const view = new View({ tag: "a" }, self.context)
			self.toggleLoginModeButtonATagLayerView = view
			const a = view.layer
			a.addEventListener("mouseenter", function()
			{
				if (view.isEnabled !== false) {
					a.style.textDecoration = "underline"
				} else {
					a.style.textDecoration = "none"
				}
			})
			a.addEventListener("mouseleave", function()
			{
				a.style.textDecoration = "none"
			})
			a.addEventListener("click", function(e)
			{
				e.preventDefault()
				if (view.isEnabled !== false) {
					self.toggle_loginWithMode()
				}
				return false
			})
			view.SetEnabled = function(isEnabled)
			{
				view.isEnabled = isEnabled
				if (isEnabled) {
					a.style.color = "#11bbec"
					a.style.cursor = "pointer"
				} else {
					a.style.color = "#bbbbbb"
					a.style.cursor = "default"
				}
			}
			view.ConfigureWithLoginMode = function()
			{
				if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
					a.innerHTML = "Address and Private Keys"
				} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
					a.innerHTML = "Secret Mnemonic"
				} else {
					throw "unrecognized self.mode_loginWith"
					return false
				}
			}
			view.ConfigureWithLoginMode() // execute to do init config
			view.SetEnabled(true) // to begin with
			layer.appendChild(a)
		}
		self.form_containerLayer.appendChild(layer)
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
			return false
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
		return self.mnemonicTextAreaView.layer.value
	}
	lookup__addr()
	{
		const self = this
		return self.addrTextAreaView.layer.value
	}
	lookup__viewKey()
	{
		const self = this
		return self.viewKeyTextAreaView.layer.value
	}
	lookup__spendKey()
	{
		const self = this
		return self.spendKeyTextAreaView.layer.value
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
	}
	
	//
	//
	// Runtime - Delegation - Navigation View special methods
	//
	navigationView_viewIsBeingPoppedFrom()
	{ // this will only get popped from when it's not the first in the nav stack, i.e. not adding first wallet,
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
			self.validationMessageLayer.ClearAndHideMessage()
			//
			self.disable_submitButton()
			self.toggleLoginModeButtonATagLayerView.SetEnabled(false)
			self.walletNameInputLayer.disabled = true
			self.addrTextAreaView.layer.disabled = true
			self.viewKeyTextAreaView.layer.disabled = true
			self.spendKeyTextAreaView.layer.disabled = true
			self.addrAndKeysFieldsContainerLayer.disabled = true
		}
		function ___reEnableForm()
		{
			self.enable_submitButton()
			self.toggleLoginModeButtonATagLayerView.SetEnabled(true)
			self.walletNameInputLayer.disabled = undefined
			self.addrTextAreaView.layer.disabled = undefined
			self.viewKeyTextAreaView.layer.disabled = undefined
			self.spendKeyTextAreaView.layer.disabled = undefined
			self.addrAndKeysFieldsContainerLayer.disabled = undefined
		}
		function __trampolineFor_failedWithErrStr(errStr)
		{
			self.layer.scrollTop = 0 // because we want to show the validation err msg
			self.validationMessageLayer.SetValidationError(errStr)
			___reEnableForm()
		}
		function __trampolineFor_didAddWallet()
		{
			self.wizardController.ProceedToNextStep() // will dismiss
		}
		const walletsListController = self.context.walletsListController
		const walletName = self.lookup__walletName()
		const colorHexString = self.lookup__colorHexString()
		if (self.mode_loginWith == Modes_LoginWith.MnemonicSeed) {
			const mnemonicSeed = self.lookup__mnemonicSeed()
			walletsListController.WhenBooted_AddExtantWalletWith_mnemonicString(
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
				}
			)
			
		} else if (self.mode_loginWith == Modes_LoginWith.AddrAndPrivKeys) {
			const addr = self.lookup__addr()
			const viewKey = self.lookup__viewKey()
			const spendKey = self.lookup__spendKey()
			walletsListController.WhenBooted_AddExtantWalletWith_addressAndKeys(
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
				}
			)
		} else {
			throw "unrecognized self.mode_loginWith"
		}
	}
}
module.exports = UseExisting_InformOfMnemonic_View