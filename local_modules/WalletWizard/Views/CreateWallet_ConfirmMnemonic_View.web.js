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
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
//
const BaseView_AWalletWizardScreen = require('./BaseView_AWalletWizardScreen.web')
//
class CreateWallet_ConfirmMnemonic_View extends BaseView_AWalletWizardScreen
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		{ // validation message
			const layer = commonComponents_tables.New_inlineMessageDialogLayer(self.context, "")
			layer.style.width = "calc(100% - 48px)"
			layer.style.marginLeft = "24px"
			layer.ClearAndHideMessage()
			self.validationMessageLayer = layer
			self.layer.appendChild(layer)				
		}
		const walletInstance = self.wizardController.walletInstance
		const generatedOnInit_walletDescription = walletInstance.generatedOnInit_walletDescription
		const mnemonicString = generatedOnInit_walletDescription.mnemonicString
		self.mnemonicString = mnemonicString
		const correctlyOrdered_mnemonicString_words = self.mnemonicString.split(" ").slice(
			0, 
			commonComponents_walletMnemonicBox.numberOfMnemonicWordsRequiredForVerification
		) // NOTE: we are limiting the required-entered words to 7
		self.numberOf_mnemonicString_words = correctlyOrdered_mnemonicString_words.length // cached
		{
			const text = "Verify your mnemonic"
			const layer = self._new_messages_subheaderLayer(text)
			layer.style.marginTop = "39px"
			layer.style.textAlign = "center"
			layer.style.wordBreak = "break-word"
			self.layer.appendChild(layer)
		}
		{
			const text = "Choose the first 7 words in the correct&nbsp;order."
			const layer = self._new_messages_paragraphLayer(text)
			layer.style.marginBottom = "39px" // not 40 to leave 1px for clear border
			layer.style.textAlign = "center"
			layer.style.wordBreak = "break-word"
			self.layer.appendChild(layer)
		}
		{
			const view = commonComponents_walletMnemonicBox.New_MnemonicConfirmation_SelectedWordsView(
				self.mnemonicString, 
				self.context,
				function(word)
				{ // did select word
					self._configureInteractivityOfNextButton()
				},
				function(word)
				{ // did deselect word
					self._configureInteractivityOfNextButton()
				}
			)
			self.mnemonicConfirmation_selectedWordsView = view
			self.layer.appendChild(view.layer)
		}
		{
			const view = commonComponents_walletMnemonicBox.New_MnemonicConfirmation_SelectableWordsView(
				self.mnemonicString, 
				self.mnemonicConfirmation_selectedWordsView, 
				self.context
			)
			self.mnemonicConfirmation_selectableWordsView = view
			self.addSubview(view)
		}
		self.mnemonicConfirmation_selectedWordsView.Component_ConfigureWith_selectableWordsView(
			self.mnemonicConfirmation_selectableWordsView
		)
		{
			const layer = document.createElement("div")
			layer.style.fontSize = "11px"
			layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
			layer.style.fontSize = "11px"
			layer.style.lineHeight = "14px"
			layer.style.color = "#f97777"
			layer.style.width = "267px"
			layer.style.boxSizing = "border-box"
			layer.style.paddingLeft = "16px"
			layer.style.margin = `4px 16px 0 calc(50% - 16px - ${268/2}px)`
			layer.style.display = "none"
			layer.style.wordBreak = "break-word"
			layer.innerHTML = "That’s not right. You can try again or start over with a new mnemonic."
			{ // v-- this padding is added to accommodate the action bar in case the screen is too short and scrolling happens
				const paddingBottom = commonComponents_actionButtons.ActionButtonsContainerView_h + commonComponents_actionButtons.ActionButtonsContainerView_bottomMargin + 10
				layer.style.paddingBottom = `${paddingBottom}px`
			}
			self.mnemonicConfirmation_validationErrorLabelLayer = layer
			self.layer.appendChild(layer)
		}
		{ // action buttons toolbar
			const margin_h = 16
			var actionButtonsContainerView;
			if (self.context.themeController.TabBarView_isHorizontalBar() === false) {
				const margin_fromWindowLeft = self.context.themeController.TabBarView_thickness() + margin_h // we need this for a position:fixed, width:100% container
				const margin_fromWindowRight = margin_h
				actionButtonsContainerView = commonComponents_actionButtons.New_ActionButtonsContainerView(
					margin_fromWindowLeft, 
					margin_fromWindowRight, 
					self.context
				)
				actionButtonsContainerView.layer.style.paddingLeft = margin_h+"px"
			} else {
				actionButtonsContainerView = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
					margin_h, 
					margin_h, 
					15,
					self.context
				)
			}
			actionButtonsContainerView.layer.style.display = "none" // for now
			self.actionButtonsContainerView = actionButtonsContainerView
			{
				self._setup_actionButton_tryAgain()
				self._setup_actionButton_startOver()
			}
			self.addSubview(actionButtonsContainerView)
		}
	}
	_setup_actionButton_tryAgain()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Try again", 
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"WalletWizard/Resources/actionButton_iconImage__tryAgain@3x.png", // relative to index.html
			false,
			function(layer, e)
			{
				self.__didSelect_actionButton__tryAgain()
			},
			self.context,
			8,
			undefined,
			"14px 16px"
		)
		self.buttonView__tryAgain = buttonView
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_startOver()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Start Over", 
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"WalletWizard/Resources/actionButton_iconImage__startOver@3x.png", // relative to index.html
			true,
			function(layer, e)
			{
				self.__didSelect_actionButton__startOver()
			},
			self.context,
			9,
			undefined,
			"16px 14px"
		)
		self.buttonView__startOver = buttonView
		self.actionButtonsContainerView.addSubview(buttonView)
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
		//
		self.mnemonicConfirmation_selectableWordsView.TearDown()
		self.mnemonicConfirmation_selectedWordsView.TearDown()
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
		layer.innerHTML = "Confirm"
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
	// Runtime - Accessors - Mnemonic validation
	//
	_hasUserEnteredCorrectlyOrderedMnemonic()
	{
		const self = this
		const correctSufficient_mnemonicWords = self.mnemonicString.split(" ").slice(
			0, 
			commonComponents_walletMnemonicBox.numberOfMnemonicWordsRequiredForVerification
		)
		const correctSufficient_mnemonicString = correctSufficient_mnemonicWords.join(" ").toLowerCase()
		//
		const selected_mnemonicWords = self.mnemonicConfirmation_selectedWordsView.Component_SelectedWords()
		const selected_mnemonicString = selected_mnemonicWords.join(" ").toLowerCase()
		if (selected_mnemonicString === correctSufficient_mnemonicString) { // here, a direct string comparison is ok because we don't need to support partial (prefix len) words
			return true
		}
		return false
	}	
	//
	//
	// Runtime - Imperatives - Submit button enabled state
	//
	_configureInteractivityOfNextButton()
	{
		const self = this
		const view = self.mnemonicConfirmation_selectedWordsView
		if (typeof view === 'undefined' || !view) {
			console.warn("_configureInteractivityOfNextButton called while self.mnemonicConfirmation_selectedWordsView nil")
			self.disable_submitButton()
			return
		}
		const selectedWords = view.Component_SelectedWords()
		if (selectedWords.length === self.numberOf_mnemonicString_words) {
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
		if (self._hasUserEnteredCorrectlyOrderedMnemonic() == false) {
			self.validationMessageLayer.ClearAndHideMessage()
			self.mnemonicConfirmation_selectedWordsView.layer.classList.add("errored")
			self.mnemonicConfirmation_validationErrorLabelLayer.style.display = "block"
			self.disable_submitButton()
			self.mnemonicConfirmation_selectedWordsView.Component_SetEnabled(false)
			self.mnemonicConfirmation_selectableWordsView.layer.style.display = "none"
			self.actionButtonsContainerView.layer.style.display = "block"
			//
			return
		}
		const walletInstance = self.wizardController.walletInstance
		if (!walletInstance) {
			throw "Missing expected walletInstance"
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
			self.navigationController.navigationBarView.leftBarButtonView.SetEnabled(true)
			self.mnemonicConfirmation_selectedWordsView.Component_SetEnabled(true) // re-enable
			//
			self.rightBarButtonView.layer.innerHTML = "Confirm"
			self.enable_submitButton()
		}
		const walletLabel = self.wizardController.walletMeta_name
		const swatch = self.wizardController.walletMeta_colorHexString
		{ // disable form
			self.isDisabledFromSubmission = true
			self.context.userIdleInWindowController.TemporarilyDisable_userIdle()
			if (self.context.Cordova_isMobile === true) {
				window.plugins.insomnia.keepAwake() // disable screen dim/off
			}
			//
			self.validationMessageLayer.ClearAndHideMessage()
			//
			self.navigationController.navigationBarView.leftBarButtonView.SetEnabled(false)
			self.mnemonicConfirmation_selectedWordsView.Component_SetEnabled(false) // so they can't deselect while adding
			//
			self.rightBarButtonView.layer.innerHTML = commonComponents_activityIndicators.New_Graphic_ActivityIndicatorLayer_htmlString({"margin-top": "3px"})
			self.disable_submitButton()
			self.rightBarButtonView.layer.style.backgroundColor = "rgba(0,0,0,0)" // special case / slightly fragile
		}
		self.context.walletsListController.WhenBooted_ObtainPW_AddNewlyGeneratedWallet(
			walletInstance,
			walletLabel,
			swatch,
			function(err, walletInstance)
			{
				if (err) {
					self.validationMessageLayer.SetValidationError(err)
					___reEnableFormFromSubmissionDisable()
					return
				}
				____reEnable_userIdleAndScreenSleepFromSubmissionDisable() // must call this manually, since we're not re-enabling the form
				self.wizardController.ProceedToNextStep() // this should lead to a dismiss of the wizard
			},
			function()
			{ // user canceled password entry
				___reEnableFormFromSubmissionDisable()
			}
		)
	}
	__didSelect_actionButton__tryAgain()
	{
		const self = this
		self.validationMessageLayer.ClearAndHideMessage()
		self.mnemonicConfirmation_selectedWordsView.layer.classList.remove("errored")
		self.mnemonicConfirmation_validationErrorLabelLayer.style.display = "none"
		self.enable_submitButton()
		self.mnemonicConfirmation_selectedWordsView.Component_SetEnabled(true)
		self.mnemonicConfirmation_selectedWordsView.Component_DeselectAllWords()
		self.mnemonicConfirmation_selectableWordsView.layer.style.display = "block"
		self.actionButtonsContainerView.layer.style.display = "none"
	}
	__didSelect_actionButton__startOver()
	{
		const self = this
		self.wizardController.GenerateAndUseNewWallet(
			function(err, walletInstance)
			{
				if (err) {
					throw err
				}
				// then go back
				self.navigationController.PopView(true) // state will be managed for us by navigationView_viewIsBeingPoppedFrom
			},
			self.wizardController.currentWalletUsedLocaleCode // so they end up with the same language
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
module.exports = CreateWallet_ConfirmMnemonic_View
