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
const EventEmitter = require('events')
//
class WalletHostPollingController
{
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Setup
	
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		// This controller is to be instantiated and owned by a HostedWallet instance
		self.wallet = self.options.wallet
		if (typeof self.wallet === 'undefined' || self.wallet === null) {
			throw "wallet must not be nil"
		}
		//
		//
		self.setup()
	}
	setup()
	{
		const self = this
		self.startPolling() // we're just immediately going to jump into the runtime - so only instantiate self when you're ready to do this
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Teardown
	
	TearDown()
	{ // this is public and must be called manually by wallet
		const self = this
		console.log("TODO: terminate all polling as well as existing requests")
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Events
	
	EventName_didReceive_accountInfo()
	{
		return "EventName_didReceive_accountInfo"
	}
	EventName_didReceive_transactions()
	{
		return "EventName_didReceive_transactions"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Polling - Initiation/teardown

	startPolling()
	{
		const self = this
		function __callAllSyncFunctions()
		{
			self._fetch_accountInfo()
			self._fetch_transactionHistory()
		}
		
		// TODO: this all needs to be fixed up with a way to cancel the timer
		
		
		//
		// kick off synchronizations
		setTimeout(function()
		{
			__callAllSyncFunctions()
		})
		//
		// and kick off the polling call to pull latest updates
		const syncPollingInterval = 10 * 1000 // ms
		// it would be cool to change the sync polling interval to faster while any transactions are pending confirmation, then dial it back while passively waiting
		setInterval(function()
		{
			__callAllSyncFunctions()
		}, syncPollingInterval)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Requests




	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Account info & tx history fetch/sync

	_fetch_accountInfo()
	{
		var __debug_fnName = "_fetch_accountInfo"
		const self = this
		const wallet = self.wallet
		const fn = function(errOrNil)
		{
			if (err) {
				// TODO: how to handle this? we'll retry soon enough
			}
			// success
		}
		//
		if (wallet.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof wallet.public_address === 'undefined' && wallet.public_address === null || wallet.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof wallet.private_keys === 'undefined' && wallet.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressInfo(
			wallet.public_address,
			wallet.private_keys.view,
			wallet.public_keys.spend,
			wallet.private_keys.spend,
			function(
				err,
				total_received,
				locked_balance,
				total_sent,
				spent_outputs,
				account_scanned_tx_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height
			)
			{
				if (err) {
					console.error(err.toString())
					fn(err)
					return
				}
				//
				// i figure it should be okay to directly call this as this is 
				// an intra-module rather than inter-module call; a protocol would
				// be used to enforce this at compile-time
				wallet._WalletHostPollingController_didFetch_accountInfo(
					total_received,
					locked_balance,
					total_sent,
					spent_outputs,
					account_scanned_tx_height,
					account_scanned_block_height,
					account_scan_start_height,
					transaction_height,
					blockchain_height
				)
			}
		)
	}
	_fetch_transactionHistory()
	{ // fn: (err?) -> Void
		var __debug_fnName = "_fetch_transactionHistory"
		const self = this
		const wallet = self.wallet
		const fn = function(errOrNil)
		{
			if (err) {
				// TODO: how to handle this? we'll retry soon enough
			}
			// success
		}
		//
		if (wallet.isLoggedIn !== true) {
			const errStr = "❌  Unable to " + __debug_fnName + " as isLoggedIn !== true"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof wallet.public_address === 'undefined' && wallet.public_address === null || wallet.public_address === '') {
			const errStr = "❌  Unable to " + __debug_fnName + " as no public_address"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		if (typeof wallet.private_keys === 'undefined' && wallet.private_keys === null) {
			const errStr = "❌  Unable to " + __debug_fnName + " as no private_keys"
			console.error(errStr)
			const err = new Error(errStr)
			fn(err)
			return
		}
		self.context.hostedMoneroAPIClient.AddressTransactions(
			wallet.public_address,
			wallet.private_keys.view,
			wallet.public_keys.spend,
			wallet.private_keys.spend,
			function(
				err,
				account_scanned_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height,
				transactions
			)
			{
				if (err) {
					console.error(err)
					fn(err)
					return
				}
				//
				wallet._WalletHostPollingController_didFetch_transactionHistory(
					account_scanned_height,
					account_scanned_block_height,
					account_scan_start_height,
					transaction_height,
					blockchain_height,
					transactions
				)
			}
		)
	}
}
module.exports = WalletHostPollingController