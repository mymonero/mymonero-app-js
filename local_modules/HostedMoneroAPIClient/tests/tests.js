"use strict"
//
const context = require('./tests_context').NewHydratedContext()
//
const async = require('async')
async.series(
	[
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
function __proceedTo_test_(fn)
{
	fn()
}
