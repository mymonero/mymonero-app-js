"use strict"
//
const context = require('./tests_context').NewHydratedContext()
//
const testWallet_address = "42S6txwM9RA53BL2Uf46CeM5WMJHTj6jWKgmSMLiLeb6A8QwXiWTK51PxF7wR8wNdgLJkWCM3NaiTfhWJnhskk7A7S5bEfp";
const testWallet_view_key = "883ada1a057f177e5edcc8a85ab732e2c30e52ab2d4708ecadc6bd2338bcac08";
const testWallet_spend_key__private = "d5d5789e274f965c3edd72464512f29e0c1934b6e6c0b87bfff86007b0775b0d";
const testWallet_spend_key__public = "1561812c8b12b918239257156a26cf78096302172f14c56fb6cb86f9c29ed536";
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
		testWallet_spend_key__public,
		testWallet_spend_key__private,
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
		testWallet_spend_key__public,
		testWallet_spend_key__private,
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
