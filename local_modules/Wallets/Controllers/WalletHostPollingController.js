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
		self._setup_startPolling() // we're just immediately going to jump into the runtime - so only instantiate self when you're ready to do this
	}
	_setup_startPolling()
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
		setImmediate(function()
		{
			__callAllSyncFunctions()
		})
		//
		// and kick off the polling call to pull latest updates
		const syncPollingInterval = 30 * 1000 // ms
		// it would be cool to change the sync polling interval to faster while any transactions are pending confirmation, then dial it back while passively waiting
		self.intervalTimeout = setInterval(function()
		{
			__callAllSyncFunctions()
		}, syncPollingInterval)
	}
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Teardown
	
	TearDown()
	{ // this is public and must be called manually by wallet
		const self = this
		console.log(`♻️  Tearing down ${self.constructor.name}`)
		self._tearDown_stopTimers()
		self._tearDown_abortAndFreeRequests()
	}
	_tearDown_stopTimers()
	{
		const self = this
		if (typeof self.intervalTimeout === 'undefined' || self.intervalTimeout === null) {
			throw "_tearDown_stopTimers called but self.intervalTimeout already nil"
		}
		// console.log("💬  Clearing polling intervalTimeout.")
		clearInterval(self.intervalTimeout)
		self.intervalTimeout = null
	}
	_tearDown_abortAndFreeRequests()
	{
		const self = this
		{ // acct info
			let req = self.requestHandle_for_accountInfo
			if (typeof req !== 'undefined' && req !== null) {
				console.log("💬  Aborting running acct info request")
				req.abort()
			}
			self.requestHandle_for_accountInfo = null
		}
		{ // acct info
			let req = self.requestHandle_for_transactions
			if (typeof req !== 'undefined' && req !== null) {
				console.log("💬  Aborting running transactions history request")
				req.abort()
			}
			self.requestHandle_for_transactions = null
		}
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
	// Runtime - Imperatives - Private - Requests

	_fetch_accountInfo()
	{ // -> HostedMoneroAPIClient_RequestHandle
		var __debug_fnName = "_fetch_accountInfo"
		const self = this
		const wallet = self.wallet
		const fn = function(errOrNil)
		{
			if (errOrNil) {
				// TODO: how to handle this? we'll retry soon enough
			}
			// success
		}
		//
		if (typeof self.requestHandle_for_accountInfo !== 'undefined' && self.requestHandle_for_accountInfo !== null) {
			const warnStr = "⚠️  _fetch_accountInfo called but request already taking place. Bailing"
			console.warn(warnStr)
			fn() // not an error we'd necessarily want to bubble
			return
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
		const requestHandle = self.context.hostedMoneroAPIClient.AddressInfo_returningRequestHandle(
			wallet.keyImage_cache,
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
				blockchain_height,
				ratesBySymbol
			)
			{
				// immediately unlock this request fetch
				self.requestHandle_for_accountInfo = null 
				//
				if (err) { // already logged
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
					blockchain_height,
					ratesBySymbol
				)
			}
		)
		self.requestHandle_for_accountInfo = requestHandle
	}
	_fetch_transactionHistory()
	{ // fn: (err?) -> HostedMoneroAPIClient_RequestHandle
		var __debug_fnName = "_fetch_transactionHistory"
		const self = this
		const wallet = self.wallet
		const fn = function(errOrNil)
		{
			if (errOrNil) {
				// TODO: how to handle this? we'll retry soon enough
			}
			// success
		}
		//
		if (typeof self.requestHandle_for_transactions !== 'undefined' && self.requestHandle_for_transactions !== null) {
			const warnStr = "⚠️  _fetch_transactionHistory called but request already taking place. Bailing"
			console.warn(warnStr)
			fn() // not an error we'd necessarily want to bubble
			return
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
		const requestHandle = self.context.hostedMoneroAPIClient.AddressTransactions_returningRequestHandle(
			wallet.keyImage_cache,
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
				// immediately unlock this request fetch
				self.requestHandle_for_transactions = null 
				//
				if (err) { // already logged
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
		self.requestHandle_for_transactions = requestHandle
	}
}
module.exports = WalletHostPollingController