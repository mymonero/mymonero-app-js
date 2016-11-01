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
		_proceedTo_test_login
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

function _proceedTo_test_login(fn)
{
	const wallet = new SecretWallet({}, context)
	console.log("Wallet is ", wallet)
}