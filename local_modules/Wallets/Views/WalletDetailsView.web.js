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
const monero_config = require('../../monero_utils/monero_config')
const TransactionDetailsView = require("./TransactionDetailsView.web")
const commonComponents_navigationBarButtons = require('../../WalletAppCommonComponents/navigationBarButtons.web')
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
				return
			}
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{ // zeroing / initialization
			self.current_transactionDetailsView = null
		}
		self._setup_views()
		self._setup_startObserving()
		//
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__transactions()
	}
	_setup_views()
	{
		const self = this
		self.setup_self_layer()
		self._setup_balanceLabelView()
		self.setup_layers_transactions()
	}
	setup_self_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.width = "calc(100% - 20px)"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.overflowY = "scroll"
		layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
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
			layer.style.padding = "17px 18px"
			layer.style.boxShadow = "0 0.5px 1px 0 rgba(0,0,0,0.20), inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
			layer.style.borderRadius = "5px"
		}
		const mainLabelSpan = document.createElement("span")
		{
			const layer = mainLabelSpan
			layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
			layer.style.fontWeight = "100"
			layer.style.fontSize = "32px"
			view.layer.appendChild(layer)
		}
		const paddingZeroesLabelSpan = document.createElement("span")
		{
			const layer = paddingZeroesLabelSpan			
			layer.style.fontFamily = self.context.themeController.FontFamily_monospace()
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
					finalized_main_string = raw_balanceString__components[0] + "."
					finalized_paddingZeros_string = Array(coinUnitPlaces).join("0")
				} else if (raw_balanceString__components.length == 2) {
					finalized_main_string = raw_balanceString
					const decimalComponent = raw_balanceString__components[1]
					const decimalComponent_length = decimalComponent.length
					if (decimalComponent_length < coinUnitPlaces + 2) {
						finalized_paddingZeros_string = Array(coinUnitPlaces - decimalComponent_length + 2).join("0")
					}
				} else {
					throw "Couldn't parse formatted balance string."
					finalized_main_string = raw_balanceString
					finalized_paddingZeros_string = ""
				}
			}
			mainLabelSpan.innerHTML = finalized_main_string
			paddingZeroesLabelSpan.innerHTML = finalized_paddingZeros_string
		}
	}
	setup_layers_transactions()
	{
		const self = this
		//
		const layer = document.createElement("div")
		layer.className = "transactions"
		layer.style.border = "1px solid #ccc"
		layer.style.borderRadius = "5px"
		layer.style.marginBottom = "5px"
		//
		self.layer_transactions = layer
		self.layer.appendChild(layer)
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
			return
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
		//
		self._stopObserving()
		{
			if (self.current_transactionDetailsView !== null) {
				self.current_transactionDetailsView.TearDown()
				self.current_transactionDetailsView = null
			}
		}
		{
			if (typeof self.current_EditWalletView !== 'undefined' && self.current_EditWalletView) {
				self.current_EditWalletView.TearDown()
				self.current_EditWalletView = null
			}
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
		{ // observe
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
		}
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

		// wallet.public_address
		// wallet.mnemonicString
		// wallet.private_keys.view
		// wallet.private_keys.spend				
		
		
	}
	_configureUIWithWallet__transactions()
	{
		const self = this
		const wallet = self.wallet
		if (wallet.didFailToInitialize_flag === true || wallet.didFailToBoot_flag === true) {
			throw "WalletDetailsView opened while wallet failed to init or boot."
			return
		}
		const layer_transactions = self.layer_transactions
		{ // clear layer_transactions
			while (layer_transactions.firstChild) {
			    layer_transactions.removeChild(layer_transactions.firstChild)
			}
		}
		if (wallet.HasEverFetched_transactions() === false) {
			{
				const p = document.createElement("p")
				{
					p.innerHTML = "Loading…"
				}
				layer_transactions.appendChild(p)
			}
			//
			return
		}
		const ul = document.createElement("ul")
		{
			const stateCachedTransactions = wallet.New_StateCachedTransactions()
			stateCachedTransactions.forEach(
				function(tx, i)
				{
					// console.log("tx", JSON.stringify(tx, null, '    '))
					const li = document.createElement("li")
					li.style.cursor = "pointer" // to make it look clickable
					{
						const table = document.createElement("table")
						{ // tables forever
							const tr_1 = document.createElement("tr")
							{
								{ // Amount
									const td = document.createElement("td")
									{
										td.innerHTML = tx.approx_float_amount
										td.style.textAlign = "left"
										td.style.fontSize = "14px"
										td.style.width = "75%"
										td.style.fontFamily = "monospace" // TODO
										td.style.color = tx.approx_float_amount < 0 ? "red" : "#f0f0f0"
										//
										// td.style.webkitUserSelect = "all" // decided to comment this because it interferes with cell click
									}
									tr_1.appendChild(td)
								}
								{ // Date
									const td = document.createElement("td")
									{
										td.innerHTML = `${tx.timestamp.toString()}` // TODO: format per design (e.g. 27 NOV 2016)
										td.style.textAlign = "right"
										td.style.fontSize = "14px"
										td.style.width = "25%"
										td.style.fontFamily = "monospace" // TODO
										td.style.color = "#ccc"
									}
									tr_1.appendChild(td)
								}
							}
							table.appendChild(tr_1)
							//
							const tr_2 = document.createElement("tr")
							{
								{ // Payment ID (or contact name?)
									const td = document.createElement("td")
									{
										td.style.textAlign = "left"
										td.style.width = "75%"
									}
									{
										const paymentID_span = document.createElement("span")
										{ // wrap to create ellipsis											
											paymentID_span.style.display = "block" // to get width behavior
											paymentID_span.style.width = "184px" // it would be nice to make this '70%' of the above '75%' but that doesn't seem to work properly
											//
											paymentID_span.style.whiteSpace = "nowrap"
											paymentID_span.style.overflow = "hidden"
											paymentID_span.style.textOverflow = "ellipsis"
											paymentID_span.style.fontFamily = "monospace" // TODO
											paymentID_span.style.fontSize = "14px"
											paymentID_span.style.color = "#909090"
											paymentID_span.style.textAlign = "left"
											//
											paymentID_span.innerHTML = `${ tx.payment_id || "N/A" }`
										}
										td.appendChild(paymentID_span)
									}
									tr_2.appendChild(td)
								}
								{ // Date
									const td = document.createElement("td")
									{
										td.innerHTML = `${ tx.isConfirmed !== true || tx.isUnlocked !== true ? "PENDING" : "CONFIRMED" }`
										td.style.textAlign = "right"
										td.style.fontSize = "11px"
										td.style.width = "25%"
										td.style.fontFamily = "monospace" // TODO
										td.style.color = "#666"
									}
									tr_2.appendChild(td)
								}
							}
							table.appendChild(tr_2)
						}
						li.appendChild(table)
					}
					{ // observations
						li.addEventListener(
							"click",
							function(e)
							{
								e.preventDefault() // not that there would be one
								{
									const clicked_layer = this
									// NOTE: here, we can safely capture the parent scope's `tx` or `i`
									self._didClickTransaction(tx, i)
								}
								return false
							}
						)
					}
					ul.appendChild(li)
				}
			)
		}
		layer_transactions.appendChild(ul)
	}
	//
	//
	// Runtime - Imperatives - Changing specific elements of the UI 
	//
	_reconfigureUIWithChangeTo_wallet__color()
	{
		const self = this
		console.log("TODO: refresh anything related to the color… it just changed!", self.wallet.swatch)
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
				return
			}
			if (typeof transaction === 'undefined' || transaction === null) {
				throw self.constructor.name + " requires transaction to " + _cmd
				return
			}
		}
		const navigationController = self.navigationController
		if (typeof navigationController === 'undefined' || navigationController === null) {
			throw self.constructor.name + " requires navigationController to " + _cmd
			return
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
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		{
			// teardown any child/referenced stack navigation views if necessary…
			if (self.current_transactionDetailsView !== null) {
				self.current_transactionDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
				self.current_transactionDetailsView = null // must zero again and should free
			}
			if (typeof self.current_EditWalletView !== 'undefined' && self.current_EditWalletView) {
				self.current_EditWalletView.TearDown()
				self.current_EditWalletView = null
			}
		}
	}
	//
	//
	// Runtime - Delegation - Event handlers - Wallet
	//
	wallet_EventName_walletLabelChanged()
	{
		const self = this
		self.navigationController.SetNavigationBarTitleNeedsUpdate() 
		self._configureUIWithWallet__accountInfo() // TODO: just update the label
	}
	wallet_EventName_walletSwatchChanged()
	{
		const self = this
		self._reconfigureUIWithChangeTo_wallet__color()
	}
	wallet_EventName_balanceChanged()
	{
		const self = this
		self._configureUIWithWallet__accountInfo() // TODO: update just balance
	}
	wallet_EventName_transactionsChanged()
	{
		const self = this
		self._configureUIWithWallet__transactions()
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
