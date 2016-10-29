//
//
// Set up application runtime object graph
//
const electron = require('electron')
const app = electron.app
//
//
// Set up application runtime object graph
//
const context = require('./electron_main_context').NewHydratedContext(app) // electron app can be accessed at context.app; context is injected into instances of classes described in ./electron_main_context.js
module.exports = context



__test_updateWallet()

function __test_updateWallet()
{
	console.log("__test_updateWallet")
	var query =
	{
		"key": "some encrypted secret"
	}
	var update =
	{
		"key": "some encrypted secret"
	}
	var options =
	{
		upsert: true,
		multi: false,
		returnUpdatedDocs: true
	}
	context.persister.updateDocuments(
		"wallets",
		query,
		update,
		options,
		function(
			err,
			numAffected,
			affectedDocuments,
			upsert
		)
		{

			console.log("err,  numAffected,  affectedDocuments,  upsert,",
						err,
						numAffected,
						affectedDocuments,
						upsert)

			__test_findWallet()
		}
	)
}
function __test_findWallet()
{
	console.log("__test_findWallet")
	context.persister.documentsWithQuery(
		"wallets",
		{ "key": "some encrypted secret" },
		{},
		function(err, docs)
		{
			console.log("err", err)
			console.log("docs", docs)
			__test_removeWallet()
		}
	)
}
function __test_removeWallet()
{
	console.log("__test_removeWallet")
	context.persister.removeDocuments(
		"wallets",
		{ "key": "some encrypted secret" },
		null,
		function(err, numRemoved)
		{
			console.log("err")
			console.log("numRemoved", numRemoved)
		}
	)
}
