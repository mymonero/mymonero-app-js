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
const commonComponents_walletMnemonicBox = require('../../MMAppUICommonComponents/walletMnemonicBox.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
//
const mnemonic_languages = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/mnemonic_languages')
//
const BaseView_AWalletWizardScreen = require('./BaseView_AWalletWizardScreen.web')
//
class CreateWallet_InformOfMnemonic_View extends BaseView_AWalletWizardScreen
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{
			const text = "Write down your mnemonic"
			const layer = self._new_messages_subheaderLayer(text)
			layer.style.marginTop = "39px"
			layer.style.textAlign = "center"
			layer.style.wordBreak = "break-word"
			self.layer.appendChild(layer)
		}
		{
			const text = "You'll confirm this sequence on the next&nbsp;screen."
			const layer = self._new_messages_paragraphLayer(text)
			layer.style.marginBottom = "39px" // not 40 to leave 1px for clear border
			layer.style.textAlign = "center"
			layer.style.wordBreak = "break-word"
			self.layer.appendChild(layer)
		}
		{
			const mnemonicString = self._lookup_wizardWalletMnemonicString()
			const view = commonComponents_walletMnemonicBox.New_MnemonicTextDisplayView(mnemonicString, self.context)
			self.mnemonicTextDisplayView = view
			self.layer.appendChild(view.layer)
		}
		{
			const layer = document.createElement("div")
			layer.style.background = "rgba(245,230,125,0.05)"
			const padding_h = 8
			layer.style.width = `calc(100% - ${2*16}px - ${2*1}px - ${2*padding_h}px)`
			layer.style.borderRadius = "5px"
			layer.style.border = "1px solid rgba(245,230,125,0.30)"
			layer.style.padding = `6px ${padding_h}px 7px ${padding_h}px`
			layer.style.margin = "0 16px 40px 16px" // footer padding
			layer.style.fontWeight = "300"
			layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "400"
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.style.wordBreak = "break-word"
			layer.style.color = "#F5E67E"
			const text = "NOTE: This is the only way to access your wallet if you switch devices, use another Monero wallet app, or lose your&nbsp;data."
			layer.innerHTML = text
			self.layer.appendChild(layer)
		}
		self._setup_form_field_language()
	}
	_setup_form_field_language()
	{
		const self = this
		let selectLayer_w = 142
		let selectLayer_h = 32
		//
		const div = commonComponents_forms.New_fieldContainerLayer(self.context)
		{
			const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("LANGUAGE", self.context)
			div.appendChild(labelLayer)
			//
			let selectContainerLayer = document.createElement("div")
			selectContainerLayer.style.position = "relative" // to container pos absolute
			selectContainerLayer.style.left = "0"
			selectContainerLayer.style.top = "0"
			selectContainerLayer.style.width = selectLayer_w+"px"
			selectContainerLayer.style.height =selectLayer_h+"px"
			//
			let selectLayer = document.createElement("select")
			{
				const currentValue = mnemonic_languages.compatible_code_from_locale(self.wizardController.currentWalletUsedLocaleCode)
				if (currentValue == null) {
					throw "Expected to find compatible locale code"
				}
				let values = mnemonic_languages.supported_short_codes
				let descriptions = mnemonic_languages.mnemonic_languages
				let numberOf_values = values.length
				for (var i = 0 ; i < numberOf_values ; i++) {
					let value = values[i]
					const optionLayer = document.createElement("option")
					if (currentValue === value) {
						optionLayer.selected = "selected"
					}
					optionLayer.style.textAlign = "center"
					optionLayer.value = value
					optionLayer.innerText = `${descriptions[i]}`// (${value})`
					selectLayer.appendChild(optionLayer)
				}
			}
			self.languageSelectLayer = selectLayer
			{
				// selectLayer.style.textAlign = "center"
				// selectLayer.style.textAlignLast = "center"
				selectLayer.style.outline = "none"
				selectLayer.style.color = "#FCFBFC"
				selectLayer.style.backgroundColor = "#383638"
				selectLayer.style.width = selectLayer_w+"px"
				selectLayer.style.height =selectLayer_h+"px"
				selectLayer.style.border = "0"
				selectLayer.style.padding = "0"
				selectLayer.style.borderRadius = "3px"
				selectLayer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
				selectLayer.style.webkitAppearance = "none" // apparently necessary in order to activate the following style.border…Radius
				selectLayer.style.MozAppearance = "none"
				selectLayer.style.msAppearance = "none"
				selectLayer.style.appearance = "none"
				self.context.themeController.StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
					selectLayer,
					true // bright content, dark bg
				)
				selectLayer.style.textIndent = "11px"
				{ // hover effects/classes
					selectLayer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
					selectLayer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
				}
				//
				// observation
				selectLayer.addEventListener(
					"change", 
					function()
					{
						self.wizardController.GenerateAndUseNewWallet(
							function(err, walletInstance)
							{
								if (err) {
									throw err
								}
								self._reconfigureMnemonicDisplay()
							},
							self.languageSelectLayer.value // specifying the code they've selected
						)
					}
				)
			}
			selectContainerLayer.appendChild(selectLayer)
			{
				const layer = document.createElement("div")
				self.disclosureArrowLayer = layer
				layer.style.pointerEvents = "none" // mustn't intercept pointer events
				layer.style.border = "none"
				layer.style.position = "absolute"
				const w = 10
				const h = 8
				let top = Math.ceil((selectLayer_h - h)/2)
				layer.style.width = w+"px"
				layer.style.height = h+"px"
				layer.style.right = "13px"
				layer.style.top = top+"px"
				layer.style.zIndex = "100" // above options_containerView 
				layer.style.backgroundImage = "url("+self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"SelectView/Resources/dropdown-arrow-down@3x.png)" // borrowing this
				layer.style.backgroundRepeat = "no-repeat"
				layer.style.backgroundPosition = "center"
				layer.style.backgroundSize = w+"px "+ h+"px"
				selectContainerLayer.appendChild(layer)			
			}
			div.appendChild(selectContainerLayer)
		}
		self.layer.appendChild(div)
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
		layer.style.textAlign = "center"
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
	//
	//
	// Runtime - Accessors - 
	//
	_lookup_wizardWalletMnemonicString()
	{
		const self = this
		const walletInstance = self.wizardController.walletInstance
		const generatedOnInit_walletDescription = walletInstance.generatedOnInit_walletDescription
		const mnemonicString = generatedOnInit_walletDescription.mnemonicString
		return mnemonicString
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
				if (self.isSubmitButtonDisabled !== true) { // button is enabled
					self._userSelectedNextButton()
				}
				return false
			}
		)
		return view
	}
	//
	// Imperative
	_reconfigureMnemonicDisplay()
	{
		const self = this
		const mnemonicString = self._lookup_wizardWalletMnemonicString()
		self.mnemonicTextDisplayView.layer.innerHTML = mnemonicString
	}
	_reconfigureLanguageSelect()
	{
		const self = this
		const currentValue = mnemonic_languages.compatible_code_from_locale(self.wizardController.currentWalletUsedLocaleCode)
		if (currentValue == null) {
			throw "Expected to find compatible locale code"
		}
		self.languageSelectLayer.value = currentValue
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this 
		self.wizardController.ProceedToNextStep()
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
	//
	//
	// Runtime - Delegation - View visibility
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		if (typeof self.hasAppearedOnce === 'undefined' || self.hasAppearedOnce !== true) {
			self.hasAppearedOnce = true
		} else { // reconfig, i.e. on a 'back' cause we may have a new wallet instance generated by successors' "Start over"
			self._reconfigureMnemonicDisplay()
			self._reconfigureLanguageSelect() // since the wallet was regenerated, the wizard may actually have changed its language, though we don't expect it
		}
	}
}
module.exports = CreateWallet_InformOfMnemonic_View
