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
const child_ipc = require('../electron_background/child_ipc.electron')
//
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
const monero_keyImage_cache_utils = require('../monero_utils/monero_keyImage_cache_utils')
//
// Declaring tasks:
//
const tasksByName =
{
	Parse_AddressInfo: function(
		taskUUID, // child_ipc inserts the task UUID so we have it
		data,
		address,
		view_key__private,
		spend_key__public,
		spend_key__private
	)
	{
		{
			console.time("Parse_AddressInfo " + taskUUID)
		}
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
		{
			console.timeEnd("Parse_AddressInfo " + taskUUID)
		}
		const returnValuesByKey = {}
		{
			returnValuesByKey.total_received_String = total_received ? total_received.toString() : null
			returnValuesByKey.locked_balance_String = locked_balance ? locked_balance.toString() : null
			returnValuesByKey.total_sent_String = total_sent ? total_sent.toString() : null
			// ^serialized JSBigInt
			returnValuesByKey.spent_outputs = spent_outputs
			returnValuesByKey.account_scanned_tx_height = account_scanned_tx_height
			returnValuesByKey.account_scanned_block_height = account_scanned_block_height
			returnValuesByKey.account_scan_start_height = account_scan_start_height
			returnValuesByKey.transaction_height = transaction_height
			returnValuesByKey.blockchain_height = blockchain_height
		}
		child_ipc.CallBack(taskUUID, err, returnValuesByKey)
	}
}
//
//
// Kicking off runtime:
//
child_ipc.InitWithTasks_AndStartListening(tasksByName)