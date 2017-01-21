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
const TransactionDetailsView = require("./TransactionDetailsView.web")
//
class WalletDetailsView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		{
			self.wallet = options.wallet
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
		//
		self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		self.layer.style.width = "calc(100% - 20px)"
		self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		//
		self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		self.layer.style.color = "#c0c0c0" // temporary
		//
		self.layer.style.overflowY = "scroll"
		self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
		//
		self.setup_layers_accountInfo()
		self.setup_layers_transactions()
	}
	setup_layers_accountInfo()
	{
		const self = this
		//
		const layer = document.createElement("div")
		layer.className = "accountInfo"
		layer.style.border = "1px solid #ccc"
		layer.style.borderRadius = "5px"
		layer.style.marginBottom = "5px"
		//
		self.layer_accountInfo = layer
		self.layer.appendChild(layer)
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
	}
	_stopObserving()
	{
		const self = this
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletLabelChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletLabelChanged(),
				self.wallet_EventName_walletLabelChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_transactionsChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_transactionsChanged(),
				self.wallet_EventName_transactionsChanged_listenerFunction
			)
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
	//
	//
	// Internal - Runtime - Accessors - Child elements - Metrics
	//
	//
	_idPrefix()
	{
		const self = this
		//
		return self.constructor.name + "_" + self.View_UUID()
	}
	//
	//
	// Internal - Runtime - Accessors - Child elements - Transactions elements
	//
	idForChild_transactionsUL()
	{
		const self = this
		//
		return self._idPrefix() + "_" + "transactionsUL"
	}
	DOMSelected_transactionsUL()
	{
		const self = this
		const layer = self.layer.querySelector(`ul#${ self.idForChild_transactionsUL() }`)
		//
		return layer
	}
	classForChild_transactionsLI()
	{
		const self = this
		//
		return self._idPrefix() + "_" + "transactionsLI"
	}
	DOMSelected_transactionsLIs()
	{
		const self = this
		const layers = self.layer.querySelectorAll(`li.${ self.classForChild_transactionsLI() }`) // we can use a class here cause the class is namespaced to self via prefix's self.View_UUID()
		//
		return layers
	}
	//
	//
	//
	// Internal - Runtime - Accessors - Child elements - Delete btn
	//
	//
	idForChild_deleteWalletWithIDLayer()
	{
		const self = this
		//
		return self._idPrefix() + "_" + "idForChild_deleteWalletWithIDLayer"
	}
	new_htmlStringForChild_deleteWalletWithIDLayer()
	{
		const self = this
		const htmlString = `<a id="${self.idForChild_deleteWalletWithIDLayer()}" href="#">Delete Wallet</a>`
		//
		return htmlString
	}
	DOMSelected_deleteWalletWithIDLayer()
	{
		const self = this
		const layer = self.layer.querySelector(`a#${ self.idForChild_deleteWalletWithIDLayer() }`)
		//
		return layer
	}
	//
	//
	// Runtime - Imperatives - UI Configuration
	//
	_configureUIWithWallet__accountInfo()
	{
		const self = this
		const wallet = self.wallet
		var htmlString = ''
		{
			if (wallet.didFailToInitialize_flag !== true && wallet.didFailToBoot_flag !== true) { // unlikely, but possible
				{ // header
					htmlString += `<h3>${wallet.walletLabel}</h3>`
					htmlString += `<p>Swatch: ${wallet.swatch}</p>`
					if (wallet.HasEverFetched_accountInfo() === false) {
						htmlString += `<p>Balance: Loading…</p>`
						htmlString += `<p>Locked balance: Loading…</P`
					} else {
						htmlString += `<p>Balance: ${wallet.Balance_FormattedString()} ${wallet.HumanReadable_walletCurrency()}</p>`
						htmlString += `<p>Locked balance: ${wallet.LockedBalance_FormattedString()} ${wallet.HumanReadable_walletCurrency()}</p>`
					}
				}
				{ // buttons
					htmlString += self.new_htmlStringForChild_deleteWalletWithIDLayer()
				}
				{ // info
					htmlString += `<h4>Wallet Info</h4>`
					htmlString += `<p>Address: ${wallet.public_address}</p>`
					htmlString += `<h5>Secret keys:</h5>`
					htmlString += `<p>Secret Seed: ${wallet.mnemonicString}</p>`
					htmlString += `<p>View key: ${wallet.private_keys.view}</p>`
					htmlString += `<p>Spend key: ${wallet.private_keys.spend}</p>`
				}
			} else { // failed to initialize
				{ // header
					htmlString += 
						`<h4>Error: Couldn't unlock this wallet.</h4>`
						+ `<p>Please report this issue to us via Support. To repair this wallet and continue, please delete the wallet and re-import it:</p>`
				}
				{ // buttons
					htmlString += self.new_htmlStringForChild_deleteWalletWithIDLayer()
				}
			}
		}
		//
		// TODO: Rebuild this without using html (w/element objs) and eliminate the DOMSelected_ stuff
		//
		self.layer_accountInfo.innerHTML = htmlString
		{ // setup and observations
			{ // buttons
				{ // delete button
					const layer = self.DOMSelected_deleteWalletWithIDLayer()
					if (layer && typeof layer !== 'undefined') {
						layer.addEventListener(
							"click",
							function(e)
							{
								e.preventDefault()
								self.deleteWallet()
								//
								return false
							}
						)
					}
				}				
			}
		}
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
			if (self.current_transactionDetailsView !== null) {
				self.current_transactionDetailsView.TearDown() // we're assuming that on VDA if we have one of these it means we can tear it down
				self.current_transactionDetailsView = null // must zero again and should free
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
