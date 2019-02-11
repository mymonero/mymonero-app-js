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
const monero_config = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_config')
const JSBigInt = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/biginteger').BigInteger
//
const View = require('../../Views/View.web')
//
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const InfoDisclosingView = require('../../InfoDisclosingView/Views/InfoDisclosingView.web')
//
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const TransactionDetailsView = require("./TransactionDetailsView.web")
const ImportTransactionsModalView = require('./ImportTransactionsModalView.web')
const FundsRequestQRDisplayView = require('../../RequestFunds/Views/FundsRequestQRDisplayView.web')
//
let Currencies = require('../../CcyConversionRates/Currencies')
const monero_amount_format_utils = require("../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_amount_format_utils");
//
class WalletDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.wallet = options.record // will keep it `record` in the interface
			if (self.wallet === null || typeof self.wallet === 'undefined') {
				throw "options.wallet nil but required for " + self.constructor.name
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // zeroing / initialization
			self.current_transactionDetailsView = null
			self.currentlyPresented_AddContactView = null // zeroing
			self.currentlyPresented_qrDisplayView = null
		}
		self._setup_views()
		self._setup_startObserving()
		//
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__balance()
		self._configureUIWithWallet__transactions()
		self._configureUIWithWallet__heightsAndImportAndFetchingState()
	}
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_balanceLabelView()
		self._setup_secondaryBalancesLabelLayer()
		self._setup_account_InfoDisclosingView()
		if (self.context.isLiteApp !== true) {
			self._setup_sendReceive_actionButtons()
		}
		self._setup_layers_transactionsListLayerContainerLayer()
	}
	_setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		layer.style.boxSizing = "border-box" // so we don't need to account for padding in w/h
		layer.style.width = `100%`
		layer.style.height = "100%"
		layer.style.overflowY = "auto"
		// layer.style.webkitOverflowScrolling = "touch"
		const margin_h = 16
		layer.style.padding = `0 ${margin_h}px 0px ${margin_h}px` // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		layer.style.color = "#c0c0c0" // temporary
		layer.style.wordBreak = "break-all" // to get the text to wrap	
	}
	_setup_balanceLabelView()
	{
		const self = this
		const view = new View({ tag: "div" }, self.context)
		self.balanceLabelView = view
		self.addSubview(view)
		{
			const layer = view.layer
			layer.style.boxSizing = "border-box"
			layer.style.width = "100%"
			layer.style.height = "71px"
			layer.style.marginTop = "16px"
			layer.style.padding = "17px 17px"
			if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "0 0.5px 1px 0 rgba(0,0,0,0.20), inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
			} else { // avoiding shadow
				layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
			}
			layer.style.borderRadius = "5px"
			//
			layer.style.whiteSpace = "nowrap"
			layer.style.overflow = "hidden"
			layer.style.textOverflow = "ellipsis"
			layer.style.wordBreak = "break-all"
		}
		const mainLabelSpan = document.createElement("span")
		{
			const layer = mainLabelSpan
			layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
			layer.style.fontWeight = "100"
			layer.style.fontSize = "32px"
			view.layer.appendChild(layer)
		}
		const secondarySectionLabelSpan = document.createElement("span")
		{
			const layer = secondarySectionLabelSpan
			layer.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
			layer.style.fontWeight = "100"
			layer.style.fontSize = "32px"
			view.layer.appendChild(layer)
		}
		view.SetWalletThemeColor = function(swatch_hexColorString)
		{
			var isDark = self.context.walletsListController.IsSwatchHexColorStringADarkColor(swatch_hexColorString)
			if (isDark) {
				mainLabelSpan.style.color = "#F8F7F8" // so use light text
				// ^-- TODO: for some reason, this has a much heavier visual/apparent font weight despite it being 100 :\
				secondarySectionLabelSpan.style.color = "rgba(248, 247, 248, 0.2)"
			} else {
				mainLabelSpan.style.color = "#161416" // so use dark text
				secondarySectionLabelSpan.style.color = "rgba(29, 26, 29, 0.2)"
			}
			view.layer.style.color = secondarySectionLabelSpan.style.color // for the '…' during truncation
			//
			view._swatch_hexColorString = swatch_hexColorString
			view.layer.style.backgroundColor = swatch_hexColorString
		}
		view.SetPlainString = function(plainString)
		{
			mainLabelSpan.innerHTML = plainString
			secondarySectionLabelSpan.innerHTML = ""
		}
		view.SetBalanceWithWallet = function(wallet)
		{ 
			var finalized_main_string = ""
			var finalized_secondarySection_string = ""
			const amount_displayStringComponents = Currencies.displayStringComponentsFrom( // this converts to whatever ccy they have selected
				self.context.CcyConversionRates_Controller_shared,
				wallet.Balance_JSBigInt(),
				self.context.settingsController.displayCcySymbol
			)
			const displayCcySymbol = amount_displayStringComponents.ccy_str
			const amt_str = amount_displayStringComponents.amt_str
			// now check if the ccy is /still/ XMR…
			if (displayCcySymbol == Currencies.ccySymbolsByCcy.XMR) { 
				// NOTE: checking if ccy is XMR again to catch displayCurrencyAmountDouble_orNull=null fallthrough case from alt display ccy 
				const raw_balanceString = wallet.Balance_FormattedString()
				const coinUnitPlaces = monero_config.coinUnitPlaces
				const raw_balanceString__components = raw_balanceString.split(".")
				if (raw_balanceString__components.length == 1) {
					const balance_aspect_integer = raw_balanceString__components[0]
					if (balance_aspect_integer === "0") {
						finalized_main_string = ""
						finalized_secondarySection_string = "00." + Array(coinUnitPlaces).join("0")
					} else {
						finalized_main_string = balance_aspect_integer + ".0"
						finalized_secondarySection_string = Array(coinUnitPlaces - 1/*for ".0"*/).join("0")
					}
				} else if (raw_balanceString__components.length == 2) {
					finalized_main_string = raw_balanceString
					const decimalComponent = raw_balanceString__components[1]
					const decimalComponent_length = decimalComponent.length
					if (decimalComponent_length < coinUnitPlaces + 2) {
						finalized_secondarySection_string = Array(coinUnitPlaces - decimalComponent_length + 2).join("0")
					}
				} else {
					throw "Couldn't parse formatted balance string."
				}
			} else {
				finalized_main_string = amt_str
				finalized_secondarySection_string = "&nbsp;" + displayCcySymbol // special case
			}
			mainLabelSpan.innerHTML = finalized_main_string
			secondarySectionLabelSpan.innerHTML = finalized_secondarySection_string
		}
	}
	_setup_secondaryBalancesLabelLayer()
	{
		const self = this
		const layer = document.createElement("span")
		self.secondaryBalancesLabelLayer = layer
		layer.style.position = "relative"
		layer.style.display = "none"
		layer.style.width = "auto"
		layer.style.padding = "12px 6px 0 6px" // 0 btm b/c it already exists
		layer.style.textAlign = "left"
		layer.style.color = "#9E9C9E"
		self.context.themeController.StyleLayer_FontAsMiddlingRegularMonospace(layer)
		//
		self.layer.appendChild(layer)
	}
	_new_fieldBaseView(entitled, isTruncatedPreviewForm, isSecretData)
	{
		const self = this
		const fieldView = new View({}, self.context)
		const layer = fieldView.layer
		layer.style.marginLeft = "25px"
		//
		const fieldContainerLayer = commonComponents_tables.New_copyable_longStringValueField_component_fieldContainerLayer(
			self.context,
			entitled, 
			"",
			self.context.pasteboard,
			"N/A",
			isTruncatedPreviewForm == true ? true : false,
			false // isSecretData - NOTE: I have re-enabled copy on secret data for usability purposes
		)
		layer.appendChild(fieldContainerLayer)
		//
		fieldView.SetValue = function(value)
		{
			fieldContainerLayer.Component_SetValue(value)
		}
		fieldView.SetWordBreakMode = function(wordBreakMode)
		{
			fieldContainerLayer.Component_SetWordBreakMode(wordBreakMode)
		}
		return fieldView
	}	
	_setup_account_InfoDisclosingView()
	{
		const self = this
		const previewView = new View({}, self.context)
		{
			const preview__address_fieldView = self._new_fieldBaseView("Address", true, false)
			self.preview__address_fieldView = preview__address_fieldView
			previewView.addSubview(preview__address_fieldView)
		}
		const disclosedView = new View({}, self.context)
		{
			const disclosed__address_fieldView = self._new_fieldBaseView("Address", false, false)
			self.disclosed__address_fieldView = disclosed__address_fieldView
			disclosedView.addSubview(disclosed__address_fieldView)
			//
			const viewKey_fieldView = self._new_fieldBaseView("Secret View Key", false, true)
			self.viewKey_fieldView = viewKey_fieldView
			disclosedView.addSubview(viewKey_fieldView)
			//
			const spendKey_fieldView = self._new_fieldBaseView("Secret Spend Key", false, true)
			self.spendKey_fieldView = spendKey_fieldView
			disclosedView.addSubview(spendKey_fieldView)
			//
			const mnemonicSeed_fieldView = self._new_fieldBaseView("Secret Mnemonic", false, true)
			self.mnemonicSeed_fieldView = mnemonicSeed_fieldView
			mnemonicSeed_fieldView.SetWordBreakMode("normal")
			disclosedView.addSubview(mnemonicSeed_fieldView)
		}
		const infoDisclosingView = new InfoDisclosingView({
			previewView: previewView,
			disclosedView: disclosedView,
			padding_left: 18,
			padding_right: 18,
			padding_v: 0,
			shouldToggle_fn: function(
				to_isDisclosed, 
				async_reply_fn
			) {
				if (to_isDisclosed) { // when opening
					if (self.context.settingsController.authentication_requireWhenDisclosingWalletSecrets) {
						self.context.passwordController.Initiate_VerifyUserAuthenticationForAction(
							"Authenticate",
							function()
							{
								async_reply_fn(false) // disallowed
							},
							function()
							{
								setTimeout(
									function()
									{
										async_reply_fn(true) // allowed
									},
									300 // this delay is purely for visual effect, waiting for pw entry to dismiss
								)
							}
						)
					} else {
						async_reply_fn(true) // no need to auth
					}
				} else {
					async_reply_fn(true) // no need to auth
				}
			}
		}, self.context)
		{
			const layer = infoDisclosingView.layer
			layer.style.margin = "16px 0 0 0"
			layer.style.boxSizing = "border-box"
			layer.style.border = "0.5px solid #373537"
			layer.style.borderRadius = "5px"
			layer.style.padding = "0" // because padding, while useful, makes using pos:abslute to animate this more difficult in InfoDisclosingView
		}
		self.account_InfoDisclosingView = infoDisclosingView
		self.addSubview(infoDisclosingView)
	}
	_setup_sendReceive_actionButtons()
	{
		var self = this;
		var view = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
			0, 
			0, 
			15,
			self.context
		)
		self.actionButtonsContainerView = view
		{
			self._setup_actionButton_receive()
			self._setup_actionButton_send()
		}
		self.addSubview(view)
	}
	_setup_actionButton_receive()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Receive", 
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Wallets/Resources/actionButton_iconImage__request@3x.png", // relative to index.html
			// TODO?: borrowing another module's asset. sort of bad
			false,
			function(layer, e)
			{
				const requestForWallet = self.context.fundsRequestsListController.records.find(function(r) { // we'll just assume this is booted as well by now
					return r.is_displaying_local_wallet == true && r.to_address === self.wallet.public_address
				})
				if (typeof requestForWallet === 'undefined') {
					throw "Expected requestForWallet to be non nil"
				}
				//
				// hook into existing push functionality to get stuff like reference tracking
				const view = new FundsRequestQRDisplayView({
					fundsRequest: requestForWallet,
					presentedModally: true
				}, self.context)
				self.currentlyPresented_qrDisplayView = view
				const navigationView = new StackAndModalNavigationView({}, self.context)
				navigationView.SetStackViews([ view ])
				self.navigationController.PresentView(navigationView, true)
			},
			self.context,
			undefined,
			undefined,
			"16px 16px"
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_send()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Send", 
			self.context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Wallets/Resources/actionButton_iconImage__send@3x.png", // relative to index.html
			true,
			function(layer, e)
			{
				self.context.walletAppCoordinator.Trigger_sendFundsFromWallet(self.wallet)
			},
			self.context,
			undefined,
			undefined,
			"16px 16px"
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_layers_transactionsListLayerContainerLayer()
	{
		const self = this
		//
		const transactionsListLayerContainerLayer = document.createElement("div")
		transactionsListLayerContainerLayer.style.position = "relative"
		transactionsListLayerContainerLayer.style.left = "0"
		transactionsListLayerContainerLayer.style.top = "0"
		self.transactionsListLayerContainerLayer = transactionsListLayerContainerLayer
		self.layer.appendChild(transactionsListLayerContainerLayer)
		//
		const layer = document.createElement("div")
		self.layer_transactions = layer
		transactionsListLayerContainerLayer.appendChild(layer)
	}
	_setup_startObserving()
	{
		const self = this
		self._setup_startObserving_wallet()
	}
	_setup_startObserving_wallet()
	{
		const self = this
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "wallet undefined in start observing"
		}
		//
		// login events
		self.wallet_EventName_booted_listenerFunction = function()
		{
			self._wallet_loggedIn()
		}
		self.wallet.on(
			self.wallet.EventName_booted(),
			self.wallet_EventName_booted_listenerFunction
		)
		//
		self.wallet_EventName_errorWhileBooting_listenerFunction = function()
		{
			self._wallet_failedToLogIn()
		}
		self.wallet.on(
			self.wallet.EventName_errorWhileBooting(),
			self.wallet_EventName_errorWhileBooting_listenerFunction
		)
		//
		// label
		self.wallet_EventName_walletLabelChanged_listenerFunction = function()
		{
			self.wallet_EventName_walletLabelChanged()
		}
		self.wallet.on(
			self.wallet.EventName_walletLabelChanged(),
			self.wallet_EventName_walletLabelChanged_listenerFunction
		)
		// swatch
		self.wallet_EventName_walletSwatchChanged_listenerFunction = function()
		{
			self.wallet_EventName_walletSwatchChanged()
		}
		self.wallet.on(
			self.wallet.EventName_walletSwatchChanged(),
			self.wallet_EventName_walletSwatchChanged_listenerFunction
		)
		// balance
		self.wallet_EventName_balanceChanged_listenerFunction = function()
		{
			self.wallet_EventName_balanceChanged()
		}
		self.wallet.on(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
		// balance
		self.wallet_EventName_heightsUpdated_listenerFunction = function()
		{
			self.wallet_EventName_heightsUpdated()
		}
		self.wallet.on(
			self.wallet.EventName_heightsUpdated(),
			self.wallet_EventName_heightsUpdated_listenerFunction
		)
		//
		// txs updated
		self.wallet_EventName_transactionsChanged_listenerFunction = function()
		{
			self.wallet_EventName_transactionsChanged()
		}
		self.wallet.on(
			self.wallet.EventName_transactionsChanged(),
			self.wallet_EventName_transactionsChanged_listenerFunction
		)
		//
		// self.wallet_EventName_isFetchingUpdatesChanged_listenerFunction = function()
		// {
		// 	self._configureUIWithWallet__heightsAndImportAndFetchingState()
		// }
		// self.wallet.on(
		// 	self.wallet.EventName_isFetchingUpdatesChanged(),
		// 	self.wallet_EventName_isFetchingUpdatesChanged_listenerFunction
		// )
		//
		// deletion
		self._wallet_EventName_willBeDeleted_fn = function()
		{ // ^-- we observe /will/ instead of /did/ because if we didn't, self.navigationController races to get freed
			const current_topStackView = self.navigationController.topStackView
			const isOnTop = current_topStackView.IsEqualTo(self) == true
			if (isOnTop) {
				setTimeout(function()
				{
					self.navigationController.PopView(true) // animated
				}, 500) // because we want to wait until whatever UI deleted it settles down or we will get a refusal to pop while dismissing a modal
			} else { // or, we're not on top, so let's just remove self from the list of views
				throw "A Wallet details view expected to be on top of navigation stack when its wallet was deleted."
				// which means the following line should be uncommented and the method ImmediatelyExtractStackView needs to be implemented (which will w/o animation snatch self out of the stack)
				// self.navigationController.ImmediatelyExtractStackView(self)
			}
		}
		self.wallet.on(
			self.wallet.EventName_willBeDeleted(),
			self._wallet_EventName_willBeDeleted_fn
		)
		{
			let emitter = self.context.CcyConversionRates_Controller_shared
			self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = function()
			{
				self._configureUIWithWallet__balance()
			}
			emitter.on(
				emitter.eventName_didUpdateAvailabilityOfRates(),
				self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
			)
		}
		{
			let emitter = self.context.settingsController
			self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = function()
			{
				self._configureUIWithWallet__balance()
			}
			emitter.on(
				emitter.EventName_settingsChanged_displayCcySymbol(),
				self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
			)
		}
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{ // We're going to make sure we tear this down here as well as in VDA in case we get popped over back to root (thus never calling VDA but calling this)
		const self = this
		super.TearDown()
		self.tearDownAnySpawnedReferencedPresentedViews()
		self._stopObserving()
	}
	tearDownAnySpawnedReferencedPresentedViews()
	{
		const self = this
		if (self.current_transactionDetailsView !== null && typeof self.current_transactionDetailsView !== 'undefined') {
			self.current_transactionDetailsView.TearDown()
			self.current_transactionDetailsView = null
		}
		if (typeof self.current_EditWalletView !== 'undefined' && self.current_EditWalletView) {
			self.current_EditWalletView.TearDown()
			self.current_EditWalletView = null
		}
		// … is this sufficient? might need/want to tear down the stack nav too?
		if (self.currentlyPresented_ImportTransactionsModalView !== null && typeof self.currentlyPresented_ImportTransactionsModalView !== 'undefined') {
			self.currentlyPresented_ImportTransactionsModalView.TearDown() // might not be necessary but method guards itself
			self.currentlyPresented_ImportTransactionsModalView = null // must zero again and should free
		}
		if (self.currentlyPresented_qrDisplayView !== null && typeof self.currentlyPresented_qrDisplayView !== 'undefined') {
			self.currentlyPresented_qrDisplayView.TearDown() // might not be necessary but method guards itself
			self.currentlyPresented_qrDisplayView = null // must zero again and should free
		}
	}
	_stopObserving()
	{
		const self = this
		self.wallet.removeListener(
			self.wallet.EventName_booted(),
			self.wallet_EventName_booted_listenerFunction
		)
		self.wallet_EventName_booted_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_errorWhileBooting(),
			self.wallet_EventName_errorWhileBooting_listenerFunction
		)
		self.wallet_EventName_errorWhileBooting_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_walletLabelChanged(),
			self.wallet_EventName_walletLabelChanged_listenerFunction
		)
		self.wallet_EventName_walletLabelChanged_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_walletSwatchChanged(),
			self.wallet_EventName_walletSwatchChanged_listenerFunction
		)
		self.wallet_EventName_walletSwatchChanged_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_heightsUpdated(),
			self.wallet_EventName_heightsUpdated_listenerFunction
		)
		self.wallet_EventName_heightsUpdated_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
		self.wallet_EventName_balanceChanged_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_transactionsChanged(),
			self.wallet_EventName_transactionsChanged_listenerFunction
		)
		self.wallet_EventName_transactionsChanged_listenerFunction = null
		//
		// self.wallet.removeListener(
		// 	self.wallet.EventName_isFetchingUpdatesChanged(),
		// 	self.wallet_EventName_isFetchingUpdatesChanged_listenerFunction
		// )
		// self.wallet_EventName_isFetchingUpdatesChanged_listenerFunction = null
		//
		self.wallet.removeListener(
			self.wallet.EventName_willBeDeleted(),
			self._wallet_EventName_willBeDeleted_fn
		)
		self._wallet_EventName_willBeDeleted_fn = null
		{
			let emitter = self.context.CcyConversionRates_Controller_shared
			emitter.removeListener(
				emitter.eventName_didUpdateAvailabilityOfRates(),
				self._CcyConversionRates_didUpdateAvailabilityOfRates_fn
			)
			self._CcyConversionRates_didUpdateAvailabilityOfRates_fn = null
		}
		{
			let emitter = self.context.settingsController
			emitter.removeListener(
				emitter.EventName_settingsChanged_displayCcySymbol(),
				self._settingsController__EventName_settingsChanged_displayCcySymbol__fn
			)
			self._settingsController__EventName_settingsChanged_displayCcySymbol__fn = null
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		const wallet = self.wallet
		//
		return wallet.walletLabel || "Wallet"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_RightSide_EditButtonView(self.context)
		if (self.context.isLiteApp == true) {
			view.layer.innerHTML = "Log&nbsp;Out"
			view.layer.style.width = "64px"
		}
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (self.context.isLiteApp == true) {
					self.context.windowDialogs.PresentQuestionAlertDialogWith(
						'Log out?',
						'Are you sure you want to log out?',
						'Log Out',
						'Cancel',
						function(err, didChooseYes)
						{
							if (err) {
								throw err
							}
							if (didChooseYes) {
								self.context.passwordController.InitiateDeleteEverything(function(err) {})
							}
						}
					)
				} else { // v--- self.navigationController because self is presented packaged in a StackNavigationView
					const EditWalletView = require('./EditWalletView.web')
					const view = new EditWalletView({
						wallet: self.wallet
					}, self.context)
					self.current_EditWalletView = view
					//
					const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
					const navigationView = new StackAndModalNavigationView({}, self.context)
					navigationView.SetStackViews([ view ])
					self.navigationController.PresentView(navigationView, true)
				}
				return false
			}
		)
		return view
	}
	//
	// Accessors - Wallet - Transforms - TODO: move these to the wallet, esp for libapp
	_wallet_bootFailed()
	{
		const self = this
		const wallet = self.wallet
		const bootFailed = wallet.didFailToInitialize_flag == true || wallet.didFailToBoot_flag == true
		//
		return bootFailed
	}
	_wallet_shouldShowExportCSVBtn()
	{
		const self = this
		if (self._wallet_bootFailed()) {
			return false
		}
		if (self.wallet.HasEverFetched_transactions() !== true) {
			return false
		}
		if (self.wallet.New_StateCachedTransactions().length == 0) {
			return false
		}
		return true
	}
	_wallet_shouldShowImportTxsBtn()
	{
		const self = this
		const wallet = self.wallet
		const wallet_bootFailed = self._wallet_bootFailed()
		var shouldShow_importTxsBtn = wallet.shouldDisplayImportAccountOption == true && wallet_bootFailed == false
		if (wallet.HasEverFetched_transactions() !== false) {
			const stateCachedTransactions = wallet.New_StateCachedTransactions()
			if (stateCachedTransactions.length > 0) {
				shouldShow_importTxsBtn = false
			}
		}
		return shouldShow_importTxsBtn
	}
	//
	//
	// Runtime - Imperatives - UI Configuration
	//
	_configureUIWithWallet__accountInfo()
	{
		const self = this
		const wallet = self.wallet
		const addr = wallet.public_address
		const mnemonic = wallet.mnemonicString
		const viewKey = wallet.private_keys.view
		const spendKey = wallet.private_keys.spend
		if (wallet.didFailToInitialize_flag) { // failed to initialize
			self.preview__address_fieldView.SetValue(null)
			self.disclosed__address_fieldView.SetValue(null)
			self.viewKey_fieldView.SetValue(null)
			self.spendKey_fieldView.SetValue(null)
			self.mnemonicSeed_fieldView.SetValue(null)
			return
		}
		if (wallet.didFailToBoot_flag == true) {
			// in this state, we should still have enough info to display			
		}
		self.preview__address_fieldView.SetValue(addr)
		self.disclosed__address_fieldView.SetValue(addr)
		self.viewKey_fieldView.SetValue(viewKey)
		self.spendKey_fieldView.SetValue(spendKey)
		self.mnemonicSeed_fieldView.SetValue(mnemonic)
	}
	_configureUIWithWallet__balance()
	{
		const self = this
		const wallet = self.wallet
		{
			self.balanceLabelView.SetWalletThemeColor(wallet.swatch)
		}
		if (wallet.didFailToInitialize_flag == true) {
			self.balanceLabelView.SetPlainString("LOAD ERROR")
		} else if (wallet.didFailToBoot_flag == true) {
			self.balanceLabelView.SetPlainString("LOGIN ERROR")
		} else if (wallet.HasEverFetched_accountInfo() === false) {
			self.balanceLabelView.SetPlainString("LOADING…")
		} else {
			self.balanceLabelView.SetBalanceWithWallet(wallet)
		}
		// hopefully these will be able to handle small enough values .. maybe switch to BigInt w/o doubles .. but fwiw they are just for display
		let XMR = Currencies.ccySymbolsByCcy.XMR
		const amountPending_JSBigInt = wallet.AmountPending_JSBigInt()
		const hasPendingAmount = amountPending_JSBigInt.compare(0) > 0
		const amountLocked_JSBigInt = wallet.locked_balance || new JSBigInt(0)
		const hasLockedAmount = amountLocked_JSBigInt.compare(0) > 0
		const secondaryBalancesLabelVisible = hasPendingAmount == true || hasLockedAmount == true 
		if (secondaryBalancesLabelVisible) {
			var secondaryBalancesLabelText = ""
			if (hasPendingAmount) {
				const amount_displayStringComponents = Currencies.displayStringComponentsFrom( // this converts to whatever ccy they have selected
					self.context.CcyConversionRates_Controller_shared,
					amountPending_JSBigInt,
					self.context.settingsController.displayCcySymbol
				)
				secondaryBalancesLabelText += amount_displayStringComponents.amt_str + "&nbsp;" + "pending"
			}
			if (hasLockedAmount) {
				if (secondaryBalancesLabelText != "") {
					secondaryBalancesLabelText += "; "
				}
				const amount_displayStringComponents = Currencies.displayStringComponentsFrom( // this converts to whatever ccy they have selected
					self.context.CcyConversionRates_Controller_shared,
					amountLocked_JSBigInt,
					self.context.settingsController.displayCcySymbol
				)
				secondaryBalancesLabelText += amount_displayStringComponents.amt_str + "&nbsp;" + "locked"
			}
			if (secondaryBalancesLabelText === "") {
				throw "Expected non zero secondaryBalancesLabelText by this point"
			}
			self.secondaryBalancesLabelLayer.innerHTML = secondaryBalancesLabelText
			self.secondaryBalancesLabelLayer.style.display = "block"
		} else {
			self.secondaryBalancesLabelLayer.style.display = "none"
			self.secondaryBalancesLabelLayer.innerHTML = "" // might as well clear it 
		}
	}
	_configureUIWithWallet__transactions()
	{
		const self = this
		const wallet = self.wallet
		const wallet_bootFailed = wallet.didFailToInitialize_flag || wallet.didFailToBoot_flag
		const layer_transactions = self.layer_transactions
		while (layer_transactions.firstChild) {
			layer_transactions.removeChild(layer_transactions.firstChild)
		}
		self.transactions_listContainerLayer = null
		self.noTransactions_emptyStateView = null
		if (wallet_bootFailed) {
			return // wait for login/load before showing empty or not
		}
		if (wallet.HasEverFetched_transactions() === false) {
			// const p = document.createElement("p")
			// p.innerHTML = "Loading…"
			// layer_transactions.appendChild(p)
			return
		}
		const stateCachedTransactions = wallet.New_StateCachedTransactions()
		if (stateCachedTransactions.length == 0) {
			const view = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
				"😴", 
				"You don't have any<br/>transactions yet.",
				self.context,
				0, // explicit margin h
				0, // explicit margin v
				-12  // content translate y
			)
			const layer = view.layer
			layer.style.margin = `16px 0 16px 0`
			self.noTransactions_emptyStateView = view
			self.__configure_noTransactions_emptyStateView_height()
			layer_transactions.appendChild(view.layer) // to layer_transactions so it gets removed
			//
			return
		}
		const listContainerLayer = document.createElement("div")
		self.transactions_listContainerLayer = listContainerLayer
		listContainerLayer.style.margin = `16px 0 16px 0`
		listContainerLayer.style.background = "#383638"
		if (self.context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
			listContainerLayer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
		} else { // avoiding shadow
			listContainerLayer.style.boxShadow = "inset 0 0.5px 0 0 #494749"
		}
		listContainerLayer.style.borderRadius = "5px"
		listContainerLayer.style.overflow = "hidden" // mask to bounds, for corner radius on cell hover highlight
		{
			stateCachedTransactions.forEach(
				function(tx, i)
				{
					// console.log("tx", JSON.stringify(tx, null, '	'))
					const listItemLayer = document.createElement("div")
					listContainerLayer.appendChild(listItemLayer)
					{
						const layer = listItemLayer
						listItemLayer.style.position = "relative"
						listItemLayer.style.left = "0"
						listItemLayer.style.top = "0"
						listItemLayer.style.width = "100%"
						listItemLayer.style.height = "74px"
						//
						listItemLayer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
						listItemLayer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
					}
					listItemLayer.addEventListener(
						"click",
						function(e)
						{
							e.preventDefault() // not that there would be one
							const clicked_layer = this
							// NOTE: here, we can safely capture the parent scope's `tx` or `i`
							self._didClickTransaction(tx, i)
							return false
						}
					)
					listItemLayer.appendChild(commonComponents_tables.New_tableCell_accessoryChevronLayer(self.context))
					//
					const layer1 = document.createElement("div")
					layer1.style.width = "100%"
					layer1.style.height = "38px"
					listItemLayer.appendChild(layer1)
					//
					{ // Amount
						const div = document.createElement("div")
						layer1.appendChild(div)
						div.style.verticalAlign = "top"
						div.style.textAlign = "left"

						div.style.fontSize = "12px" // design says 13px but looks too big in actual app
						div.style.fontWeight = "400"
						div.style.letterSpacing = "0.5px"

						div.style.float = "left"
						div.style.height = "34px"
						div.style.boxSizing = "border-box"
						div.style.padding = "21px 0 0 16px"
						div.style.fontFamily = self.context.themeController.FontFamily_monospaceRegular()
						div.style.color = tx.approx_float_amount < 0 ? "#F97777" : "#FCFBFC"
						//
						// div.style.webkitUserSelect = "all" // decided to comment this because it interferes with cell click
						const received_JSBigInt = tx.total_received ? (typeof tx.total_received == 'string' ? new JSBigInt(tx.total_received) : tx.total_received) : new JSBigInt("0")
						const sent_JSBigInt = tx.total_sent ? (typeof tx.total_sent == 'string' ? new JSBigInt(tx.total_sent) : tx.total_sent) : new JSBigInt("0")
						div.innerHTML = monero_amount_format_utils.formatMoney(received_JSBigInt.subtract(sent_JSBigInt))
					}
					{ // Date
						const div = document.createElement("div")
						layer1.appendChild(div)
						div.style.verticalAlign = "top"
						div.style.float = "right"
						
						div.style.fontSize = "12px" // design says 13px but looks too big in actual app
						div.style.letterSpacing = "0.5px"
						div.style.fontWeight = "100"

						div.style.height = "34px"
						div.style.boxSizing = "border-box"
						div.style.padding = "21px 41px 0 0"
						div.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
						div.style.color = "#FCFBFC"
						const date = tx.timestamp // TODO: this in UTC?
						const dateString = date.toLocaleDateString( // (e.g. 27 NOV 2016)
							'en-US'/*for now*/, 
							{ year: 'numeric', month: 'short', day: 'numeric' }
						).toUpperCase()
						div.innerHTML = dateString 
					}
					//
					const layer2 = document.createElement("div")
					layer2.style.width = "100%"
					layer2.style.height = "34px"
					listItemLayer.appendChild(layer2)
					//
					{ // Payment ID (or contact name?)
						const div = document.createElement("div")
						layer2.appendChild(div)
						div.style.verticalAlign = "top"
						div.style.float = "left"
						div.style.width = "auto"
						div.style.maxWidth = "189px"
						div.style.boxSizing = "border-box"
						div.style.padding = "1px 0 0 16px"
						//
						div.style.whiteSpace = "nowrap"
						div.style.overflow = "hidden"
						div.style.textOverflow = "ellipsis"
						//
						div.style.fontFamily = self.context.themeController.FontFamily_monospaceLight()
						div.style.fontSize = "13px" 
						div.style.color = "#9E9C9E"
						div.style.fontWeight = "100"
						//
						div.innerHTML = `${ tx.payment_id || "" }`
					}
					{ // Status
						const div = document.createElement("div")
						layer2.appendChild(div)
						div.style.float = "right"
						div.style.display = "inline-block"
						div.style.textAlign = "right"
						div.style.verticalAlign = "top"

						div.style.fontFamily = self.context.themeController.FontFamily_monospaceRegular()
						div.style.fontWeight = "500"
						div.style.fontSize = "10px" // design says 11 but next to 13px->12px, looks too big, so, 10
						div.style.letterSpacing = "0.5px"

						div.style.boxSizing = "border-box"
						div.style.padding = "3px 41px 0 0"
						div.style.color = "#6B696B"
						div.innerHTML = `${ tx.isFailed ? "REJECTED" : (tx.isConfirmed !== true || tx.isUnlocked !== true ? "PENDING" : "CONFIRMED") }`
					}
				}
			)
		}
		layer_transactions.appendChild(listContainerLayer)
	}
	//
	_configureUIWithWallet__heightsAndImportAndFetchingState()
	{
		const self = this
		const wallet = self.wallet
		const transactionsListLayerContainerLayer = self.transactionsListLayerContainerLayer
		const wallet_bootFailed = self._wallet_bootFailed()
		var shouldShow_importTxsBtn = self._wallet_shouldShowImportTxsBtn()
		if (shouldShow_importTxsBtn) {
			if (!self.importTransactionsButtonView || typeof self.importTransactionsButtonView === 'undefined') {
				const buttonView = commonComponents_tables.New_clickableLinkButtonView(
					"IMPORT TRANSACTIONS",
					self.context, 
					function()
					{
						self._present_importTransactionsModal()
					}
				)
				self.importTransactionsButtonView = buttonView
				const layer = buttonView.layer
				layer.style.position = "absolute"
				layer.style.left = "6px"
				layer.style.top = "5px"
				layer.style.width = "150px"
				layer.style.height = "13px"
				layer.style.float = "none"
				layer.style.clear = "none" // doesn't matter tho
				transactionsListLayerContainerLayer.appendChild(layer)
			}
		} else {
			if (self.importTransactionsButtonView) {
				if (self.importTransactionsButtonView.layer.parentNode) {
					self.importTransactionsButtonView.layer.parentNode.removeChild(self.importTransactionsButtonView.layer)
				}
				self.importTransactionsButtonView = null
			}
		}
		var shouldShowActivityIndicator = 
			wallet.isBooted // rule out still-logging-in (for now) 
			&& wallet.HasEverFetched_accountInfo() // rule out still loading (for now)
			&& wallet_bootFailed == false 
			&& (wallet.IsScannerCatchingUp()/* || wallet.IsFetchingAnyUpdates()*/)
		if (shouldShowActivityIndicator) {
			if (!self.catchingUpProgressAndActivityIndicatorView || typeof self.catchingUpProgressAndActivityIndicatorView === 'undefined') {
				const view = new View({}, self.context)
				view.ConfigureWithProgress = function()
				{
					function __blocksBehindMsg(nBlocks)
					{
						if (nBlocks > 0) {
							return `${nBlocks} block${nBlocks != 1 ? "s" : ""} behind`
						} else {
							return shouldShow_importTxsBtn != true ? `Scanner up-to-date` : ""
						}
					}
					var messageText;
					var progressLabelLayer_innerHTMLStr = "" // default
					const nBlocks = self.wallet.NBlocksBehind()
/*					if (wallet.IsFetchingAnyUpdates()) {
						messageText = self.context.isMobile == true
							? "FETCHING…" 
							: "FETCHING UPDATES…"
					} else */if (wallet.IsScannerCatchingUp()) {
						messageText = self.context.isMobile == true
							? "SCANNING…" 
							: "SCANNING BLOCKCHAIN…"
					} else {
						throw "Illegal: !wallet.IsFetchingAnyUpdates() && !wallet.IsScannerCatchingUp()"
					}
					progressLabelLayer_innerHTMLStr = __blocksBehindMsg(nBlocks)
					self.catchingUp_activityIndicatorLayer.Component_setMessageText(messageText)
					self.progressLabelLayer.innerHTML = progressLabelLayer_innerHTMLStr
				}
				const layer = view.layer
				layer.style.position = "relative"
				layer.style.left = "0"
				layer.style.top = "0"
				layer.style.marginTop = "8px"
				layer.style.boxSizing = "border-box"
				layer.style.width = "100%"
				layer.style.height = "18px"
				layer.style.padding = "0 14px 0 19px"
				self.catchingUpProgressAndActivityIndicatorView = view
				//
				const activityIndicatorLayer = commonComponents_activityIndicators.New_GraphicAndLabel_ActivityIndicatorLayer(
					"",
					self.context
				)
				activityIndicatorLayer.style.paddingLeft = "0" // overriding
				activityIndicatorLayer.style.color = "#9E9C9E" // overriding
				self.catchingUp_activityIndicatorLayer = activityIndicatorLayer
				self.catchingUpProgressAndActivityIndicatorView.layer.appendChild(activityIndicatorLayer)
				//
				const progressLabelLayer = document.createElement("span")
				self.progressLabelLayer = progressLabelLayer
				progressLabelLayer.style.position = "absolute"
				progressLabelLayer.style.width = "auto"
				progressLabelLayer.style.height = "14px"
				progressLabelLayer.style.textAlign = "right"
				progressLabelLayer.style.right = "19px"
				progressLabelLayer.style.top = "8px"
				//
				self.context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
				//
				progressLabelLayer.style.color = "#9E9C9E"
				layer.appendChild(progressLabelLayer)
				//
				self.layer.insertBefore(layer, self.transactionsListLayerContainerLayer)
				// ^ insert the constructed view before the transactionsListLayerContainerLayer
			}
			self.catchingUpProgressAndActivityIndicatorView.ConfigureWithProgress()
		} else {
			if (self.catchingUpProgressAndActivityIndicatorView) {
				const layer = self.catchingUpProgressAndActivityIndicatorView.layer
				const parentNode = layer.parentNode
				if (parentNode) { // just in case - i.e. during special debug case
					parentNode.removeChild(layer)
				}
				self.catchingUpProgressAndActivityIndicatorView = null
				self.progressLabelLayer = null // can assume we only need to nil this here
			}
		}
		self.__configure_noTransactions_emptyStateView_height()
		//
		if (self._wallet_shouldShowExportCSVBtn()) {
			if (!self.exportCSVButtonView || typeof self.exportCSVButtonView === 'undefined') {
				const buttonView = commonComponents_tables.New_clickableLinkButtonView(
					"EXPORT CSV",
					self.context, 
					function()
					{
						self._exportTransactionsCSV()
					}
				)
				buttonView.layer.style.marginBottom = "24px"
				self.exportCSVButtonView = buttonView
				// this is ~insertAfter:
				self.transactionsListLayerContainerLayer.appendChild(buttonView.layer);
			}
		} else {
			if (self.exportCSVButtonView) {
				if (self.exportCSVButtonView.layer.parentNode) {
					self.exportCSVButtonView.layer.parentNode.removeChild(self.exportCSVButtonView.layer)
				}
				self.exportCSVButtonView = null
			}
		}
	}
	__configure_noTransactions_emptyStateView_height()
	{
		const self = this
		if (self.noTransactions_emptyStateView) {
			self.noTransactions_emptyStateView.layer.style.height = self.catchingUpProgressAndActivityIndicatorView ? "254px" : "276px"
		}
	}
	_ifNecessary_autoPresent_importTxsModal_afterS(afterS)
	{
		const self = this
		// If this is the first time after logging in that we're displaying the import txs modal,
		// then auto-display it for the user so they don't have to know to click on the button
		if (self.hasEverAutomaticallyDisplayedImportModal !== true) {
			if (self._wallet_shouldShowImportTxsBtn()) {
				self.hasEverAutomaticallyDisplayedImportModal = true; // immediately, in case login and viewDidAppear race
				setTimeout(function()
				{
					if (self.wallet.hasBeenTornDown != true) {
						self._present_importTransactionsModal()
					}
				}, afterS * 1000)
			}
		}
	}
	//
	//
	// Runtime - Imperatives - Changing specific elements of the UI 
	//
	_reconfigureUIWithChangeTo_wallet__color()
	{
		const self = this
		self.balanceLabelView.SetWalletThemeColor(self.wallet.swatch)
	}
	//
	//
	// Runtime - Imperatives - Navigation
	//
	pushDetailsViewFor_transaction(transaction)
	{
		const self = this
		const _cmd = "pushDetailsViewFor_transaction"
		if (self.current_transactionDetailsView !== null) {
			// commenting this throw so we can use this as the official way to block double-clicks, etc
			// throw "Asked to " + _cmd + " while self.current_transactionDetailsView !== null"
			return
		}
		{ // validate wallet and tx
			if (typeof self.wallet === 'undefined' || self.wallet === null) {
				throw self.constructor.name + " requires self.wallet to " + _cmd
			}
			if (typeof transaction === 'undefined' || transaction === null) {
				throw self.constructor.name + " requires transaction to " + _cmd
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to " + _cmd
		}
		{
			const options = 
			{
				wallet: self.wallet,
				transaction: transaction
			}
			const view = new TransactionDetailsView(options, self.context)
			navigationController.PushView(
				view, 
				true // animated
			)
			// Now… since this is JS, we have to manage the view lifecycle (specifically, teardown) so
			// we take responsibility to make sure its TearDown gets called. The lifecycle of the view is approximated
			// by tearing it down on self.viewDidAppear() below and on TearDown()
			self.current_transactionDetailsView = view
		}
	}
	_present_importTransactionsModal()
	{
		const self = this
		const view = new ImportTransactionsModalView({
			wallet: self.wallet
		}, self.context)
		self.currentlyPresented_ImportTransactionsModalView = view
		const navigationView = new StackAndModalNavigationView({}, self.context)
		navigationView.SetStackViews([ view ])
		self.navigationController.PresentView(navigationView, true)
	}
	//
	// Imperatives - Button functions - CSV export
	_exportTransactionsCSV()
	{
		const self = this
		const wallet_bootFailed = self._wallet_bootFailed()
		if (wallet_bootFailed) {
			throw "Expected !wallet_bootFailed"
		}
		if (self.wallet.HasEverFetched_transactions() !== true) {
			throw "Expected true HasEverFetched_transactions"
		}
		const stateCachedTransactions = self.wallet.New_StateCachedTransactions()
		if (stateCachedTransactions.length == 0) {
			throw "Expected non-zero num transactions"
		}
		const headers = ["date", "amount", "status", "tx id", "payment_id"];
		let csvContent = "";
		csvContent += headers.join(",") + "\r\n"
		stateCachedTransactions.forEach(
			function(tx, i)
			{
				const received_JSBigInt = tx.total_received ? (typeof tx.total_received == 'string' ? new JSBigInt(tx.total_received) : tx.total_received) : new JSBigInt("0")
				const sent_JSBigInt = tx.total_sent ? (typeof tx.total_sent == 'string' ? new JSBigInt(tx.total_sent) : tx.total_sent) : new JSBigInt("0")
				const amountString = monero_amount_format_utils.formatMoney(received_JSBigInt.subtract(sent_JSBigInt))
				//
				const payment_id = `${ tx.payment_id || "" }`
				const status = `${ tx.isFailed ? "REJECTED" : (tx.isConfirmed !== true || tx.isUnlocked !== true ? "PENDING" : "CONFIRMED") }`
				//
				const columns = [ tx.timestamp.toISOString(), amountString, status, tx.hash, payment_id ]
				csvContent += columns.join(",") + "\r\n";
			}
		)
		self.context.filesystemUI.PresentDialogToSaveTextFile(
			csvContent,
			"Save CSV",
			self.wallet.walletLabel || "transactions",
			"csv",
			function(err)
			{
				if (err) {
					const errString = err.message 
						? err.message 
						: err.toString() 
							? err.toString() 
							: ""+err
					navigator.notification.alert(
						errString, 
						function() {}, // nothing to do 
						"Error", 
						"OK"
					)
					return
				}
			},
			"data:text/csv;charset=utf-8,"
		)
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		//
		if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
			self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px` // no need to set height as we're box-sizing: border-box
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		//
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "WalletDetailsView/viewDidAppear: self.wallet=nil"
		}
		self.wallet.requestFromUI_manualRefresh()
		//
		self._ifNecessary_autoPresent_importTxsModal_afterS(1)
	}
	// Runtime - Protocol / Delegation - Stack & modal navigation 
	// We don't want to naively do this on VDA as else tab switching may trigger it - which is bad
	navigationView_didDismissModalToRevealView()
	{
		const self = this
		if (super.navigationView_didDismissModalToRevealView) {
			super.navigationView_didDismissModalToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	navigationView_didPopToRevealView()
	{
		const self = this
		if (super.navigationView_didPopToRevealView) {
			super.navigationView_didPopToRevealView() // in case it exists
		}
		self.tearDownAnySpawnedReferencedPresentedViews()
	}
	//
	//
	// Runtime - Delegation - Event handlers - Wallet
	//
	_wallet_loggedIn()
	{
		const self = this
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__balance()
		self._configureUIWithWallet__transactions()
		self._configureUIWithWallet__heightsAndImportAndFetchingState()
		//
		self._ifNecessary_autoPresent_importTxsModal_afterS(1)
	}
	//
	_wallet_failedToLogIn()
	{
		const self = this
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__balance()
		self._configureUIWithWallet__transactions()
		self._configureUIWithWallet__heightsAndImportAndFetchingState()
		self.hasEverAutomaticallyDisplayedImportModal = undefined // think we might as well un-set this here - i.e. on a 'log out'
	}
	//
	wallet_EventName_walletLabelChanged()
	{
		const self = this
		self.navigationController.SetNavigationBarTitleNeedsUpdate() 
	}
	wallet_EventName_walletSwatchChanged()
	{
		const self = this
		self._reconfigureUIWithChangeTo_wallet__color()
	}
	wallet_EventName_balanceChanged()
	{
		const self = this
		self._configureUIWithWallet__balance()
	}
	wallet_EventName_transactionsChanged()
	{
		const self = this
		self._configureUIWithWallet__balance() // adding this b/c it updates the secondaryBalances label which relies on txs
		self._configureUIWithWallet__transactions()
	}
	wallet_EventName_heightsUpdated()
	{
		const self = this
		self._configureUIWithWallet__heightsAndImportAndFetchingState()
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_didClickTransaction(transaction, atIndex)
	{
		const self = this
		self.pushDetailsViewFor_transaction(transaction)
	}
}
module.exports = WalletDetailsView
