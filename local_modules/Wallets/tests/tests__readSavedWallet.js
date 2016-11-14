// Copyright (c) 2014-2016, MyMonero.com
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
const async = require('async')
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
		_proceedTo_test_openingSavedWallet,
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
function _proceedTo_test_openingSavedWallet(fn)
{
	console.log("> _proceedTo_test_openingSavedWallet")
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}	
	const options = 
	{
		_id: wallets__tests_config.openWalletWith_id,
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