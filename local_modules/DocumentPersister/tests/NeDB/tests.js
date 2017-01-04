// Copyright (c) 2014-2017, MyMonero.com
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"use strict"
//
const context = require('./tests_context').NewHydratedContext()
//
const async = require('async')
async.series(
	[
		__proceedTo_test_updateWallet,
		__proceedTo_test_findWallet,
		__proceedTo_test_removeWallet
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
		} else {
			console.log("✅  Tests completed without error.")
		}
	}
)
//
function __proceedTo_test_updateWallet(fn)
{
	console.log("> __test_updateWallet")
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
	context.persister.UpdateDocuments(
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

			fn(err)
		}
	)
}
function __proceedTo_test_findWallet(fn)
{
	console.log("> __test_findWallet")
	context.persister.DocumentsWithQuery(
		"wallets",
		{ "key": "some encrypted secret" },
		{},
		function(err, docs)
		{
			console.log("err", err)
			console.log("docs", docs)
			fn(err)
		}
	)
}
function __proceedTo_test_removeWallet(fn)
{
	console.log("> __test_removeWallet")
	context.persister.RemoveDocuments(
		"wallets",
		{ "key": "some encrypted secret" },
		null,
		function(err, numRemoved)
		{
			console.log("err")
			console.log("numRemoved", numRemoved)
			fn(err)
		}
	)
}
