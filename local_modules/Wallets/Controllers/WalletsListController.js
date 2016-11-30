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
const EventEmitter = require('events')
const async = require('async')
//
const SecretPersistingHostedWallet = require('../Models/SecretPersistingHostedWallet')
const secretWallet_persistence_utils = require('../Models/secretWallet_persistence_utils')
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class WalletsListController extends EventEmitter
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		super() // must call super before we can access `this`
		//
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
					throw errStr
					return
				}
				__proceedTo_loadWalletsWithIds(ids)
			}
		)
		function __proceedTo_loadWalletsWithIds(ids)
		{
			self.wallets = []
			if (ids.length === 0) { // do not cause the pw to be requested yet
				self.hasBooted = true // nothing to do to boot
				// and we don't want to emit that the list updated here
				return
			}
			self.context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
				function(err, obtainedPasswordString, userSelectedTypeOfPassword)
				{
					if (err) {
						throw err
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
										self.wallets.push(wallet) // we manually manage the list here and thus
										// take responsibility to emit EventName_listUpdated below
										//
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
							console.error("Error fetching persisted wallets", err)
							throw err
							return
						}
						self.hasBooted = true // all done!
						//
						self.__listUpdated_wallets() // emit after booting so this becomes an at-runtime emission
					}
				)
			}
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Booted - Accessors - Public

	WhenBooted_Wallets(fn)
	{
		const self = this
		self.ExecuteWhenBooted(
			function()
			{
				fn(self.wallets)
			}
		)
	}
	EventName_listUpdated() // -> String
	{
		return "EventName_listUpdated"
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deferring control til boot

	ExecuteWhenBooted(fn)
	{
		const self = this
		if (self.hasBooted === true) {
			fn()
			return
		}
		setTimeout(
			function()
			{
				self.ExecuteWhenBooted(fn)
			},
			50 // ms
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Booted - Imperatives - Public - Wallets list

	WhenBooted_CreateAndAddNewlyGeneratedWallet(
		informingAndVerifyingMnemonic_cb, // informingAndVerifyingMnemonic_cb: (mnemonicString, confirmation_cb) -> Void
										    // confirmation_cb: (userConfirmed_mnemonicString) -> Void
		fn // fn: (err: Error?, walletInstance, SecretPersistingHostedWallet) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
					function(err, obtainedPasswordString, userSelectedTypeOfPassword)
					{
						if (err) {
							fn(err)
							return
						}
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
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
							const walletLabel = self._new_autogeneratedWalletLabel()
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
									self._atRuntime__wallet_wasSuccessfullyInitialized(wallet)
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
			}
		)
	}
	WhenBooted_AddExtantWalletWith_mnemonicString(
		mnemonicString,
		wordsetName,
		fn // fn: (err: Error?, walletInstance: SecretPersistingHostedWallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
					function(err, obtainedPasswordString, userSelectedTypeOfPassword)
					{
						if (err) {
							fn(err)
							return
						}
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
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
							const walletLabel = self._new_autogeneratedWalletLabel()
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
									self._atRuntime__wallet_wasSuccessfullyInitialized(wallet)
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
			}
		)
	}
	WhenBooted_AddExtantWalletWith_addressAndKeys(
		address,
		view_key__private,
		spend_key__private,
		fn // fn: (err: Error?, walletInstance: SecretPersistingHostedWallet, wasWalletAlreadyInserted: Bool?) -> Void
	)
	{
		const self = this
		const context = self.context
		self.ExecuteWhenBooted(
			function()
			{
				context.passwordController.WhenBooted_PasswordAndType( // this will block until we have access to the pw
					function(err, obtainedPasswordString, userSelectedTypeOfPassword)
					{
						if (err) {
							fn(err)
							return
						}
						_proceedWithPassword(obtainedPasswordString)
					}
				)
				function _proceedWithPassword(persistencePassword)
				{
					var walletAlreadyExists = false
					const wallets_length = self.wallets.length
					for (let i = 0 ; i < wallets_length ; i++) {
						const wallet = self.wallets[i]
						if (wallet.public_address === address) {
							// simply return existing wallet; note: this wallet might have mnemonic and thus seed
							// so might not be exactly what consumer of WhenBooted_AddExtantWalletWith_addressAndKeys is expecting
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
							const walletLabel = self._new_autogeneratedWalletLabel()
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
									self._atRuntime__wallet_wasSuccessfullyInitialized(wallet)
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
			}
		)
	}
	//
	WhenBooted_DeleteWalletWithId(
		_id,
		fn
	)
	{
		const self = this
		//
		self.ExecuteWhenBooted(
			function()
			{
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
							self._atRuntime__wallet_wasSuccessfullyInitialized() // ensure delegate notified
							fn(err)
							return
						}
						walletInstance = null // 'free'
						fn()
					}
				)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private - Lookups - Documents & instances

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
	// Runtime - Accessors - Private - Factories - Properties

	_new_autogeneratedWalletLabel()
	{
		const self = this
		if (self.wallets.length == 0) {
			return "My First Wallet"
		}
		return "Untitled Wallet" // TODO: maybe pick from a list of funny/apt names, e.g. "Savings", "Piggy Bank", etc
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	////////////////////////////////////////////////////////////////////////////////
	// Runtime/Boot - Delegation - Private - List updating

	_atRuntime__wallet_wasSuccessfullyInitialized(walletInstance)
	{
		const self = this
		self.wallets.push(walletInstance)
		self.__listUpdated_wallets()
	}
	__listUpdated_wallets()
	{
		const self = this
		self.emit(self.EventName_listUpdated())
	}

}
module.exports = WalletsListController
