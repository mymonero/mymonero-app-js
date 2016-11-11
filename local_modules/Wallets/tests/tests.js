"use strict"
//
const async = require('async')
const monero_wallet_utils = require('../../monero_utils/monero_wallet_utils')
//
const context = require('./tests_context').NewHydratedContext()
//
const SecretPersistingHostedWallet = require('../SecretPersistingHostedWallet')
//
async.series(
	[
		// function(cb)
		// {
		// 	const collectionName = "Wallets"
		// 	const dbHandle = context.persister._dbHandle_forCollectionNamed(collectionName)
		// 	dbHandle.persistence.compactDatafile()
		// }
		// ,
		// _proceedTo_test_creatingNewWalletAndAccount,
		// _proceedTo_test_openingSavedWallet,
		//
		_proceedTo_test_importingWalletByMnemonic,
		_proceedTo_test_importingWalletByAddressAndKeys
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
		_id: "qcI9CIxyZ0USVVja", // take the _id from the wallet creation above
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
function _proceedTo_test_importingWalletByMnemonic(fn)
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
		initWithMnemonic__mnemonicString: "phone etiquette twice oars bounced left wonders aglow fleet avidly ramped fuzzy height nodes fever radar soapy fading boyfriend vortex wizard slug mowing occur soapy", 
		initWithMnemonic__wordsetName: monero_wallet_utils.wordsetNames.english,
		//
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

function _proceedTo_test_importingWalletByAddressAndKeys(fn)
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
		initWithKeys__address: "42S6txwM9RA53BL2Uf46CeM5WMJHTj6jWKgmSMLiLeb6A8QwXiWTK51PxF7wR8wNdgLJkWCM3NaiTfhWJnhskk7A7S5bEfp",
		initWithKeys__view_key__private: "883ada1a057f177e5edcc8a85ab732e2c30e52ab2d4708ecadc6bd2338bcac08",
		initWithKeys__spend_key__private: "d5d5789e274f965c3edd72464512f29e0c1934b6e6c0b87bfff86007b0775b0d",
		//
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