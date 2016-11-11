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
		_proceedTo_test_creatingNewWalletAndAccount,
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
function _proceedTo_test_creatingNewWalletAndAccount(fn)
{
	console.log("> _proceedTo_test_creatingNewWalletAndAccount")
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	const options = 
	{
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
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			finishedAccountTxsSync = true
			if (areAllSyncOperationsFinished()) {
				fn()
			}
		}
	}
	const wallet = new SecretPersistingHostedWallet(options, context)
}