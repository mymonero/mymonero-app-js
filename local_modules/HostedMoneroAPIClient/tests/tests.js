"use strict"
//
const context = require('./tests_context').NewHydratedContext()
//
const testWallet_address = "44AjvEj1YNeHcN19A25EcoNiuj75buNe7BKkbTPYJ1Bs3EFai2GkQTFELtD8V1jst3S8SCKed5MypLxkrydgirdcJttYaxY";
const testWallet_view_key = "0f02d6d5f86e6fc0a4a96aa02b55d7cd89bedce349e70117f6012d52cdedb208";
const testWallet_spend_key = "3187e24b9aa7a6ecf5f85231a8beba058a8be70f289456d8080a2e38232c340f";
//
const async = require('async')
async.series(
	[
		__proceedTo_test_logIn,
		__proceedTo_test_addressInfo,
		__proceedTo_test_addressTransactions
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
		} else {
			console.log("Tests completed without error.")
		}
	}
)
//
function __proceedTo_test_logIn(fn)
{
	console.log("> test_logIn")
	context.hostedMoneroAPIClient.LogIn(
		testWallet_address,
		testWallet_view_key,
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
	console.log("> test_addressInfo")
	context.hostedMoneroAPIClient.AddressInfo(
		testWallet_address,
		testWallet_view_key,
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
	console.log("> test_addressTransactions")
	context.hostedMoneroAPIClient.AddressTransactions(
		testWallet_address,
		testWallet_view_key,
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
