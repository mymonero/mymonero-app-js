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
class WalletCellContentsView extends View
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
		self.layer.style.wordBreak = "break-all" // to get the text to wrap
		//
		self.setup_layers_accountInfo()
	}
	setup_layers_accountInfo()
	{
		const self = this
		const layer = document.createElement("div")
		layer.className = "accountInfo"
		self.layer_accountInfo = layer
		self.layer.appendChild(layer)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		super.TearDown()
		//
		const self = this
		self.stopObserving_wallet()
		self.wallet = null
	}
	//
	//
	// Internal - Teardown/Recycling
	//
	PrepareForReuse()
	{
		const self = this
		//
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
		if (doesListenerFunctionExist(self.wallet_EventName_walletLabelChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletLabelChanged(),
				self.wallet_EventName_walletLabelChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_walletSwatchChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_walletSwatchChanged(),
				self.wallet_EventName_walletSwatchChanged_listenerFunction
			)
		}
		if (doesListenerFunctionExist(self.wallet_EventName_balanceChanged_listenerFunction) === true) {
			self.wallet.removeListener(
				self.wallet.EventName_balanceChanged(),
				self.wallet_EventName_balanceChanged_listenerFunction
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
		return self.constructor.name + "_" + self.View_UUID() // to make it unique, as this is a list-cell
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
	ConfigureWithRecord(wallet)
	{
		const self = this
		if (typeof self.wallet !== 'undefined') {
			self.PrepareForReuse()
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
		self._configureUIWithWallet__color()
	}
	_configureUIWithWallet__accountInfo()
	{
		const self = this
		const wallet = self.wallet
		var htmlString = ''
		{
			if (wallet.didFailToInitialize_flag !== true && wallet.didFailToBoot_flag !== true) {
				{ // header
					htmlString += `<h3>${wallet.walletLabel}</h3>`
					if (wallet.HasEverFetched_accountInfo() === false) {
						htmlString += `<p>Loading…</p>`
					} else {
						htmlString += "<p>"
						htmlString += `${wallet.Balance_FormattedString()} ${wallet.HumanReadable_walletCurrency()}`
						if (wallet.HasLockedFunds() === true) {
							htmlString += ` (${wallet.LockedBalance_FormattedString()} ${wallet.HumanReadable_walletCurrency()} locked)`
						}
						htmlString += "</p>"
					}
				}
			} else { // unlikely but possible: failed to initialize
				htmlString += 
					`<h4>Error: Couldn't unlock wallet.</h4>`
					+ `<p>Please report this to us via Support. Please delete and re-import it:</p>`
				htmlString += self.new_htmlStringForChild_deleteWalletWithIDLayer()
			}
		}
		{
			self.layer_accountInfo.innerHTML = htmlString
		}
		{ // setup and observations
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
	_configureUIWithWallet__color()
	{
		const self = this
		console.log("TODO: configure wallet icon with color…", self.wallet.swatch)
	}
	//
	//
	// Internal - Runtime - Imperatives - Wallet operations
	deleteWallet()
	{
		const self = this
		self.context.walletsListController.WhenBooted_DeleteRecordWithId(
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
		// wallet label
		self.wallet_EventName_walletLabelChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__accountInfo()
		}
		self.wallet.on(
			self.wallet.EventName_walletLabelChanged(),
			self.wallet_EventName_walletLabelChanged_listenerFunction
		)
		// wallet swatch
		self.wallet_EventName_walletSwatchChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__color()
		}
		self.wallet.on(
			self.wallet.EventName_walletSwatchChanged(),
			self.wallet_EventName_walletSwatchChanged_listenerFunction
		)
		// balance
		self.wallet_EventName_balanceChanged_listenerFunction = function()
		{
			self._configureUIWithWallet__accountInfo()
		}
		self.wallet.on(
			self.wallet.EventName_balanceChanged(),
			self.wallet_EventName_balanceChanged_listenerFunction
		)
	}
}
module.exports = WalletCellContentsView
