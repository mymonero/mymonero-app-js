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
const SecretPersistingHostedWallet = require('./SecretPersistingHostedWallet')
const secretWallet_persistence_utils = require('./secretWallet_persistence_utils')
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class WalletsListController
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.hasBooted = false // not booted yet - we'll defer things till we have
		//
		self.setup()
	}
	setup()
	{
		const self = this
		const context = self.context
		//
		// reconsitute persisted wallets
		self._new_idsOfPersistedWallets(
			function(err, ids)
			{
				if (err) {
					const errStr = "Error fetching persisted wallet ids: " + err.toString()
					_trampolineFor_failedToInitialize_withErrStr(errStr)
					return
				}
				__proceedTo_loadWalletsWithIds(ids)
			}
		)
		function __proceedTo_loadWalletsWithIds(ids)
		{
			self.wallets = []
			if (ids.length === 0) {
				self.hasBooted = true // nothing to do to boot
				return
			}
			self.context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
				function(err, obtainedPasswordString, userSelectedTypeOfPassword)
				{
					if (err) {
						fn(err)
						return
					}
					__proceedTo_loadAndBootAllExtantWalletsWithPassword(obtainedPasswordString)
				}
			)
			function __proceedTo_loadAndBootAllExtantWalletsWithPassword(persistencePassword)
			{
				async.each(
					ids,
					function(_id, cb)
					{
						var wallet;
						const options =
						{
							_id: _id,
							//
							failedToInitialize_cb: function(err)
							{
								console.error("Failed to read wallet ", err)
								cb(err)
							},
							successfullyInitialized_cb: function()
							{
								wallet.Boot_decryptingExistingInitDoc(
									persistencePassword,
									function(err)
									{
										if (err) {
											cb(err)
											return
										}
										console.log("Initialized wallet", wallet.Description())
										self._wallet_wasSuccessfullyInitialized(wallet) // not yet booted
										cb()
									}
								)
							},
							didReceiveUpdateToAccountInfo: function()
							{ // TODO: bubble?
							},
							didReceiveUpdateToAccountTransactions: function()
							{ // TODO: bubble?
							}
						}
						wallet = new SecretPersistingHostedWallet(options, context)
					},
					function(err)
					{
						if (err) {
							console.error("Error fetching persisted wallet ids", err)
							throw err
							return
						}
						self.hasBooted = true // all done!
					}
				)
			}
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public



	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Opening existing wallets

	_bootWallet(
		walletInstance,
		persistencePassword,
		fn // (err, wallet) -> Void
	)
	{
		const self = this
	}



	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Wallets list

	CreateAndAddNewlyGeneratedWallet(
		persistencePassword, // TODO: maybe break these out depending on what the UI needs
		walletLabel,
		informingAndVerifyingMnemonic_cb, // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
										    // confirmation_cb: (userConfirmed_mnemonicString) -> Void
		fn // fn: (err: Error?, walletInstance, SecretPersistingHostedWallet) -> Void
	)
	{
		const self = this
		const context = self.context
		//
		var wallet;
		const options =
		{
			generateNewWallet: true, // must flip this flag to true
			//
			failedToInitialize_cb: function(err)
			{
				fn(err)
			},
			successfullyInitialized_cb: function()
			{
				wallet.Boot_byLoggingIntoHostedService_byCreatingNewWallet(
					persistencePassword,
					walletLabel,
					informingAndVerifyingMnemonic_cb,
					function(err)
					{
						if (err) {
							fn(err)
							return
						}
						self._wallet_wasSuccessfullyInitialized(wallet)
						//
						fn(null, wallet)
					}
				)
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{ // TODO: bubble?
			},
			didReceiveUpdateToAccountTransactions: function()
			{ // TODO: bubble?
			}
		}
		wallet = new SecretPersistingHostedWallet(options, context)
	}
	AddExtantWalletWith_mnemonicString(
		walletLabel,
		persistencePassword,
		mnemonicString,
		wordsetName,
		fn // fn: (err: Error?, walletInstance: SecretPersistingHostedWallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		//
		var walletAlreadyExists = false
		const wallets_length = self.wallets.length
		for (let i = 0 ; i < wallets_length ; i++) {
			const wallet = self.wallets[i]
			if (wallet.mnemonicString === mnemonicString) {
				// simply return existing wallet
				fn(null, wallet, true) // wasWalletAlreadyInserted: true
				return
			}
			// TODO: solve limitation of this code; how to check if wallet with same address (but no mnemonic) was already added?
		}
		//
		var wallet;
		const options =
		{
			failedToInitialize_cb: function(err)
			{
				fn(err)
			},
			successfullyInitialized_cb: function()
			{
				wallet.Boot_byLoggingIntoHostedService_withMnemonic(
					persistencePassword,
					walletLabel,
					mnemonicString,
					wordsetName,
					function(err) {
						if (err) {
							fn(err)
							return
						}
						self._wallet_wasSuccessfullyInitialized(wallet)
						//
						fn(null, wallet, false) // wasWalletAlreadyInserted: false
					}
				)
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{ // TODO: bubble?
			},
			didReceiveUpdateToAccountTransactions: function()
			{ // TODO: bubble?
			}
		}
		wallet = new SecretPersistingHostedWallet(options, context)
	}
	AddExtantWalletWith_addressAndKeys(
		walletLabel,
		persistencePassword,
		address,
		view_key__private,
		spend_key__private,
		fn // fn: (err: Error?, walletInstance: SecretPersistingHostedWallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		//
		var walletAlreadyExists = false
		const wallets_length = self.wallets.length
		for (let i = 0 ; i < wallets_length ; i++) {
			const wallet = self.wallets[i]
			if (wallet.public_address === address) {
				// simply return existing wallet; note: this wallet might have mnemonic and thus seed
				// so might not be exactly what consumer of AddExtantWalletWith_addressAndKeys is expecting
				fn(null, wallet, true) // wasWalletAlreadyInserted: true
				return
			}
		}
		//
		var wallet;
		const options =
		{
			failedToInitialize_cb: function(err)
			{
				fn(err)
			},
			successfullyInitialized_cb: function()
			{
				wallet.Boot_byLoggingIntoHostedService_withAddressAndKeys(
					persistencePassword,
					walletLabel,
					address,
					view_key__private,
					spend_key__private,
					function(err)
					{
						if (err) {
							fn(err)
							return
						}
						self._wallet_wasSuccessfullyInitialized(wallet)
						//
						fn(null)
					}
				)
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{ // TODO: bubble?
			},
			didReceiveUpdateToAccountTransactions: function()
			{ // TODO: bubble?
			}
		}
		wallet = new SecretPersistingHostedWallet(options, context)
	}
	//
	DeleteWalletWithId(
		_id,
		fn
	)
	{
		const self = this
		//
		const instanceAndIndex = self.__walletInstanceAndIndexWithId(_id)
		var indexOfWallet = instanceAndIndex.index
		var walletInstance = instanceAndIndex.instance
		if (indexOfWallet === null || walletInstance === null) {
			fn(new Error("Wallet not found"))
			return
		}
		//
		self.wallets.splice(indexOfWallet, 1) // pre-emptively remove the wallet from the list
		self.__listUpdatedAtRuntime_wallets() // ensure delegate notified
		//
		walletInstance.Delete(
			function(err)
			{
				if (err) {
					self.wallets.splice(indexOfWallet, 0, walletInstance) // revert deletion
					self.__listUpdatedAtRuntime_wallets() // ensure delegate notified
					fn(err)
					return
				}
				walletInstance = null // 'free'
				fn()
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private

	_new_idsOfPersistedWallets(
		fn // (err?, ids?) -> Void
	)
	{
		const self = this
		self.context.persister.DocumentsWithQuery(
			secretWallet_persistence_utils.CollectionName,
			{}, // blank query - find all
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.toString)
					fn(err)
					return
				}
				const ids = []
				docs.forEach(function(el, idx)
				{
					ids.push(el._id)
				})
				fn(null, ids)
			}
		)
	}
	__walletInstanceAndIndexWithId(_id)
	{
		const self = this
		//
		const wallets_length = self.wallets.length
		var targetWallet_index = null
		var targetWallet_instance = null
		console.log("FIND INSTANCE WITH _id" , _id)
		for (let i = 0 ; i < wallets_length ; i++) {
			const wallet = self.wallets[i]
			if (wallet._id === _id) {
				targetWallet_index = i
				targetWallet_instance = wallet
				break
			}
		}
		//
		return {
			index: targetWallet_index,
			instance: targetWallet_instance
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

	_wallet_wasSuccessfullyInitialized(walletInstance)
	{
		const self = this
		self.wallets.push(walletInstance)
		self.__listUpdatedAtRuntime_wallets()
	}
	__listUpdatedAtRuntime_wallets()
	{
		// todo: fire event/call cb that list updated
	}

}
module.exports = WalletsListController
