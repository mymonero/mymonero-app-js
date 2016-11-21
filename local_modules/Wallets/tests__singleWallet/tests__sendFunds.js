"use strict"
//
const async = require('async')
//
const wallets__tests_config = require('./tests_config.js')
if (typeof wallets__tests_config === 'undefined' || wallets__tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Wallets/tests__singleWallet/ in order to run this test.")
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
			process.exit(1)
		} else {
			console.log("✅  Tests completed without error.")
			process.exit(0)
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
		const target_address = "donate.getmonero.org"
		const amount = 0.001
		const mixin = 3
		const payment_id = null
		wallet.SendFunds(
			target_address,
			amount,
			mixin,
			payment_id,
			function(
				err,
				currencyReady_targetDescription_address,
				sentAmount,
				targetDescription_domain_orNone,
				final__payment_id,
				tx_hash,
				tx_fee
			)
			{
				if (err) {
					console.error("❌  Failed to send funds with", err)
				} else {
					console.log("✅  Successfully sent funds")
					console.log(
						"currencyReady_targetDescription_address, sentAmount, targetDescription_domain_orNone, final__payment_id, tx_hash, tx_fee", 
						currencyReady_targetDescription_address,
						sentAmount,
						targetDescription_domain_orNone,
						final__payment_id,
						tx_hash,
						tx_fee
					)
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
		failedSetUp_cb: function(err)
		{
			fn(err)
		},
		successfullySetUp_cb: function()
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
			if (finishedAccountInfoSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountInfoSync = true
			if (_areAllSyncOperationsFinished()) {
				_didFinishAllSyncOperations()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (finishedAccountTxsSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountTxsSync = true
			if (_areAllSyncOperationsFinished()) {
				_didFinishAllSyncOperations()
			}
		}
	}
	const wallet = new SecretPersistingHostedWallet(options, context)
}