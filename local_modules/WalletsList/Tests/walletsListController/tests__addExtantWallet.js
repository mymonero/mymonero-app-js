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
const wallets__tests_config = require('./tests_config.js')
if (typeof wallets__tests_config === 'undefined' || wallets__tests_config === null) {
	console.error("You must create a tests_config.js (see tests_config.EXAMPLE.js) in local_modules/WalletsList/Tests/walletsListController/ in order to run this test.")
	process.exit(1)
	return
}
//
const context = require('./tests_context').NewHydratedContext()
//
var walletsListController; // to instantiate for usage……
//
const async = require('async')
async.series(
	[
		_proceedTo_test_bootController,
		//
		_proceedTo_test_addingExtantWalletBy_mnemonicString,
		_proceedTo_test_addingExtantWalletBy_addrAndPrivateKeys
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
function _proceedTo_test_bootController(cb)
{
	const WalletsListController = require('../../Controllers/WalletsListController')
	const options = {}
	const controller = new WalletsListController(options, context)
	walletsListController = controller
	controller.on(controller.EventName_booted(), function()
	{
		cb()
	})
	controller.on(controller.EventName_errorWhileBooting(), function(err)
	{
		cb(err)
	})
}
//
function _proceedTo_test_addingExtantWalletBy_mnemonicString(cb)
{
	if (walletsListController == null || typeof walletsListController === 'undefined') {
		// but techically async ought not to let this test be executed if walletsListController boot failed
		cb(new Error("walletsListController undefined or null"))
		return
	}
	//
	const initWithMnemonic__mnemonicString = wallets__tests_config.initWithMnemonic__mnemonicString
	//
	walletsListController.WhenBooted_AddExtantWalletWith_mnemonicString(
		initWithMnemonic__mnemonicString,
		function(err, walletInstance, wasWalletAlreadyInserted)
		{
			if (err) {
				cb(err)
				return
			}
			console.log("Successfully added extant wallet", walletInstance.Description())
			if (wasWalletAlreadyInserted === true) {
				console.warn("⚠️  That wallet had already been added to the database.")
			}
			cb()
		}
	)
}
function _proceedTo_test_addingExtantWalletBy_addrAndPrivateKeys(cb)
{
	if (walletsListController == null || typeof walletsListController === 'undefined') {
		// but techically async ought not to let this test be executed if walletsListController boot failed
		cb(new Error("walletsListController undefined or null"))
		return
	}
	//
	const initWithKeys__address = wallets__tests_config.initWithKeys__address
	const initWithKeys__view_key__private = wallets__tests_config.initWithKeys__view_key__private
	const initWithKeys__spend_key__private = wallets__tests_config.initWithKeys__spend_key__private
	//
	walletsListController.WhenBooted_AddExtantWalletWith_addressAndKeys(
		initWithKeys__address,
		initWithKeys__view_key__private,
		initWithKeys__spend_key__private,
		function(err, walletInstance, wasWalletAlreadyInserted)
		{
			if (err) {
				cb(err)
				return
			}
			console.log("Successfully added extant wallet", walletInstance.Description())
			if (wasWalletAlreadyInserted === true) {
				console.warn("⚠️  That wallet had already been added to the database.")
			}
			cb()
		}
	)
}
