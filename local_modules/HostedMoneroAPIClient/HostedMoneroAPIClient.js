"use strict"
//
const request = require('request')
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger // important: grab defined export
const async = require('async')
const monero_utils = require('../monero_utils/monero_utils_instance')
const TransactionKeyImageCache = require('./TransactionKeyImageCache')
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
		self.scheme = "https"
		self.host = "api.mymonero.com:8443/" // later will be configurable
		self.baseURL = self.scheme + "://" + self.host
		//
		self.setup()
	}
	setup()
	{
		var self = this
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public
	
	LogIn(address, view_key, fn)
	{ // fn: (err?, new_address?)
		const self = this
		const endpointPath = "login"
		const parameters = self._new_parameters_forWalletRequest(address, view_key)
		parameters.create_account = true
		//
		self._API_request(
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
	
	AddressInfo(address, view_key, fn)
	{
		const self = this
		const endpointPath = "get_address_info"
		const parameters = self._new_parameters_forWalletRequest(address, view_key)
		self._API_request(
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
			const account_scanned_tx_height = data.scanned_height || 0;
			const account_scanned_block_height = data.scanned_block_height || 0;
			const account_scan_start_height = data.start_height || 0;
			const transaction_height = data.transaction_height || 0;
			const blockchain_height = data.blockchain_height || 0;
			var total_sent = new JSBigInt(data.total_sent || 0) // will be modified in place
			const spent_outputs = data.spent_outputs || []			
			//
			// TODO:
			const view_key__private = null 
			const spend_key__public = null
			const spend_key__private = null
			//
			for (let spent_output of spent_outputs) {
				var key_image = TransactionKeyImageCache.Lazy_KeyImage(
					spent_output.tx_pub_key,
					spent_output.out_index,
					view_key__private,
					spend_key__public,
					spend_key__private
				)
				if (spent_output.key_image !== key_image) {
					console.log('Output used as mixin (' + spent_output.key_image + '/' + key_image + ')')
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
	}
	
	AddressTransactions(address, view_key, fn)
	{
		const self = this
		const endpointPath = "get_address_txs"
		const parameters = self._new_parameters_forWalletRequest(address, view_key)
		//
		self._API_request(
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
			// TODO:
			const view_key__private = null 
			const spend_key__public = null
			const spend_key__private = null
			//
			for (let i = 0; i < transactions.length; ++i) {
				if ((transactions[i].spent_outputs || []).length > 0) {
					for (var j = 0; j < transactions[i].spent_outputs.length; ++j) {
						var key_image = TransactionKeyImageCache.Lazy_KeyImage(
							transactions[i].spent_outputs[j].tx_pub_key,
							transactions[i].spent_outputs[j].out_index,
							view_key__private,
							spend_key__public,
							spend_key__private
						)
						if (transactions[i].spent_outputs[j].key_image !== key_image) {
							console.log('Output used as mixin, ignoring (' + transactions[i].spent_outputs[j].key_image + '/' + key_image + ')')
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
	}

	
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Requests
	
	_new_parameters_forWalletRequest(address, view_key)
	{
		return {
			address: address,
			view_key: view_key
		}
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private
	
	_API_request(endpointPath, parameters, fn)
	{ // fn: (err?, data?) -> Void
		const self = this
		parameters = parameters || {}
		const completeURL = self.baseURL + endpointPath
		request({
			method: "POST", // maybe break this out
			url: completeURL,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			json: parameters,
		}, function(err, res, body)
		{
			const statusCode = res.statusCode
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
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

}
module.exports = HostedMoneroAPIClient