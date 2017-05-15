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
const context = require('./tests_context').NewHydratedContext()
//
const tests_config = require('./tests_config.js')
if (typeof tests_config === 'undefined' || tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/HostedMoneroAPIClient/tests/ in order to run this test.")
	process.exit(1)
	return
}
//
const async = require('async')
async.series(
	[
		// __proceedTo_test_…
	],
	function(err)
	{
		if (err) {
			console.log("❌  Error while performing tests: ", err)
		} else {
			console.log("✅  Tests completed without error.")
		}
	}
)
//
// TODO
// function __proceedTo_test_…(fn)
// {
// 	console.log("▶️  test_…")
	// context.hostedMoneroAPIClient.…(
	// 	tests_config.testWallet_address,
	// 	tests_config.testWallet_view_key,
	// 	tests_config.testWallet_spend_key__public,
	// 	tests_config.testWallet_spend_key__private,
	// 	function(
	// 		err,
	// 		total_received,
	// 		locked_balance,
	// 		total_sent,
	// 		spent_outputs,
	// 		account_scanned_tx_height,
	// 		account_scanned_block_height,
	// 		account_scan_start_height,
	// 		transaction_height,
	// 		blockchain_height
	// 	)
	// 	{
	// 		console.log("err", err)
	// 		console.log(
	// 			"total_received, locked_balance, total_sent, spent_outputs, account_scanned_tx_height, account_scanned_block_height, account_scan_start_height, transaction_height, blockchain_height",
	// 			total_received,
	// 			locked_balance,
	// 			total_sent,
	// 			spent_outputs,
	// 			account_scanned_tx_height,
	// 			account_scanned_block_height,
	// 			account_scan_start_height,
	// 			transaction_height,
	// 			blockchain_height
	// 		)
	// 		fn(err)
	// 	}
	// )
// }
