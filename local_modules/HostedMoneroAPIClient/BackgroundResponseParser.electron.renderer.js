"use strict"

const {ipcRenderer} = require('electron')
const uuidV1 = require('uuid/v1')

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