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
	//
	//
	////////////////////////////////////////////////////////////////////////////////
	// Lifecycle - Initialization
	//
	constructor(options, context)
	{
		var self = this
		self.options = options
		self.context = context
		//
		self.obtainPasswordToOpenWalletWithLabel_cb = self.options.obtainPasswordToOpenWalletWithLabel_cb // (walletLabel, returningPassword_cb) -> Void
		//
		self.setup()
	}
	setup()
	{
		var self = this
		//
		function _trampolineFor_finishedInitializing()
		{
			console.log("wallets!", self.wallets)
		}
		//
		self._new_idsAndLabelsOfPersistedWallets(
			function(err, idsAndLabels)
			{
				if (err) {
					// TODO: emit event
					console.error("Error fetching persisted wallet ids", err)
					return
				}
				__proceedTo_loadWalletsWithIdsAndLabels(idsAndLabels)
			}
		)
		function __proceedTo_loadWalletsWithIdsAndLabels(idsAndLabels)
		{
			console.log("idsAndLabels" , idsAndLabels)
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
								failure_cb: function(err)
								{
									console.error("Failed to read wallet ", err)
									cb(err)
								},
								successfullyInstantiated_cb: function()
								{
									self.wallets.push(wallet)
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

}
module.exports = WalletsController