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
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const fundsRequest_persistence_utils = require('./fundsRequest_persistence_utils')
//
const monero_requestURI_utils = require('../../monero_utils/monero_requestURI_utils')
const QRCode = require('qrcode')
//
class FundsRequest extends EventEmitter
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
		self.failedToInitialize_cb = self.options.failedToInitialize_cb || function(err, instance) {}
		self.successfullyInitialized_cb = self.options.successfullyInitialized_cb || function(instance) {}
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
			const err = new Error("You must supply an options.persistencePassword to your FundsRequest instance")
			self.__setup_didFailToBoot(err)
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
			self.hasBooted = true
		}
		setTimeout(function()
		{ // wait til next tick so that instantiator cannot have missed this
			self.successfullyInitialized_cb(self)
			self.emit(self.EventName_booted(), self)
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
			self.failedToInitialize_cb(err, self)
			self.emit(self.EventName_errorWhileBooting(), err, self)
		})
	}		
	_setup_newDocument()
	{
		const self = this
		{
			self.from_fullname = self.options.from_fullname
			self.to_walletHexColorString = self.options.to_walletHexColorString
			self.to_address = self.options.to_address
			self.amount = self.options.amount
			self.payment_id = self.options.payment_id
			self.message = self.options.message
			self.description = self.options.description
			//
			self._new_qrCode_imgDataURIString(
				function(err, qrCode_imgDataURIString)
				{
					if (err) {
						throw err
					}
					self.qrCode_imgDataURIString = qrCode_imgDataURIString
					__proceedTo_save()
				}
			)
		}

		function __proceedTo_save()
		{
			self.saveToDisk(
				function(err)
				{
					if (err) {
						console.error("Failed to save new fundsRequest", err)
						self.__setup_didFailToBoot(err)
						return
					}
					console.log("📝  Successfully saved new fundsRequest.")
					//
					self.__setup_didBoot()
				}
			)
		}
	}
	_setup_fetchExistingDocumentWithId()
	{
		const self = this
		self.context.persister.DocumentsWithIds(
			fundsRequest_persistence_utils.CollectionName,
			[ self._id ], // cause we're saying we have an _id passed in…
			function(err, docs)
			{
				if (err) {
					console.error(err.toString())
					self.__setup_didFailToBoot(err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  FundsRequest with that _id not found."
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
				fundsRequest_persistence_utils.DocumentCryptScheme,
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
			fundsRequest_persistence_utils.HydrateInstance(
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
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		// no .on calls in self (yet) so nothing to do here
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Public

	Description()
	{
		const self = this
		//
		return `${self.constructor.name}<${self._id}> URI: ${self.uri}.`
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


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors
	
	Lazy_URI()
	{
		const self = this
		if (self.hasBooted !== true) {
			throw "Lazy_URI() called while FundsRequest instance not booted"
		}
		return self._assumingBootedOrEquivalent__Lazy_URI()
	}
	_assumingBootedOrEquivalent__Lazy_URI()
	{
		const self = this
		if (typeof self.uri === 'undefined' || !self.uri) {
			self.uri = monero_requestURI_utils.New_RequestFunds_URI({
				address: self.to_address,
				payment_id: self.payment_id,
				amount: self.amount,
				description: self.description,
				message: self.message
			})
		}
		return self.uri
	}
	_new_qrCode_imgDataURIString(fn)
	{
		const self = this
		const fundsRequestURI = self._assumingBootedOrEquivalent__Lazy_URI() 
		// ^- since we're not booted yet but we're only calling this when we know we have all the info
		const options = { errorCorrectionLevel: 'L' }
		QRCode.toDataURL(
			fundsRequestURI, 
			options,
			function(err, imgDataURIString)
			{
				if (err) {
					console.error("Error generating QR code:", err)
				}
				fn(err, imgDataURIString)
			}
		)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Private - Persistence

	saveToDisk(fn)
	{
		const self = this
		fundsRequest_persistence_utils.SaveToDisk(self, fn)
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Deletion

	Delete(
		fn /* (err?) -> Void */
	)
	{
		const self = this
		fundsRequest_persistence_utils.DeleteFromDisk(self, fn)
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
	// Runtime - Delegation - Private

	_atRuntime_fundsRequestInfoUpdated()
	{
		const self = this
		self.emit(self.EventName_fundsRequestInfoUpdated())
	}
}
module.exports = FundsRequest