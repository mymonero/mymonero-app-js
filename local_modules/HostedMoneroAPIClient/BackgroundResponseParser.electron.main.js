// Copyright (c) 2014-2019, MyMonero.com
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
//
"use strict"
//
const { ipcMain } = require('electron')
//
const response_parser_utils = require('../mymonero_libapp_js/mymonero-core-js/hostAPI/response_parser_utils')
const monero_keyImage_cache_utils = require('../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_keyImage_cache_utils')
const coreBridgeLoading_promise = require('../MoneroUtils/MyMoneroLibAppBridge_Singleton.electron')
//
class BackgroundResponseParser
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		ipcMain.on(
			"Parsed_AddressInfo",
			function(event, params)
			{
				// console.time("Parsed_AddressInfo: " + taskUUID)
				coreBridgeLoading_promise.then(function(coreBridge_instance)
				{
					response_parser_utils.Parsed_AddressInfo__keyImageManaged(
						// key-image-managed - be sure to call DeleteManagedKeyImagesForWalletWith when you're done with them
						params.data,
						params.address,
						params.view_key__private,
						params.spend_key__public,
						params.spend_key__private,
						coreBridge_instance,
						function(err, returnValuesByKey)
						{
							// console.timeEnd("Parsed_AddressInfo: " + taskUUID)
							event.sender.send(
								"Parsed_AddressInfo-Callback",
								{
									uuid: params.uuid,
									err: err,
									returnValuesByKey: returnValuesByKey
								}
							)
						}
					)
				})
			}
		)
		ipcMain.on(
			"Parsed_AddressTransactions",
			function(event, params)
			{
				// console.time("Parsed_AddressTransactions: " + taskUUID)
				coreBridgeLoading_promise.then(function(coreBridge_instance)
				{
					response_parser_utils.Parsed_AddressTransactions__keyImageManaged(
						// key-image-managed - be sure to call DeleteManagedKeyImagesForWalletWith when you're done with them
						params.data,
						params.address,
						params.view_key__private,
						params.spend_key__public,
						params.spend_key__private,
						coreBridge_instance,
						function(err, returnValuesByKey)
						{
							// console.timeEnd("Parsed_AddressTransactions: " + taskUUID)
							event.sender.send(
								"Parsed_AddressTransactions-Callback",
								{
									uuid: params.uuid,
									err: err,
									returnValuesByKey: returnValuesByKey
								}
							)
						}
					)
				});
			}
		)
		ipcMain.on(
			"DeleteManagedKeyImagesForWalletWith",
			function(event, params)
			{
				// console.time("DeleteManagedKeyImagesForWalletWith: " + taskUUID)
				monero_keyImage_cache_utils.DeleteManagedKeyImagesForWalletWith(params.address)
				const err = null
				// console.timeEnd("DeleteManagedKeyImagesForWalletWith: " + taskUUID)
				event.sender.send(
					"DeleteManagedKeyImagesForWalletWith-Callback",
					{
						uuid: params.uuid,
						err: err
					}
				)
			}
		)
	}
}
module.exports = BackgroundResponseParser