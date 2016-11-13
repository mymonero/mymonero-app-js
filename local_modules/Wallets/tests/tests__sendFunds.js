"use strict"
//
const async = require('async')
const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
//
const wallets__tests_config = require('./tests_config.js')
if (typeof wallets__tests_config === 'undefined' || wallets__tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Wallets/tests/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
const SecretPersistingHostedWallet = require('../SecretPersistingHostedWallet')
//
async.series(
	[
		_proceedTo_test_sendFunds_1
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
//
function _proceedTo_test_sendFunds_1(fn)
{
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function _areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	function _didFinishAllSyncOperations()
	{
		const targetDescriptions =
		[
			{
				address: 'donate.getmonero.org',
				amount: 0.001
			}
		]
		const mixin = 3
		const payment_id = null
		wallet.SendFunds(
			targetDescriptions, // [ { address: String, amount: Number } ]
			mixin,
			payment_id,
			function(err)
			{
				if (err) {
					console.error("❌  Failed to send funds with", err)
				} else {
					console.log("✅  Successfully sent funds")
				}
				fn(err) // err may be null
			},
			function( // SendFunds will confirm with user via this function before calling the fn just above
	            domain,
	            currencyReady_address,
				oaRecord_0_name, 
				oaRecord_0_description, 
	            dnssec_used_and_secured,
				userConfirmed_cb,
				userRejectedOrCancelled_cb
			)
			{
				console.log("domain, currencyReady_address, oaRecord_0_name, oaRecord_0_description, dnssec_used_and_secured", domain,
				currencyReady_address,
				oaRecord_0_name, 
				oaRecord_0_description,
				dnssec_used_and_secured)
				
				// simulate a user confirmation
				userConfirmed_cb()
			}
		)
	}
	const options = 
	{
		_id: wallets__tests_config.openWalletWith_id,
		persistencePassword: wallets__tests_config.persistencePassword,
		failure_cb: function(err)
		{
			fn(err)
		},
		successfullyInstantiated_cb: function()
		{
			console.log("Wallet is ", wallet)
			// we're not going to call fn here because we want to wait for both acct info fetch and txs fetch
		},
		ifNewWallet__informingAndVerifyingMnemonic_cb: function(mnemonicString, confirmation_cb)
		{
			confirmation_cb(mnemonicString) // simulating correct user input
		},
		//
		didReceiveUpdateToAccountInfo: function()
		{
			finishedAccountInfoSync = true
			if (_areAllSyncOperationsFinished()) {
				_didFinishAllSyncOperations()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			finishedAccountTxsSync = true
			if (_areAllSyncOperationsFinished()) {
				_didFinishAllSyncOperations()
			}
		}
	}
	const wallet = new SecretPersistingHostedWallet(options, context)
}