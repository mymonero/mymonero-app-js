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
		__proceedTo_test_logIn,
		//
		__proceedTo_test_addressInfo,
		__proceedTo_test_addressTransactions,
		//
		__proceedTo_test_UnspentOuts,
		//
		__proceedTo_test_TXTRecords
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
function __proceedTo_test_logIn(fn)
{
	console.log("▶️  test_logIn")
	context.hostedMoneroAPIClient.LogIn(
		tests_config.testWallet_address,
		tests_config.testWallet_view_key,
		function(
			err,
			new_address
		)
		{
			console.log("err", err)
			console.log(
				"new_address", 
				new_address
			)
			fn(err)
		}
	)
}
function __proceedTo_test_addressInfo(fn)
{
	console.log("▶️  test_addressInfo")
	context.hostedMoneroAPIClient.AddressInfo(
		tests_config.testWallet_address,
		tests_config.testWallet_view_key,
		tests_config.testWallet_spend_key__public,
		tests_config.testWallet_spend_key__private,
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
			console.log("err", err)
			console.log(
				"total_received, locked_balance, total_sent, spent_outputs, account_scanned_tx_height, account_scanned_block_height, account_scan_start_height, transaction_height, blockchain_height", 
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
			fn(err)
		}
	)
}
function __proceedTo_test_addressTransactions(fn)
{	
	console.log("▶️  test_addressTransactions")
	context.hostedMoneroAPIClient.AddressTransactions(
		tests_config.testWallet_address,
		tests_config.testWallet_view_key,
		tests_config.testWallet_spend_key__public,
		tests_config.testWallet_spend_key__private,
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
			console.log("err", err)
			console.log(
				"account_scanned_height, account_scanned_block_height, account_scan_start_height, transaction_height, blockchain_height, transactions", 
				account_scanned_height, 
				account_scanned_block_height, 
				account_scan_start_height,
				transaction_height, 
				blockchain_height, 
				transactions
			)
			fn(err)
		}
	)
}
function __proceedTo_test_UnspentOuts(fn)
{	
	console.log("▶️  __proceedTo_test_UnspentOuts")
	const mixinNumber = 3
	context.hostedMoneroAPIClient.UnspentOuts(
		tests_config.testWallet_address,
		tests_config.testWallet_view_key,
		tests_config.testWallet_spend_key__public,
		tests_config.testWallet_spend_key__private,
		mixinNumber,
		function(
			err, 
			unspentOuts,
			unusedOuts
		)
		{
			console.log("err", err)
			console.log(
				"unspentOuts, unusedOuts", 
				unspentOuts,
				unusedOuts
			)
			fn(err)
		}
	)
}
//
// function __proceedTo_test_RandomOuts(fn)
// {
// 	console.log("▶️  __proceedTo_test_RandomOuts")
// todo?
// }

function __proceedTo_test_TXTRecords(fn)
{
	const domain = "donate.getmonero.org"
	context.hostedMoneroAPIClient.TXTRecords(
		domain,
		function(
			err,
			records,
			dnssec_used,
			secured,
			dnssec_fail_reason
		)
		{
			console.log("err", err)
			console.log(
				"records, dnssec_used, secured, dnssec_fail_reason", 
				records,
				dnssec_used,
				secured,
				dnssec_fail_reason
			)
			fn(err)
		}
	)
}

