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
//
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
//
const contact_persistence_utils = require('./contact_persistence_utils')
//
class Contact extends EventEmitter
{
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
			self.emit(self.EventName_errorWhileBooting(), new Error("You must supply an options.persistencePassword to your Contact instance"))
		}
		if (self._id === null || typeof self._id === 'undefined') { // must create new
			self._setup_newDocument()
		} else { // document supposedly already exists. Let's look it up…
			self._setup_fetchExistingDocumentWithId()
		}
	}
	_setup_newDocument()
	{
		const self = this
		//
		self.fullname = self.options.fullname
		self.address__XMR = self.options.address__XMR
		//
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new contact", err)
					self.emit(self.EventName_errorWhileBooting(), err)
					return
				}
				console.log("Successfully saved new contact.")
				//
				self.hasBooted = true
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
					console.error(err.toString)
					self.emit(self.EventName_errorWhileBooting(), err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  Contact with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					self.emit(self.EventName_errorWhileBooting(), err)
					return
				}
				const encryptedDocument = docs[0]
				__proceedTo_decryptEncryptedDocument(encryptedDocument)
			}
		)
		function __proceedTo_decryptEncryptedDocument(encryptedDocument)
		{
			var plaintextDocument
			try {
				plaintextDocument = document_cryptor.New_DecryptedDocument(
					encryptedDocument,
					contact_persistence_utils.DocumentCryptScheme,
					self.persistencePassword
				)
			} catch (e) {
				const errStr = "❌  Decryption err: " + e.toString()
				const err = new Error(errStr)
				console.error(errStr)
				self.emit(self.EventName_errorWhileBooting(), err)
				return
			}
			__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
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
				self.emit(self.EventName_errorWhileBooting(), err)
			}
			// we *could* check if fullname and possibly XMR addr are empty/undef here but not much need/reason
			// and might lead to awkward UX
			//
			// all done
			self.hasBooted = true
			self.emit(self.EventName_booted())
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	Description()
	{
		const self = this
		//
		return "Contact with _id " + self._id + " named " + self.fullname + ", XMR address:" + self.address__XMR
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
			fn
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing meta data

	Set_fullname(
		toValue,
		fn
	)
	{
		const self = this
		self.toValue = toValue
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new fullname", err)
				} else {
					console.log("Successfully saved new fullname.")
					self._atRuntime_contactInfoUpdated()
				}
				fn(err)
			}
		)
	}
	Set_address__XMR(
		toValue,
		fn
	)
	{
		const self = this
		self.address__XMR = address__XMR
		self.saveToDisk(
			function(err)
			{
				if (err) {
					console.error("Failed to save new address__XMR", err)
				} else {
					console.log("Successfully saved new address__XMR.")
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
