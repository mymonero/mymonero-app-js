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
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
const monero_utils = require('../monero_utils/monero_cryptonote_utils_instance')
const monero_keyImage_cache_utils = require('../monero_utils/monero_keyImage_cache_utils')
//
function Parsed_AddressInfo(
	data,
	address,
	view_key__private,
	spend_key__public,
	spend_key__private,
	fn // (err?, returnValuesByKey) -> Void
)
{
	const err = null
	//
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
		var key_image = monero_keyImage_cache_utils.Lazy_KeyImage(
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
	const returnValuesByKey = 
	{
		total_received_String: total_received ? total_received.toString() : null,
		locked_balance_String: locked_balance ? locked_balance.toString() : null,
		total_sent_String: total_sent ? total_sent.toString() : null,
		// ^serialized JSBigInt
		spent_outputs: spent_outputs,
		account_scanned_tx_height: account_scanned_tx_height,
		account_scanned_block_height: account_scanned_block_height,
		account_scan_start_height: account_scan_start_height,
		transaction_height: transaction_height,
		blockchain_height: blockchain_height
	}
	fn(err, returnValuesByKey)
}
exports.Parsed_AddressInfo = Parsed_AddressInfo
//
function Parsed_AddressTransactions(
	data,
	address,
	view_key__private,
	spend_key__public,
	spend_key__private,
	fn // (err?, returnValuesByKey) -> Void
)
{
	const err = null
	//
	const account_scanned_height = data.scanned_height || 0
	const account_scanned_block_height = data.scanned_block_height || 0
	const account_scan_start_height = data.start_height || 0
	const transaction_height = data.transaction_height || 0
	const blockchain_height = data.blockchain_height || 0
	//
	const transactions = data.transactions || []
	//
	// TODO: rewrite this with more clarity if possible
	for (let i = 0; i < transactions.length; ++i) {
		if ((transactions[i].spent_outputs || []).length > 0) {
			for (var j = 0; j < transactions[i].spent_outputs.length; ++j) {
				var key_image = monero_keyImage_cache_utils.Lazy_KeyImage(
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
		transactions[i].timestamp = transactions[i].timestamp
	}
	transactions.sort(function(a, b)
	{
		return b.id - a.id
	})
	// prepare transactions to be serialized
	for (let transaction of transactions) {
		transaction.amount = transaction.amount.toString() // JSBigInt -> String
		if (typeof transaction.total_sent !== 'undefined' && transaction.total_sent !== null) {
			transaction.total_sent = transaction.total_sent.toString()
		}
	}
	// on the other side, we convert transactions timestamp to Date obj
	const returnValuesByKey =
	{
		account_scanned_height: account_scanned_height,
		account_scanned_block_height: account_scanned_block_height,
		account_scan_start_height: account_scan_start_height,
		transaction_height: transaction_height,
		blockchain_height: blockchain_height,
		serialized_transactions: transactions
	}
	fn(err, returnValuesByKey)
}
exports.Parsed_AddressTransactions = Parsed_AddressTransactions
//
function Parsed_UnspentOuts(
	data,
	address,
	view_key__private,
	spend_key__public,
	spend_key__private,
	fn // (err?, returnValuesByKey)
)
{
	const err = null
	//
	const data_outputs = data.outputs
	const finalized_unspentOutputs = data.outputs || [] // to finalize:
	for (var i = 0; i < finalized_unspentOutputs.length; i++) {
		const unspent_output = finalized_unspentOutputs[i]
		if (
			unspent_output === null 
			|| typeof unspent_output === 'undefined' 
			|| !unspent_output // just preserving what was in the original code
		) {
			throw "unspent_output at index " + i + " was null"
		}
		const spend_key_images = unspent_output.spend_key_images
		if (spend_key_images === null || typeof spend_key_images === 'undefined') {
			throw "spend_key_images of unspent_output at index " + i + " was null"
		}
		for (var j = 0; j < spend_key_images.length; j++) {
			const finalized_unspentOutput_atI_beforeSplice = finalized_unspentOutputs[i]
			if (!finalized_unspentOutput_atI_beforeSplice || typeof finalized_unspentOutput_atI_beforeSplice === 'undefined') {
				console.warn(`This unspent output at i ${i} was literally undefined! Skipping.`)
				continue
			}
			const beforeSplice__tx_pub_key = finalized_unspentOutput_atI_beforeSplice.tx_pub_key
			const beforeSplice__index = finalized_unspentOutput_atI_beforeSplice.index
			if (typeof beforeSplice__tx_pub_key === 'undefined' || !beforeSplice__tx_pub_key) {
				console.warn("This unspent out was missing a tx_pub_key! Skipping.", finalized_unspentOutput_atI_beforeSplice)
				continue
			}
			var key_image = monero_keyImage_cache_utils.Lazy_KeyImage(
				beforeSplice__tx_pub_key,
				beforeSplice__index,
				address,
				view_key__private,
				spend_key__public,
				spend_key__private
			)
			if (key_image === finalized_unspentOutput_atI_beforeSplice.spend_key_images[j]) {
				// console.log("💬  Output was spent; key image: " + key_image + " amount: " + monero_utils.formatMoneyFull(finalized_unspentOutputs[i].amount));
				// Remove output from list
				finalized_unspentOutputs.splice(i, 1);
				const finalized_unspentOutput_atI_afterSplice = finalized_unspentOutputs[i]
				if (finalized_unspentOutput_atI_afterSplice) {
					j = finalized_unspentOutput_atI_afterSplice.spend_key_images.length;
				}
				i--;
			} else {
				console.log("💬  Output used as mixin (" + key_image + "/" + finalized_unspentOutputs[i].spend_key_images[j] + ")");
			}
		}
	}
	console.log("Unspent outs: " + JSON.stringify(finalized_unspentOutputs));
	const unusedOuts = finalized_unspentOutputs.slice(0)
	const returnValuesByKey =
	{
		unspentOutputs: finalized_unspentOutputs,
		unusedOuts: unusedOuts
	}
	fn(err, returnValuesByKey)
}
exports.Parsed_UnspentOuts = Parsed_UnspentOuts