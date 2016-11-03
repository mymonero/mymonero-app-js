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
		_proceedTo_test_loginCreatingNewWallet
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

function _proceedTo_test_loginCreatingNewWallet(fn)
{
	console.log("> _proceedTo_test_loginCreatingNewWallet")
	const wallet = new SecretWallet({}, context)
	console.log("Wallet is ", wallet)
	wallet.LogIn_creatingNewWallet(
		function(mnemonicString, confirmation_cb)
		{
			confirmation_cb(mnemonicString) // we're just going to pass this 
			// straight through here to simulate the user correctly entering it
		},
		function(err)
		{
			console.log("err", err)
		}
	)
}