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
const {ipcRenderer} = require('electron')
const uuidV1 = require('uuid/v1')
//
class BackgroundResponseParser
{
	constructor(options, context)
	{
		options = options || {}
		const self = this
		self.callbacksByUUID = {}
		self.startObserving_ipc()
	}
	startObserving_ipc()
	{
		const self = this
		function callbackHandler(event, arg)
		{
			const uuid = arg.uuid
			const callback = self.callbacksByUUID[uuid]
			delete self.callbacksByUUID[uuid]
			//
			if (arg.err && typeof arg.err != 'undefined') {
				callback(arg.err)
			} else {
				callback(null, arg.returnValuesByKey)
			}
		}
		ipcRenderer.on("Parsed_AddressInfo-Callback", callbackHandler)
		ipcRenderer.on("Parsed_AddressTransactions-Callback", callbackHandler)
		ipcRenderer.on("DeleteManagedKeyImagesForWalletWith-Callback", callbackHandler)
	}
	//
	// Runtime - Accessors - Interface
	Parsed_AddressInfo(
		data,
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn //: (err?, returnValuesByKey?) -> Void
	) {
		const self = this
		const uuid = uuidV1()
		self.callbacksByUUID[uuid] = fn
		//
		ipcRenderer.send(
			"Parsed_AddressInfo",
			{ 
				uuid: uuid,
				//
				data: data,
				address: address,
				view_key__private: view_key__private,
				spend_key__public: spend_key__public,
				spend_key__private: spend_key__private
			}
		)
	}
	Parsed_AddressTransactions(
		data,
		address,
		view_key__private,
		spend_key__public,
		spend_key__private,
		fn //: (err?, returnValuesByKey?) -> Void
	) {
		const self = this
		const uuid = uuidV1()
		self.callbacksByUUID[uuid] = fn
		//
		ipcRenderer.send(
			"Parsed_AddressTransactions",
			{ 
				uuid: uuid,
				//
				data: data,
				address: address,
				view_key__private: view_key__private,
				spend_key__public: spend_key__public,
				spend_key__private: spend_key__private
			}
		)
	}
	//
	// Imperatives
	DeleteManagedKeyImagesForWalletWith(
		address,
		fn //: (err?, dummyval) -> Void
	) {
		const self = this
		const uuid = uuidV1()
		self.callbacksByUUID[uuid] = fn
		//
		ipcRenderer.send(
			"DeleteManagedKeyImagesForWalletWith",
			{ 
				uuid: uuid,
				//
				address: address
			}
		)
	}
}
module.exports = BackgroundResponseParser