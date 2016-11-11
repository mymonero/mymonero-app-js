"use strict"
//
const async = require('async')
//
const context = require('./tests_context').NewHydratedContext()
//
const SecretPersistingHostedWallet = require('../SecretPersistingHostedWallet')
//
async.series(
	[
		function(cb)
		{
			const collectionName = "Wallets" // this is fragile
			const dbHandle = context.persister._dbHandle_forCollectionNamed(collectionName)
			dbHandle.persistence.compactDatafile()
		}
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