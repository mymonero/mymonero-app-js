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
const SecretPersistingHostedWallet = require('./SecretPersistingHostedWallet')
const secretWallet_persistence_utils = require('./secretWallet_persistence_utils')
//
//
////////////////////////////////////////////////////////////////////////////////
// Principal class
//
class WalletsController
{


	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization

	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.obtainPasswordToOpenWalletWithLabel_cb = self.options.obtainPasswordToOpenWalletWithLabel_cb 
		// ^-- obtainPasswordToOpenWalletWithLabel_cb: (walletLabel, returningPassword_cb) -> Void
		//		returningPassword_cb: (tryWith_persistencePassword: String?, orShouldSkipThisWallet: Bool?) -> Void
		if (typeof self.obtainPasswordToOpenWalletWithLabel_cb !== 'function' || self.obtainPasswordToOpenWalletWithLabel_cb === null) {
			const errStr = "You must supply a obtainPasswordToOpenWalletWithLabel_cb via options to your WalletsController instance"
			console.error(errStr)
			throw errStr
			return
		} 
		//
		self.didInitializeSuccessfully_cb = self.options.didInitializeSuccessfully_cb
		self.failedToInitializeSuccessfully_cb = self.options.failedToInitializeSuccessfully_cb
		//
		self.setup()
	}
	setup()
	{
		const self = this
		//
		function _trampolineFor_finishedInitializing()
		{
			if (typeof self.didInitializeSuccessfully_cb === 'function') {
				self.didInitializeSuccessfully_cb()
			} else {
				console.warn("No didInitializeSuccessfully_cb provided via options to your WalletsController")
			}
		}
		function _trampolineFor_failedToInitialize_withErr(err)
		{
			console.error(errStr)
			//
			if (typeof self.failedToInitializeSuccessfully_cb === 'function') {
				self.failedToInitializeSuccessfully_cb(err)
			} else {
				console.warn("No failedToInitializeSuccessfully_cb provided via options to your WalletsController")
			}
		}
		function _trampolineFor_failedToInitialize_withErrStr(errStr)
		{
			_trampolineFor_failedToInitialize_withErr(new Error(errStr))
		}
		//
		self._setup_reconstitutePersistedWallets(
			_trampolineFor_finishedInitializing,
			_trampolineFor_failedToInitialize_withErr,
			_trampolineFor_failedToInitialize_withErrStr
		)
	}
	_setup_reconstitutePersistedWallets(
		_trampolineFor_finishedInitializing,
		_trampolineFor_failedToInitialize_withErr,
		_trampolineFor_failedToInitialize_withErrStr
	)
	{
		const self = this
		const context = self.context
		//
		self._new_idsAndLabelsOfPersistedWallets(
			function(err, idsAndLabels)
			{
				if (err) {
					const errStr = "Error fetching persisted wallet ids: " + err.toString()
					_trampolineFor_failedToInitialize_withErrStr(errStr)
					return
				}
				__proceedTo_loadWalletsWithIdsAndLabels(idsAndLabels)
			}
		)
		function __proceedTo_loadWalletsWithIdsAndLabels(idsAndLabels)
		{
			self.wallets = []
			async.eachSeries(
				idsAndLabels,
				function(idAndLabel, cb)
				{
					const _id = idAndLabel._id
					const walletLabel = idAndLabel.walletLabel
					var wallet;
					self.obtainPasswordToOpenWalletWithLabel_cb(
						walletLabel,
						function(tryWith_persistencePassword, orShouldSkip)
						{
							if (orShouldSkip) {
								// do not push anything
								cb()
								return // exit
							}
							const options = 
							{
								_id: _id,
								persistencePassword: tryWith_persistencePassword,
								failedSetUp_cb: function(err)
								{
									console.error("Failed to read wallet ", err)
									cb(err)
								},
								successfullySetUp_cb: function()
								{
									self._wallet_wasSuccessfullySetUp(wallet)
									//
									cb(null)
								},
								//
								didReceiveUpdateToAccountInfo: function()
								{ // TODO - proxy (via centrally shared fn probably)
								},
								didReceiveUpdateToAccountTransactions: function()
								{ // TODO - proxy
								}
							}
							wallet = new SecretPersistingHostedWallet(options, context)
						}
					)
				},
				function(err)
				{
					if (err) {
						// TODO: emit event
						console.error("Error fetching persisted wallet ids", err)
						return
					}
					_trampolineFor_finishedInitializing()
				}
			)
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public
	
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public
	
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
			walletLabel: walletLabel,
			persistencePassword: persistencePassword,
			//
			initWithMnemonic__mnemonicString: mnemonicString,
			initWithMnemonic__wordsetName: wordsetName,
			//
			failedSetUp_cb: function(err)
			{
				fn(err)
			},
			successfullySetUp_cb: function()
			{
				self._wallet_wasSuccessfullySetUp(wallet)
				//
				fn(null, wallet, false) // wasWalletAlreadyInserted: false
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{
			},
			didReceiveUpdateToAccountTransactions: function()
			{
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
			walletLabel: walletLabel,
			persistencePassword: persistencePassword,
			//
			initWithMnemonic__address: address,
			initWithMnemonic__view_key__private: view_key__private,
			initWithMnemonic__spend_key__private: spend_key__private,
			//
			failedSetUp_cb: function(err)
			{
				fn(err)
			},
			successfullySetUp_cb: function()
			{
				self._wallet_wasSuccessfullySetUp(wallet)
				//
				fn(null)
			},
			//
			didReceiveUpdateToAccountInfo: function()
			{
			},
			didReceiveUpdateToAccountTransactions: function()
			{
			}
		}
		wallet = new SecretPersistingHostedWallet(options, context)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Private

	_new_idsAndLabelsOfPersistedWallets(
		fn // (err?, docs?) -> Void
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
				const idsAndLabels = []
				docs.forEach(function(el, idx)
				{
					idsAndLabels.push({
						_id: el._id,
						walletLabel: el.walletLabel
					})
				})
				fn(null, idsAndLabels)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

	_wallet_wasSuccessfullySetUp(walletInstance)
	{
		const self = this
		self.wallets.push(walletInstance)
		//
		// todo: fire event/call cb that new wallet added to list
	}

}
module.exports = WalletsController