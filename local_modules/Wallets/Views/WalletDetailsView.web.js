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
const monero_config = require('../../monero_utils/monero_config')
//
const View = require('../../Views/View.web')
//
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
const commonComponents_hoverableCells = require('../../MMAppUICommonComponents/hoverableCells.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const InfoDisclosingView = require('../../InfoDisclosingView/Views/InfoDisclosingView.web')
//
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const TransactionDetailsView = require("./TransactionDetailsView.web")
const ImportTransactionsModalView = require('./ImportTransactionsModalView.web')
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
		}
		self._setup_views()
		self._setup_startObserving()
		//
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__balance()
		self._configureUIWithWallet__transactions()
		self._configureUIWithWallet__heightsAndImportState()
	}
	_setup_views()
	{
		const self = this
		self._setup_self_layer()
		self._setup_balanceLabelView()
		self._setup_account_InfoDisclosingView()
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
		const paddingZeroesLabelSpan = document.createElement("span")
		{
			const layer = paddingZeroesLabelSpan			
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
				paddingZeroesLabelSpan.style.color = "rgba(248, 247, 248, 0.2)"
			} else {
				mainLabelSpan.style.color = "#161416" // so use dark text
				paddingZeroesLabelSpan.style.color = "rgba(29, 26, 29, 0.2)"
			}
			view.layer.style.color = paddingZeroesLabelSpan.style.color // for the '…' during truncation
			//
			view._swatch_hexColorString = swatch_hexColorString
			view.layer.style.backgroundColor = swatch_hexColorString
		}
		view.SetPlainString = function(plainString)
		{
			mainLabelSpan.innerHTML = plainString
			paddingZeroesLabelSpan.innerHTML = ""
		}
		view.SetBalanceWithWallet = function(wallet)
		{ 
			var finalized_main_string = ""
			var finalized_paddingZeros_string = ""
			{
				const raw_balanceString = wallet.Balance_FormattedString()
				const coinUnitPlaces = monero_config.coinUnitPlaces
				const raw_balanceString__components = raw_balanceString.split(".")
				if (raw_balanceString__components.length == 1) {
					const balance_aspect_integer = raw_balanceString__components[0]
					if (balance_aspect_integer === "0") {
						finalized_main_string = ""
						finalized_paddingZeros_string = "00." + Array(coinUnitPlaces).join("0")
					} else {
						finalized_main_string = balance_aspect_integer + "."
						finalized_paddingZeros_string = Array(coinUnitPlaces).join("0")
					}
				} else if (raw_balanceString__components.length == 2) {
					finalized_main_string = raw_balanceString
					const decimalComponent = raw_balanceString__components[1]
					const decimalComponent_length = decimalComponent.length
					if (decimalComponent_length < coinUnitPlaces + 2) {
						finalized_paddingZeros_string = Array(coinUnitPlaces - decimalComponent_length + 2).join("0")
					}
				} else {
					throw "Couldn't parse formatted balance string."
					// finalized_main_string = raw_balanceString
					// finalized_paddingZeros_string = ""
				}
			}
			mainLabelSpan.innerHTML = finalized_main_string
			paddingZeroesLabelSpan.innerHTML = finalized_paddingZeros_string
		}
	}
	_new_fieldBaseView(entitled, isTruncatedPreviewForm)
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
			isTruncatedPreviewForm == true ? true : false
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
			const preview__address_fieldView = self._new_fieldBaseView("Address", true)
			self.preview__address_fieldView = preview__address_fieldView
			previewView.addSubview(preview__address_fieldView)
		}
		const disclosedView = new View({}, self.context)
		{
			const disclosed__address_fieldView = self._new_fieldBaseView("Address")
			self.disclosed__address_fieldView = disclosed__address_fieldView
			disclosedView.addSubview(disclosed__address_fieldView)
			//
			const viewKey_fieldView = self._new_fieldBaseView("Secret View Key")
			self.viewKey_fieldView = viewKey_fieldView
			disclosedView.addSubview(viewKey_fieldView)
			//
			const spendKey_fieldView = self._new_fieldBaseView("Secret Spend Key")
			self.spendKey_fieldView = spendKey_fieldView
			disclosedView.addSubview(spendKey_fieldView)
			//
			const mnemonicSeed_fieldView = self._new_fieldBaseView("Secret Mnemonic")
			self.mnemonicSeed_fieldView = mnemonicSeed_fieldView
			mnemonicSeed_fieldView.SetWordBreakMode("break-word")
			disclosedView.addSubview(mnemonicSeed_fieldView)
		}
		const infoDisclosingView = new InfoDisclosingView({
			previewView: previewView,
			disclosedView: disclosedView,
			padding_left: 18,
			padding_right: 18,
			padding_v: 0
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
		if (self.current_transactionDetailsView !== null) {
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
	}
	_stopObserving()
	{
		const self = this
		self.wallet.removeListener(
			self.wallet.EventName_walletLabelChanged(),
			self.wallet_EventName_walletLabelChanged_listenerFunction
		)
		self.wallet.removeListener(
			self.wallet.EventName_walletSwatchChanged(),
			self.wallet_EventName_walletSwatchChanged_listenerFunction
		)
		self.wallet.removeListener(
			self.wallet.EventName_heightsUpdated(),
			self.wallet_EventName_heightsUpdated_listenerFunction
		)
		self.wallet.removeListener(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
		self.wallet.removeListener(
			self.wallet.EventName_transactionsChanged(),
			self.wallet_EventName_transactionsChanged_listenerFunction
		)
		self.wallet.removeListener(
			self.wallet.EventName_willBeDeleted(),
			self._wallet_EventName_willBeDeleted_fn
		)
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
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{ // v--- self.navigationController because self is presented packaged in a StackNavigationView				
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
		if (wallet.didFailToInitialize_flag == true || wallet.didFailToBoot_flag == true) { // failed to initialize
			self.preview__address_fieldView.SetValue(null)
			self.disclosed__address_fieldView.SetValue(null)
			self.viewKey_fieldView.SetValue(null)
			self.spendKey_fieldView.SetValue(null)
			self.mnemonicSeed_fieldView.SetValue(null)
			return
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
		self.balanceLabelView.SetWalletThemeColor(wallet.swatch)
		if (wallet.didFailToInitialize_flag == true 
			|| wallet.didFailToBoot_flag == true) { // failed to initialize
			self.balanceLabelView.SetPlainString("ERROR LOADING")
			return
		}
		if (wallet.HasEverFetched_accountInfo() === false) {
			self.balanceLabelView.SetPlainString("LOADING…")
		} else {
			self.balanceLabelView.SetBalanceWithWallet(wallet)
		}
	}
	_configureUIWithWallet__transactions()
	{
		const self = this
		const wallet = self.wallet
		if (wallet.didFailToInitialize_flag === true || wallet.didFailToBoot_flag === true) {
			throw "WalletDetailsView opened while wallet failed to init or boot."
		}
		const layer_transactions = self.layer_transactions
		while (layer_transactions.firstChild) {
			layer_transactions.removeChild(layer_transactions.firstChild)
		}
		self.transactions_listContainerLayer = null
		self.noTransactions_emptyStateView = null
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
		listContainerLayer.style.margin = `16px 0 40px 0` // when we add 'Load more' btn, 40->16
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
						div.innerHTML = tx.approx_float_amount
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
						div.innerHTML = `${ tx.payment_id || "N/A" }`
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
						div.innerHTML = `${ tx.isConfirmed !== true || tx.isUnlocked !== true ? "PENDING" : "CONFIRMED" }`
					}
				}
			)
		}
		layer_transactions.appendChild(listContainerLayer)
	}
	_configureUIWithWallet__heightsAndImportState()
	{
		const self = this
		const wallet = self.wallet
		const transactionsListLayerContainerLayer = self.transactionsListLayerContainerLayer
		var shouldShow_importTxsBtn = wallet.shouldDisplayImportAccountOption == true 
		{ // to finalize
			if (wallet.HasEverFetched_transactions() !== false) {
				const stateCachedTransactions = wallet.New_StateCachedTransactions()
				if (stateCachedTransactions.length > 0) {
					shouldShow_importTxsBtn = false
				}
			}
		}
		var shouldShow_catchingUpProgressAndActivityIndicator = wallet.IsScannerCatchingUp()
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
			}
		}
		if (shouldShow_catchingUpProgressAndActivityIndicator) {
			if (!self.catchingUpProgressAndActivityIndicatorView || typeof self.catchingUpProgressAndActivityIndicatorView === 'undefined') {
				const view = new View({}, self.context)
				view.ConfigureWithProgress = function()
				{
					// const formattedFloatStr = "" + (to_float * 100).toFixed(0) + "%"
					const innerHTMLStr = `${self.wallet.NBlocksBehind()} blocks behind`
					self.progressLabelLayer.innerHTML = innerHTMLStr
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
				const scanningHeadlineLabelText = 
					self.context.Cordova_isMobile === true 
					? "SCANNING…"  // just a quick solution for now
					: "SCANNING BLOCKCHAIN…"
				const activityIndicatorLayer = commonComponents_activityIndicators.New_GraphicAndLabel_ActivityIndicatorLayer(
					scanningHeadlineLabelText,
					self.context
				)
				activityIndicatorLayer.style.paddingLeft = "0" // overriding
				activityIndicatorLayer.style.color = "#9E9C9E" // overriding
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
	}
	__configure_noTransactions_emptyStateView_height()
	{
		const self = this
		if (self.noTransactions_emptyStateView) {
			self.noTransactions_emptyStateView.layer.style.height = self.catchingUpProgressAndActivityIndicatorView ? "254px" : "276px"
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
		self._configureUIWithWallet__transactions()
	}
	wallet_EventName_heightsUpdated()
	{
		const self = this
		self._configureUIWithWallet__heightsAndImportState()
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
