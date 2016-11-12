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
function __proceedTo_test_…(fn)
{
	console.log("▶️  test_…")
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
}
