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
//
"use strict"
//
const EventEmitter = require('events')
//
const Emojis = require('../../Emoji/emoji').Emojis
//
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const contact_persistence_utils = require('./contact_persistence_utils')
//
class Contact extends EventEmitter
{
	//
	//
	// Setup
	//
	constructor(options, context)
	{
		super() // must call super before we can access `this`
		//
		var self = this
		self.options = options
		self.context = context
		//
		self.hasBooted = false
		//
		self.setup()
	}
	setup()
	{
		var self = this
		//
		self._id = self.options._id || null // initialize to null if creating new document
		self.persistencePassword = self.options.persistencePassword
		if (typeof self.persistencePassword === 'undefined' || self.persistencePassword === null) {
			setTimeout(function()
			{ // wait til next tick so that instantiator cannot have missed this
				self.emit(self.EventName_errorWhileBooting(), new Error("You must supply an options.persistencePassword to your Contact instance"))
			})
			return
		}
		if (self._id === null || typeof self._id === 'undefined') { // must create new
			self._setup_newDocument()
		} else { // document supposedly already exists. Let's look it up…
			self._setup_fetchExistingDocumentWithId()
		}
	}
	__setup_didBoot()
	{
		const self = this
		{
			self._startObserving_openAliasResolver()
			//
			self.hasBooted = true
		}
		setTimeout(function()
		{ // wait til next tick so that instantiator cannot have missed this
			self.emit(self.EventName_booted())
		})
	}
	__setup_didFailToBoot(err)
	{
		const self = this
		{
			self.didFailToInitialize_flag = true
			self.didFailToInitialize_errOrNil = err
			//
			self.didFailToBoot_flag = true
			self.didFailToBoot_errOrNil = err
		}
		setTimeout(function()
		{ // wait til next tick so that instantiator cannot have missed this
			self.emit(self.EventName_errorWhileBooting(), err)
		})
	}		
	_setup_newDocument()
	{
		const self = this
		{
			self.fullname = self.options.fullname
			self.address = self.options.address
			self.payment_id = self.options.payment_id
			self.emoji = self.options.emoji
		}
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new contact", err)
					self.__setup_didFailToBoot(err)
					return
				}
				console.log("📝  Successfully saved new contact.")
				//
				self.__setup_didBoot()
			}
		)
	}
	_setup_fetchExistingDocumentWithId()
	{
		const self = this
		//
		self.context.persister.DocumentsWithQuery(
			contact_persistence_utils.CollectionName,
			{ _id: self._id }, // cause we're saying we have an _id passed in…
			{},
			function(err, docs)
			{
				if (err) {
					console.error(err.toString())
					self.__setup_didFailToBoot(err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  Contact with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					self.__setup_didFailToBoot(err)
					return
				}
				const encryptedDocument = docs[0]
				__proceedTo_decryptEncryptedDocument(encryptedDocument)
			}
		)
		function __proceedTo_decryptEncryptedDocument(encryptedDocument)
		{
			self.context.document_cryptor__background.New_DecryptedDocument__Async(
				encryptedDocument,
				contact_persistence_utils.DocumentCryptScheme,
				self.persistencePassword,
				function(err, plaintextDocument)
				{
					if (err) {
						console.error("❌  Decryption err: " + err.toString())
						self.__setup_didFailToBoot(err)
						return
					}
					__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
				}
			)
		}
		function __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
		{ // reconstituting state…
			contact_persistence_utils.HydrateInstance(
				self,
				plaintextDocument
			)
			__proceedTo_validateHydration()
		}
		function __proceedTo_validateHydration()
		{
			function _failWithValidationErr(errStr)
			{
				const err = new Error(errStr)
				console.error(errStr)
				self.__setup_didFailToBoot(err)
			}
			// we *could* check if fullname and possibly XMR addr are empty/undef here but not much need/reason
			// and might lead to awkward UX
			//
			// all done
			self.__setup_didBoot()
		}
	}
	//
	_startObserving_openAliasResolver()
	{
		const self = this
		const emitter = self.context.openAliasResolver
		self._EventName_resolvedOpenAliasAddress_fn = function(
			openAliasAddress,
			//
			moneroReady_address,
			payment_id, // may be undefined
			tx_description, // may be undefined
			//
			openAlias_domain,
			oaRecords_0_name,
			oaRecords_0_description,
			dnssec_used_and_secured
		)
		{
			if (self.address === openAliasAddress) {
				// ^-- this update is for self
				self.Set_valuesByKey(
					{
						payment_id: payment_id, // always overwrite, regardless of content
						cached_OAResolved_XMR_address: moneroReady_address
					},
					function(err)
					{
						if (err) {
							throw err
						}
					}
				)
			}
		}
		emitter.on(
			emitter.EventName_resolvedOpenAliasAddress(),
			self._EventName_resolvedOpenAliasAddress_fn
		)
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		//
		self._stopObserving_openAliasResolver()
	}
	_stopObserving_openAliasResolver()
	{
		const self = this
		const emitter = self.context.openAliasResolver
		emitter.removeListener(
			emitter.EventName_resolvedOpenAliasAddress(),
			self._EventName_resolvedOpenAliasAddress_fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	Description()
	{
		const self = this
		//
		return `${self.constructor.name}<${self._id}> "${self.emoji}  ${self.fullname}, XMR addr: ${self.address}, payment id: ${self.payment_id}".`
	}
	//
	EventName_booted()
	{
		return "EventName_booted"
	}
	EventName_errorWhileBooting()
	{
		return "EventName_errorWhileBooting"
	}
	EventName_contactInfoUpdated()
	{
		return "EventName_contactInfoUpdated"
	}
	EventName_deleted()
	{
		return "EventName_deleted"
	}
	//
	HasOpenAliasAddress()
	{
		const self = this
		const address = self.address
		if (!address || typeof address === 'undefined') {
			throw "HasOpenAliasAddress() called but address nil."
		}
		//
		return self.context.openAliasResolver.IsAddressNotMoneroAddressAndThusProbablyOAAddress(address)
	}

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Persistence

	saveToDisk(fn)
	{
		const self = this
		contact_persistence_utils.SaveToDisk(
			self,
			fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deletion

	Delete(
		fn // (err?) -> Void
	)
	{
		const self = this
		contact_persistence_utils.DeleteFromDisk(
			self,
			function(err) {
				if (err) {
					fn(err)
					return
				}
				self.emit(self.EventName_deleted(), self._id)
				fn()
			}
		)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password

	ChangePasswordTo(
		changeTo_persistencePassword,
		fn
	)
	{
		const self = this
		const old_persistencePassword = self.persistencePassword
		self.persistencePassword = changeTo_persistencePassword
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to change password with error", err)
					self.persistencePassword = old_persistencePassword // revert
				} else {
					console.log("Successfully changed password.")
				}
				fn(err)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing meta data

	Set_valuesByKey(
		valuesByKey, // keys like "emoji", "fullname", "address", "cached_OAResolved_XMR_address"
		fn // (err?) -> Void
	)
	{
		const self = this
		const valueKeys = Object.keys(valuesByKey)
		for (let valueKey of valueKeys) {
			const value = valuesByKey[valueKey]
			{ // validate
				if (valueKey === "emoji") {
					const supposedEmoji = value
					if (Emojis.indexOf(supposedEmoji) === -1) {
						const errStr = "Input to set emoji was not a known emoji."
						fn(new Error(errStr))
						return
					}
				} else if (valueKey === "address") {
					const address = value
					if (self.context.openAliasResolver.IsAddressNotMoneroAddressAndThusProbablyOAAddress(address) === false) { // if new one is not OA addr, clear cached OA-resolved info
						console.log("clearing self.cached_OAResolved_XMR_address ", self.cached_OAResolved_XMR_address)
						self.cached_OAResolved_XMR_address = null
					}
				}
			}
			{ // set
				self[valueKey] = value
			}
		}
		
		//
		// const isAnOAAddress = monero_openalias_utils.IsAddressNotMoneroAddressAndThusProbablyOAAddress(address) == true
		// var paymentID_toSave;
		// if (paymentID === "" || typeof paymentID === 'undefined') {
		// 	if (!isAnOAAddress) {
		// 		// TODO: detect integrated addr, extract payment id
		// 	}
		// } else {
		// 	paymentID_orNullForNew = paymentID
		// }
		// // check for whether need to generate payment id
		//         if (isAnOAAddress) {
		// 	// then do not generate a payment id for it, and do not use the payment id entered, but instead, disable the save button, look up the payment id from the openAliasResolver, and then, making sure to get onto the next tick to avoid any possibility of contact observing OA resolve racing, call set_valuseByKey with eaxactly what's passed back
		//         } else {
		// 	var payment_id;
		// 	if (paymentID_orNullForNew === null) {
		// 		payment_id = monero_requestingFunds_utils.New_TransactionID()
		// 	} else {
		// 		payment_id = paymentID_orNullForNew
		// 	}
		//
		//         }
		//
		
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new valuesByKey", err)
				} else {
					console.log("📝  Successfully saved Contact update ", JSON.stringify(valuesByKey))
					self._atRuntime_contactInfoUpdated()
				}
				fn(err)
			}
		)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Delegation - Private

	_atRuntime_contactInfoUpdated()
	{
		const self = this
		self.emit(self.EventName_contactInfoUpdated())
	}
}
module.exports = Contact
