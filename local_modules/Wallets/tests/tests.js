"use strict"
//
const async = require('async')
//
const context = require('./tests_context').NewHydratedContext()
//
const SecretWallet = require('../SecretWallet')
//
async.series(
	[
		_proceedTo_test_creatingNewWalletAndAccount,
		_proceedTo_test_openingSavedWallet
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
	var persistencePassword = "my wallet password"
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	const options = 
	{
		persistencePassword: persistencePassword,
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
			if (areAllSyncOperationsFinished) {
				fn()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (areAllSyncOperationsFinished) {
				fn()
			}
		}
	}
	const wallet = new SecretWallet(options, context)
}
function _proceedTo_test_openingSavedWallet(fn)
{
	console.log("> _proceedTo_test_openingSavedWallet")
	var persistencePassword = "my wallet password"
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	const options = 
	{
		_id: "4bYazIQtgsKym4wy", // take the _id from the wallet creation above
		persistencePassword: persistencePassword,
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
			if (areAllSyncOperationsFinished) {
				fn()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (areAllSyncOperationsFinished) {
				fn()
			}
		}
	}
	const wallet = new SecretWallet(options, context)
}