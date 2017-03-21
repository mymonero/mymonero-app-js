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
//
const BaseView_AWalletWizardScreen = require('./BaseView_AWalletWizardScreen.web')
//
class CreateWallet_Instructions_View extends BaseView_AWalletWizardScreen
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{
			const div = document.createElement("div")
			div.style.width = "236px"
			div.style.margin = "38px auto 24px auto"
			div.style.wordBreak = "break-word"
			{
				const titlesAndParagraphs = self._new_messages_titlesAndParagraphs()
				titlesAndParagraphs.forEach(function(titleAndParagraph, i)
				{
					div.appendChild(self._new_messages_subheaderLayer(titleAndParagraph[0]))
					div.appendChild(self._new_messages_paragraphLayer(titleAndParagraph[1]))
				})
			}
			self.layer.appendChild(div)
		}
		{
			const div = document.createElement("div")
			div.style.backgroundColor = "#302D2F"
			div.style.height = "1px"
			div.style.width = "236px"
			div.style.margin = "0 auto 22px auto"
			self.layer.appendChild(div)
		}
		{
			const centeringLayer = document.createElement("div")
			centeringLayer.style.margin = "0 auto 24px auto"
			centeringLayer.style.width = "236px"
			const view = self._new_acceptCheckboxButtonView()
			centeringLayer.appendChild(view.layer)
			self.acceptCheckboxButtonView = view
			self.layer.appendChild(centeringLayer)
		}
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
	// Runtime - Accessors - Factories
	//
	_new_messages_subheaderLayer(contentString)
	{
		const self = this
		const layer = document.createElement("h3")
		layer.innerHTML = contentString
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		layer.style.fontSize = "13px"
		layer.style.lineHeight = "20px"
		layer.style.fontWeight = "500"
		layer.style.color = "#F8F7F8"
		layer.style.marginTop = "24px"
		return layer
	}
	_new_messages_paragraphLayer(contentString)
	{
		const self = this
		const layer = document.createElement("p")
		layer.innerHTML = contentString
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		layer.style.fontWeight = "normal"
		layer.style.fontSize = "13px"
		layer.style.color = "#8D8B8D"
		layer.style.lineHeight = "20px"
		return layer
	}
	_new_messages_titlesAndParagraphs()
	{
		const list = []
		list.push([
			"Creating a wallet",
			"Each Monero wallet gets a secret word-sequence called a mnemonic."
		])
		list.push([
			"Write down your mnemonic", 
			"It's the only way to recover access to your wallet, and is never uploaded."
		])
		list.push([
			"Keep it secure &amp; private", 
			"Anyone with the mnemonic can view and spend the funds in your wallet."
		])
		list.push([
			"Use pen and paper or back it up", 
			"If you save it to an insecure location it may be viewable by other apps."
		])
		return list
	}
	_new_acceptCheckboxButtonView()
	{
		const self = this
		const view = new View({ tag: "a" }, self.context)
		{ // state
			view.isChecked = false
		}
		{ // style
			const layer = view.layer
			layer.innerHTML = "GOT IT!"
			layer.style.cursor = "default"
			layer.style.position = "relative"
			layer.style.textAlign = "left"
			layer.style.display = "block"
			layer.style.padding = "10px 12px"
			layer.style.textIndent = `${37 - 12}px`
			const isMacOS = process.platform === 'darwin' // TODO: check for iOS too I suppose
			if (isMacOS) {
				layer.style.width = "72px"
			} else {
				layer.style.width = "85px"
			}
			layer.style.height = `${32 - 10 * 2 }px`
			layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
			layer.style.fontSize = "11px"
			layer.style.color = "#f8f7f8"
			layer.style.background = "#383638"
			layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
			layer.style.borderRadius = "3px"
		}
		var checkboxIconLayer;
		{
			const layer = document.createElement("div")
			checkboxIconLayer = layer
			layer.style.cursor = "default"
			layer.style.position = "absolute"
			layer.style.left = "9px"
			layer.style.top = "9px"
			layer.style.background = "#1d1b1d"
			layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
			layer.style.borderRadius = "3px"
			layer.style.width = "16px"
			layer.style.height = "16px"
			view.layer.appendChild(layer)
		}
		{ // methods
			view.Component_ConfigureWithChecked = function()
			{
				if (view.isChecked) { // img path relative to window location
					checkboxIconLayer.style.background = "#1d1b1d url(../../WalletWizard/Resources/checkbox_check.png) 3px 4px no-repeat"
				} else {
					checkboxIconLayer.style.background = "#1d1b1d"
				}
			}
			view.Component_ToggleChecked = function()
			{
				view.isChecked = !view.isChecked
				view.Component_ConfigureWithChecked()
				//
				// this will need to be moved out to an event handler if this component is extracted
				self._configureInteractivityOfNextButton()
			}
		}
		{ // initial config via methods
			view.Component_ConfigureWithChecked()
		}
		{ // observation
			view.layer.addEventListener("click", function(e)
			{
				e.preventDefault()
				view.Component_ToggleChecked()
				return false
			})
		}
		//
		return view
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "New Wallet"
	}
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
		self._configureInteractivityOfNextButton() // will be disabled on first push - but not necessarily on hitting Back
		return view
	}
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
	_configureInteractivityOfNextButton()
	{
		const self = this
		if (self.acceptCheckboxButtonView.isChecked) {
			self.enable_submitButton()
		} else {
			self.disable_submitButton()
		}
	}
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
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this 
		self.context.walletsListController.CreateNewWallet_NoBootNoListAdd(
			function(err, walletInstance)
			{
				if (err) {
					throw err
				}
				self.wizardController.walletInstance = walletInstance
				self.wizardController.ProceedToNextStep()
			}
		)
	}
	//
	//
	// Runtime - Delegation - Navigation View special methods
	//
	navigationView_viewIsBeingPoppedFrom()
	{
		const self = this
		// I don't always get popped but when I do I maintain correct state
		self.wizardController.PatchToDifferentWizardTaskMode_withoutPushingScreen(
			self.options.wizardController_current_wizardTaskModeName, 
			self.options.wizardController_current_wizardTaskMode_stepIdx - 1
		)
	}
}
module.exports = CreateWallet_Instructions_View
