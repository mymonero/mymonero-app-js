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
const async = require('async')
//
const wallets__tests_config = require('./tests_config.js')
if (typeof wallets__tests_config === 'undefined' || wallets__tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/Wallets/Tests/singleWallet/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
const SecretPersistingHostedWallet = require('../../Models/SecretPersistingHostedWallet')
//
async.series(
	[
		_proceedTo_test_changingWalletPassword,
	],
	function(err)
	{
		if (err) {
			console.log("Error while performing tests: ", err)
			process.exit(1)
		} else {
			console.log("✅  Tests completed without error.")
			process.exit(0)
		}
	}
)
//
//
function _proceedTo_test_changingWalletPassword(fn)
{
	console.log("> _proceedTo_test_changingWalletPassword")
	var finishedAccountInfoSync = false
	var finishedAccountTxsSync = false
	function areAllSyncOperationsFinished()
	{
		return finishedAccountInfoSync && finishedAccountTxsSync
	}
	function didFinishAllSyncOperations()
	{
		console.log("Proceed to change password ", wallet)
		const existing_persistencePassword = wallets__tests_config.persistencePassword
		const myNew_tooShort_password = "  "
		const myNew_good_password = "a much stronger password than before"
		const changeTo_persistencePassword = myNew_good_password
		wallet.ChangePasswordFromTo(
			existing_persistencePassword,
			changeTo_persistencePassword,
			function(err)
			{
				if (err) {
					console.log("Failed to change pw with err", err)
				} else {
					console.log("Successfully changed pw")
				}
				fn(err)
			}
		)
	}
	var wallet;
	const options =
	{
		_id: wallets__tests_config.openWalletWith_id,
		//
		failedToInitialize_cb: function(err)
		{
			fn(err)
		},
		successfullyInitialized_cb: function()
		{
			console.log("Wallet is ", wallet)
			// we're not going to call fn here because we want to wait for both acct info fetch and txs fetch
			wallet.Boot_decryptingExistingInitDoc(
				wallets__tests_config.persistencePassword,
				function(err)
				{
					if (err) {
						fn(err)
						return
					}
					// now we will await the completion of the sync so we can do the operation for this test
				}
			)
		},
		//
		didReceiveUpdateToAccountInfo: function()
		{
			if (finishedAccountInfoSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountInfoSync = true
			if (areAllSyncOperationsFinished()) {
				didFinishAllSyncOperations()
			}
		},
		didReceiveUpdateToAccountTransactions: function()
		{
			if (finishedAccountTxsSync == true) {
				return // already done initial sync - don't re-trigger fn
			}
			finishedAccountTxsSync = true
			if (areAllSyncOperationsFinished()) {
				didFinishAllSyncOperations()
			}
		}
	}
	wallet = new SecretPersistingHostedWallet(options, context)
}
