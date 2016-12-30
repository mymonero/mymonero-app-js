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
const request = require(typeof window !== 'undefined' ? 'xhr' : 'request') // 'request' to support tests
const async = require('async')
//
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger // important: grab defined export
const monero_config = require('../monero_utils/monero_config')
const monero_utils = require('../monero_utils/monero_cryptonote_utils_instance')
//
const TransactionKeyImageCache = require('./TransactionKeyImageCache')
const config__MyMonero = require('./config__MyMonero')
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class HostedMoneroAPIClient
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		var self = this
		self.options = options
		self.context = context		
		//
		self.scheme = config__MyMonero.API__protocolScheme
		self.host = config__MyMonero.API__hostDomainPlusPortPlusSlash // later will be configurable
		self.baseURL = self.scheme + "://" + self.host
		//
		self.txChargeRatio = config__MyMonero.HostingServiceFee_txFeeRatioOfNetworkFee  // Service fee relative to tx fee (e.g. 0.5 => 50%)
		//
		self.setup()
	}
	setup()
	{
		var self = this
	}


	////////////////////////////////////////////////////////////////////////////////
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


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public - Requests

	LogIn(address, view_key__private, fn)
	{ // fn: (err?, new_address?)
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
	}
	//
	// Syncing
	AddressInfo_returningRequestHandle(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)
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
			const total_received = new JSBigInt(data.total_received || 0);
			const locked_balance = new JSBigInt(data.locked_funds || 0);
			var total_sent = new JSBigInt(data.total_sent || 0) // will be modified in place
			//
			const account_scanned_tx_height = data.scanned_height || 0;
			const account_scanned_block_height = data.scanned_block_height || 0;
			const account_scan_start_height = data.start_height || 0;
			const transaction_height = data.transaction_height || 0;
			const blockchain_height = data.blockchain_height || 0;
			const spent_outputs = data.spent_outputs || []
			//
			for (let spent_output of spent_outputs) {
				var key_image = TransactionKeyImageCache.Lazy_KeyImage(
					spent_output.tx_pub_key,
					spent_output.out_index,
					address,
					view_key__private,
					spend_key__public,
					spend_key__private
				)
				if (spent_output.key_image !== key_image) {
					// console.log('💬  Output used as mixin (' + spent_output.key_image + '/' + key_image + ')')
					total_sent = new JSBigInt(total_sent).subtract(spent_output.amount)
				}
			}
			// yield
			fn(
				null,
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
		//
		return requestHandle
	}
	AddressTransactions_returningRequestHandle(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn
	)
	{
		const self = this
		const endpointPath = "get_address_txs"
		const parameters = self._new_parameters_forWalletRequest(address, view_key__private)
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
				__parseAndCallBack(data)
			}
		)
		function __parseAndCallBack(data)
		{
			const account_scanned_height = data.scanned_height || 0
			const account_scanned_block_height = data.scanned_block_height || 0
			const account_scan_start_height = data.start_height || 0
			const transaction_height = data.transaction_height || 0
			const blockchain_height = data.blockchain_height || 0
			//
			const transactions = data.transactions || []
			//
			for (let i = 0; i < transactions.length; ++i) {
				if ((transactions[i].spent_outputs || []).length > 0) {
					for (var j = 0; j < transactions[i].spent_outputs.length; ++j) {
						var key_image = TransactionKeyImageCache.Lazy_KeyImage(
							transactions[i].spent_outputs[j].tx_pub_key,
							transactions[i].spent_outputs[j].out_index,
							address,
							view_key__private,
							spend_key__public,
							spend_key__private
						)
						if (transactions[i].spent_outputs[j].key_image !== key_image) {
							// console.log('Output used as mixin, ignoring (' + transactions[i].spent_outputs[j].key_image + '/' + key_image + ')')
							transactions[i].total_sent = new JSBigInt(transactions[i].total_sent).subtract(transactions[i].spent_outputs[j].amount).toString()
							transactions[i].spent_outputs.splice(j, 1)
							j--
						}
					}
				}
				if (new JSBigInt(transactions[i].total_received || 0).add(transactions[i].total_sent || 0).compare(0) <= 0) {
					transactions.splice(i, 1)
					i--
					continue
				}
				transactions[i].amount = new JSBigInt(transactions[i].total_received || 0).subtract(transactions[i].total_sent || 0).toString()
				transactions[i].approx_float_amount = parseFloat(monero_utils.formatMoney(transactions[i].amount))
				transactions[i].timestamp = new Date(transactions[i].timestamp)
			}
			transactions.sort(function(a, b)
			{
				return b.id - a.id
			})
			//
			fn(
				null, // no error
				account_scanned_height,
				account_scanned_block_height,
				account_scan_start_height,
				transaction_height,
				blockchain_height,
				transactions
			)
		}
		//
		return requestHandle
	}
	//
	// Sending coins
	UnspentOuts(
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		mixinNumber,
		fn
	)
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
			// console.log("debug: info: unspentouts: data", data)

			const data_outputs = data.outputs
			const finalized_unspentOutputs = data.outputs || [] // to finalize:
			for (var i = 0; i < finalized_unspentOutputs.length; i++) {
				const unspent_output = finalized_unspentOutputs[i]
				if (unspent_output === null || typeof unspent_output === 'undefined') {
					throw "unspent_output at index " + i + " was null"
				}
				const spend_key_images = unspent_output.spend_key_images
				if (spend_key_images === null || typeof spend_key_images === 'undefined') {
					throw "spend_key_images of unspent_output at index " + i + " was null"
				}
				for (var j = 0; j < spend_key_images.length; j++) {
					var key_image = TransactionKeyImageCache.Lazy_KeyImage(
						finalized_unspentOutputs[i].tx_pub_key,
						finalized_unspentOutputs[i].index,
						address,
						view_key__private,
						spend_key__public,
						spend_key__private
					)
					if (key_image === finalized_unspentOutputs[i].spend_key_images[j]) {
						// console.log("💬  Output was spent; key image: " + key_image + " amount: " + monero_utils.formatMoneyFull(finalized_unspentOutputs[i].amount));
						// Remove output from list
						finalized_unspentOutputs.splice(i, 1);
						if (finalized_unspentOutputs[i]) {
							j = finalized_unspentOutputs[i].spend_key_images.length;
						}
						i--;
					} else {
						// console.log("💬  Output used as mixin (" + key_image + "/" + finalized_unspentOutputs[i].spend_key_images[j] + ")");
					}
				}
			}
			// console.log("Unspent outs: " + JSON.stringify(finalized_unspentOutputs));
			const unusedOuts = finalized_unspentOutputs.slice(0)
			// yield
			fn(
				null, // no error
				finalized_unspentOutputs,
				unusedOuts
			)
		}
	}
	RandomOuts(
		using_outs,
		mixinNumber,
		fn
	)
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
			amounts.push(using_outs[l].amount.toString())
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
			//
			// yield
			fn(
				null, // no error
				amount_outs
			)
		}
	}
	TXTRecords(
		domain,
		fn
	)
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
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Sending funds

	SubmitSerializedSignedTransaction(
		address,
		view_key__private,
		serializedSignedTx,
		fn // (err?) -> Void
	)
	{
		const self = this
		//
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
			//
			fn(null)
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Requests

	_new_parameters_forWalletRequest(address, view_key__private)
	{
		return {
			address: address,
			view_key: view_key__private
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	_API_doRequest_returningRequestHandle(endpointPath, parameters, fn)
	{ // fn: (err?, data?) -> new Request
		const self = this
		parameters = parameters || {}
		const completeURL = self.baseURL + endpointPath
		console.log("📡  " + completeURL)
		const requestHandle = request({
			method: "POST", // maybe break this out
			url: completeURL,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			json: parameters,
		}, function(err, res, body)
		{
			const statusCode = typeof res !== 'undefined' ? res.statusCode : -1
			if (!err && statusCode == 200) {
				var json
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
			} else {
				if (err) {
					console.error("❌  HostedMoneroAPIClient Error:", err);
					fn(err, null)
					return
				}
				var errStr = "HostedMoneroAPIClient Error: " + statusCode + " " + res.statusMessage + " " + completeURL
				console.error("❌  " + errStr);
				console.error("Body:", body)
				var err = new Error(errStr)
				fn(err, null)
			}
		})
		//
		return requestHandle
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

}
module.exports = HostedMoneroAPIClient
