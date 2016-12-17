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
//
class WalletsListCellView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.setup_layers()
	}
	setup_views()
	{
		const self = this
	}
	setup_layers()
	{
		const self = this
		//
		self.layer.style.border = "1px solid #eee"
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
		layer.style.borderTop = "1px solid #ccc"
		//
		self.layer_transactions = layer
		self.layer.appendChild(layer)
	}
	//
	//
	// Internal - Teardown/Recycling
	//
	prepareForReuse()
	{
		const self = this
		self.stopObserving_wallet()
		self.wallet = null
	}
	stopObserving_wallet()
	{
		const self = this
		if (typeof self.wallet === 'undefined' || !self.wallet) {
			return
		}
		function doesListenerFunctionExist(fn)
		{
			if (typeof fn !== 'undefined' && fn !== null) {
				return true
			}
			return false
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.remoteListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_transactionsChanged_listenerFunction) === true) {
			self.wallet.remoteListener(
				self.wallet.EventName_transactionsChanged(),
				self.wallet_EventName_transactionsChanged_listenerFunction
			)
		}
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
		return "WalletsListCellView" + "_" + self.wallet._id // to make it unique as this is a list-cell
	}
	//
	//
	// Internal - Runtime - Accessors - Child elements - Delete btn
	//
	//
	idForChild_deleteWalletWithIDLayer()
	{
		const self = this
		if (typeof self.wallet._id === 'undefined' || !self.wallet._id) {
			throw "idForChild_deleteWalletWithIDLayer called but nil self.wallet._id"
		}
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
	// Interface - Runtime - Imperatives - State/UI Configuration
	//
	ConfigureWith_wallet(wallet)
	{
		const self = this
		if (typeof self.wallet !== 'undefined') {
			self.prepareForReuse()
		}
		self.wallet = wallet
		self._configureUIWithWallet()
		self.startObserving_wallet()
	}
	//
	//
	// Internal - Runtime - Imperatives - State/UI Configuration
	//
	_configureUIWithWallet()
	{
		const self = this
		self._configureUIWithWallet__accountInfo()
		self._configureUIWithWallet__transactions()
	}
	_configureUIWithWallet__accountInfo()
	{
		const self = this
		const wallet = self.wallet
		var htmlString = ''
		{
			if (wallet.didFailToInitialize_flag !== true && wallet.didFailToBoot_flag !== true) { // unlikely, but possible
				{ // header
					htmlString += `<h3>${wallet.walletLabel}</h3>`
					if (wallet.HasEverFetched_accountInfo() === false) {
						htmlString += `<p>Balance: Loading…</p>`
						htmlString += `<p>Locked balance: Loading…</P`
					} else {
						htmlString += `<p>Balance: ${wallet.Balance()} ${wallet.HumanReadable_walletCurrency()}</p>`
						htmlString += `<p>Locked balance: ${wallet.LockedBalance()} ${wallet.HumanReadable_walletCurrency()}</p>`
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
		self.layer_accountInfo.innerHTML = htmlString
		{ // setup and observations
			{ // buttons
				{ // delete button
					const layer = self.DOMSelected_deleteWalletWithIDLayer()
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
	_configureUIWithWallet__transactions()
	{
		const self = this
		const wallet = self.wallet
		const innerHTMLString = ""
		{
			if (wallet.didFailToInitialize_flag !== true && wallet.didFailToBoot_flag !== true) { // the usual scenario
				var ulInnerHTMLString = ""
				const stateCachedTransactions = wallet.New_StateCachedTransactions()
				stateCachedTransactions.forEach(
					function(tx, i)
					{
						var liInnerHTMLString = ""
						liInnerHTMLString += `<p>${tx.approx_float_amount} ${wallet.wallet_currency}</p>`
						if (tx.isConfirmed === false) {
							liInnerHTMLString += `<p>(unconfirmed)</p>`
						}
						if (tx.isUnlocked === false) {
							liInnerHTMLString += `<p>(locked) ${tx.lockedReason}</p>`
						}
						liInnerHTMLString += `<p>${tx.timestamp.toString()}</p>`
						liInnerHTMLString += `<p>Mixin: ${tx.mixin}</p>`
						liInnerHTMLString += `<p>Hash: ${tx.hash}</p>`
						liInnerHTMLString += `<p>Payment ID: ${tx.payment_id || "N/A"}</p>`
						//
						ulInnerHTMLString += `<li>${liInnerHTMLString}</li>`
					}
				)
				// TODO: optimize this by maybe not using innerHTML?
				innerHTMLString += "<h3>Transactions</h3>"
				if (wallet.HasEverFetched_transactions() === false) {
					innerHTMLString += "<p>Loading…</p>" 
				} else {
					innerHTMLString += `<ul>${ulInnerHTMLString}</ul>`
				}		
			} else { // otherwise, it errored, which gets handled in _configureUIWithWallet__accountInfo			
			}
		}
		self.layer_transactions.innerHTML = innerHTMLString
	}
	//
	//
	// Internal - Runtime - Imperatives - Wallet operations
	deleteWallet()
	{
		const self = this
		self.context.walletsListController.WhenBooted_DeleteWalletWithId(
			self.wallet._id,
			function(err)
			{
				if (err) {
					console.error("Failed to delete wallet")
					return
				}
				// this change will be picked up by the list change listener
			}
		)
	}
	//
	//
	//
	// Internal - Runtime - Imperatives - Observation
	//
	startObserving_wallet()
	{
		const self = this
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "wallet undefined in start observing"
			return
		}
		// here, we're going to store a bunch of functions as instance properties
		// because if we need to stopObserving we need to have access to the listener fns
		//
		// account info updated
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
	// Internal - Runtime - Delegation - Event handlers - Wallet
	//
	wallet_EventName_balanceChanged()
	{
		const self = this
		self._configureUIWithWallet__accountInfo()
	}
	wallet_EventName_transactionsChanged()
	{
		const self = this
		self._configureUIWithWallet__transactions()
	}
}
module.exports = WalletsListCellView
