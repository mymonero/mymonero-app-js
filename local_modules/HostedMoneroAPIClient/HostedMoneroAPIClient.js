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

"use strict"
//
const async = require('async')
//
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger // important: grab defined export
const monero_config = require('../monero_utils/monero_config')
const monero_keyImage_cache_utils = require('../monero_utils/monero_keyImage_cache_utils')
//
const config__MyMonero = require('./config__MyMonero')
//
class HostedMoneroAPIClient
{
	//
	// Lifecycle - Initialization
	constructor(options, context)
	{
		var self = this
		self.options = options
		self.context = context
		//
		self.responseParser = options.responseParser
		if (!self.responseParser) {
			throw `${self.constructor.name} requires an options.responseParser`
		}
		self.request = options.request_conformant_module
		if (!self.request) {
			throw `${self.constructor.name} requires an options.request_conformant_module such as require('request' / 'xhr')`
		}
		//
		self.setup()
	}
	setup()
	{
		var self = this
		{ // options
			self.scheme = config__MyMonero.API__protocolScheme
			self.host = config__MyMonero.API__hostDomainPlusPortPlusSlash // to be exposed via app Preferences
			self.baseURL = self.scheme + "://" + self.host
			//
			self.appUserAgent_product = self.options.appUserAgent_product
			if (!self.appUserAgent_product) {
				throw `${self.constructor.name} requires options.appUserAgent_product`
			}
			self.appUserAgent_version = self.options.appUserAgent_version
			if (!self.appUserAgent_version) {
				throw `${self.constructor.name} requires options.appUserAgent_version`
			}
		}
		{ // derived caches
			self.txChargeRatio = config__MyMonero.HostingServiceFee_txFeeRatioOfNetworkFee  // Service fee relative to tx fee (e.g. 0.5 => 50%)
		}
	}
	//
	// Runtime - Accessors - Public - Metrics/lookups/transforms
	HostingServiceChargeFor_transactionWithNetworkFee(networkFee)
	{
		const self = this
		networkFee = new JSBigInt(networkFee)
		// amount * txChargeRatio
		return networkFee.divide(1 / self.txChargeRatio)
	}
	HostingServiceFeeDepositAddress()
	{ // -> String
		return config__MyMonero.HostingServiceFee_depositAddress
	}
	//
	// Runtime - Accessors - Private - Requests
	_new_parameters_forWalletRequest(address, view_key__private)
	{
		return {
			address: address,
			view_key: view_key__private
		}
	}
	//
	// Runtime - Imperatives - Private
	_API_doRequest_returningRequestHandle(endpointPath, parameters, fn)
	{ // fn: (err?, data?) -> new Request
		const self = this
		//
		parameters = parameters || {}
		// setting these on params instead of as header field User-Agent so as to retain all info found in User-Agent, such as platform… and these are set so server has option to control delivery
		parameters.app_name = self.appUserAgent_product 
		parameters.app_version = self.appUserAgent_version
		//
		const completeURL = self.baseURL + endpointPath
		console.log("📡  " + completeURL)
		//
		const request_options =
		{
			method: "POST", // maybe break this out
			url: completeURL,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			json: parameters,
			useXDR: true, // CORS
			withCredentials: true // CORS
		}
		const request_handlerFn = function(err_orProgressEvent, res, body)
		{
			// err appears to actually be a ProgressEvent
			var err = null
			const statusCode = typeof res !== 'undefined' ? res.statusCode : -1
			if (statusCode == 0 || statusCode == -1) { // we'll treat 0 as a lack of internet connection.. unless there's a better way to make use of err_orProgressEvent which is apparently going to be typeof ProgressEvent here
				err = new Error("Connection Failure")
			} else if (statusCode !== 200) {
				const body_Error = body && typeof body == 'object' ? body.Error : undefined
				const statusMessage = res && res.statusMessage ? res.statusMessage : undefined
				if (typeof body_Error !== 'undefined' && body_Error) {
					err = new Error(body_Error)
				} else if (typeof statusMessage !== 'undefined' && statusMessage) {
					err = new Error(statusMessage)
				} else {
					err = new Error("Unknown " + statusCode + " error")
				}
			}
			if (err) {
				console.error("❌  " + err);
				// console.error("Body:", body)
				fn(err, null)
				return
			}
			var json;
			if (typeof body === 'string') {
				try {
					json = JSON.parse(body);
				} catch (e) {
					console.error("❌  HostedMoneroAPIClient Error: Unable to parse json with exception:", e, "\nbody:", body);
					fn(e, null)
				}
			} else {
				json = body
			}
			console.log("✅  " + completeURL + " " + statusCode)
			fn(null, json)
		}
		const requestHandle = self.request(request_options, request_handlerFn)
		//
		return requestHandle
	}
	//
	// Runtime - Accessors - Public - Requests
	LogIn(address, view_key__private, fn)
	{ // fn: (err?, new_address?) -> RequestHandle
		const self = this
		const endpointPath = "login"
		const parameters = self._new_parameters_forWalletRequest(address, view_key__private)
		parameters.create_account = true
		//
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			const new_address = data.new_address
			// console.log("data from login: ", data)
			// TODO? parse anything else?
			//
			fn(null, new_address)
		}
		return requestHandle
	}
	//
	// Syncing
	AddressInfo_returningRequestHandle(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)  // -> RequestHandle
	{
		const self = this
		const endpointPath = "get_address_info"
		const parameters = self._new_parameters_forWalletRequest(address, view_key__private)
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			self.responseParser.Parsed_AddressInfo(
				data,
				address,
				view_key__private,
				spend_key__public,
				spend_key__private,
				function(err, returnValuesByKey)
				{
					if (err) {
						fn(err)
						return
					}
					var total_received_JSBigInt;
					const total_received_String = returnValuesByKey.total_received_String
					if (total_received_String) {
						total_received_JSBigInt = new JSBigInt(total_received_String)
					} else {
						total_received_JSBigInt = new JSBigInt(0)
					}
					//
					var locked_balance_JSBigInt;
					const locked_balance_String = returnValuesByKey.locked_balance_String
					if (locked_balance_String) {
						locked_balance_JSBigInt = new JSBigInt(locked_balance_String)
					} else {
						locked_balance_JSBigInt = new JSBigInt(0)
					}
					//
					var total_sent_JSBigInt;
					const total_sent_String = returnValuesByKey.total_sent_String
					if (total_sent_String) {
						total_sent_JSBigInt = new JSBigInt(total_sent_String)
					} else {
						total_sent_JSBigInt = new JSBigInt(0)
					}
					fn(
						err,
						//
						total_received_JSBigInt,
						locked_balance_JSBigInt,
						total_sent_JSBigInt,
						//
						returnValuesByKey.spent_outputs,
						returnValuesByKey.account_scanned_tx_height,
						returnValuesByKey.account_scanned_block_height,
						returnValuesByKey.account_scan_start_height,
						returnValuesByKey.transaction_height,
						returnValuesByKey.blockchain_height
					)
				}
			)
		}
		return requestHandle
	}
	AddressTransactions_returningRequestHandle(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	) // -> RequestHandle
	{
		const self = this
		const endpointPath = "get_address_txs"
		const parameters = self._new_parameters_forWalletRequest(address, view_key__private)
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__parseAndCallBack(data)
			}
		)
		function __parseAndCallBack(data)
		{
			self.responseParser.Parsed_AddressTransactions(
				data,
				address,
				view_key__private,
				spend_key__public,
				spend_key__private,
				function(err, returnValuesByKey)
				{
					if (err) {
						fn(err)
						return
					}
					//
					const transactions = returnValuesByKey.serialized_transactions
					for (let transaction of transactions) {
						transaction.amount = new JSBigInt(transaction.amount)
						if (typeof transaction.total_sent !== 'undefined' && transaction.total_sent !== null) {
							transaction.total_sent = new JSBigInt(transaction.total_sent)
						}
						transaction.timestamp = new Date(transaction.timestamp)
					}
					//
					fn(
						err,
						//
						returnValuesByKey.account_scanned_height,
						returnValuesByKey.account_scanned_block_height,
						returnValuesByKey.account_scan_start_height,
						returnValuesByKey.transaction_height,
						returnValuesByKey.blockchain_height,
						//
						transactions
					)
				}
			)
		}
		return requestHandle
	}
	//
	// Getting wallet txs import info
	ImportRequestInfoAndStatus(
		address,
		view_key__private,
		fn
	) // -> RequestHandle
	{
		const self = this
		const endpointPath = "import_wallet_request"
		const parameters = 
		{
			address: address,
			view_key: view_key__private
		}
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			const payment_id = data.payment_id;
			const payment_address = data.payment_address;
			const import_fee__JSBigInt = new JSBigInt(data.import_fee);
			const feeReceiptStatus = data.status;
			fn(
				null, 
				payment_id, 
				payment_address, 
				import_fee__JSBigInt, 
				feeReceiptStatus
			)
		}
		return requestHandle
	}
	
	//
	// Getting outputs for sending funds
	UnspentOuts(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		mixinNumber,
		fn
	) // -> RequestHandle
	{
		const self = this
		mixinNumber = parseInt(mixinNumber) // jic
		//
		const parameters =
		{
			address: address,
			view_key: view_key__private,
			amount: '0',
			mixin: mixinNumber,
			use_dust: mixinNumber === 0, // Use dust outputs only when we are using no mixins
			dust_threshold: monero_config.dustThreshold.toString()
		}
		const endpointPath = 'get_unspent_outs'
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			self.responseParser.Parsed_UnspentOuts(
				data,
				address,
				view_key__private,
				spend_key__public,
				spend_key__private,
				function(err, returnValuesByKey)
				{
					if (err) {
						fn(err)
						return
					}
					fn(
						err, // no error
						returnValuesByKey.unspentOutputs,
						returnValuesByKey.unusedOuts
					)
				}
			)
		}
		return requestHandle
	}
	RandomOuts(
		using_outs,
		mixinNumber,
		fn
	) // -> RequestHandle
	{
		const self = this
		//
		mixinNumber = parseInt(mixinNumber)
		if (mixinNumber < 0 || isNaN(mixinNumber)) {
			const errStr = "Invalid mixin - must be >= 0"
			const err = new Error(errStr)
			fn(err)
			return
		}
		//
		var amounts = [];
		for (var l = 0; l < using_outs.length; l++) {
			amounts.push(using_outs[l].rct ? "0" : using_outs[l].amount.toString())
		}
		//
		var parameters =
		{
			amounts: amounts,
			count: mixinNumber + 1 // Add one to mixin so we can skip real output key if necessary
		}
		const endpointPath = 'get_random_outs'
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			// console.log("debug: info: random outs: data", data)
			const amount_outs = data.amount_outs
			// yield
			fn(
				null, // no error
				amount_outs
			)
		}
		return requestHandle
	}
	//
	// Resolving OA addresses
	TXTRecords(
		domain,
		fn
	) // -> RequestHandle
	{
		const self = this
		//
		const endpointPath = 'get_txt_records'
		const parameters =
		{
			domain: domain
		}
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			// console.log("debug: info: txt records: data", data)
			const records = data.records
			const dnssec_used = data.dnssec_used
			const secured = data.secured
			const dnssec_fail_reason = data.dnssec_fail_reason
			//
			fn(
				null, // no error
				records,
				dnssec_used,
				secured,
				dnssec_fail_reason
			)
		}
		return requestHandle
	}
	//
	// Runtime - Imperatives - Public - Sending funds
	SubmitSerializedSignedTransaction(
		address,
		view_key__private,
		serializedSignedTx,
		fn // (err?) -> RequestHandle
	)
	{
		const self = this
		// just a debug feature:
		if (self.context.HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess === true) {
			if (self.context.isDebug === true) {
				console.warn("⚠️  WARNING: Mocking that SubmitSerializedSignedTransaction returned a success response w/o having hit the server.")
				fn(null)
				return
			} else {
				throw `[${self.constructor.name}/SubmitSerializedSignedTransaction]: context.HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess was true despite isDebug not being true. Set back to false for production build.`
			}
		}
		// actual implementation:
		const endpointPath = 'submit_raw_tx'
		const parameters =
		{
			address: address,
			view_key: view_key__private,
			tx: serializedSignedTx
		}
		const requestHandle = self._API_doRequest_returningRequestHandle(
			endpointPath,
			parameters,
			function(err, data)
			{
				if (err) {
					fn(err)
					return
				}
				__proceedTo_parseAndCallBack(data)
			}
		)
		function __proceedTo_parseAndCallBack(data)
		{
			// console.log("debug: info: submit_raw_tx: data", data)
			fn(null)
		}
		return requestHandle
	}
}
module.exports = HostedMoneroAPIClient
