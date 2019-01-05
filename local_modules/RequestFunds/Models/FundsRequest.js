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
const EventEmitter = require('events')
//
const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
const fundsRequest_persistence_utils = require('./fundsRequest_persistence_utils')
//
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')
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
		//
		self._new_qrCode_imgDataURIString(
			function(err, qrCode_imgDataURIString)
			{
				if (err) {
					throw err
				}
				self.qrCode_imgDataURIString = qrCode_imgDataURIString
				__proceedTo_didBoot()
			}
		)
		function __proceedTo_didBoot()
		{
			self.hasBooted = true
			setTimeout(function()
			{ // wait til next tick so that instantiator cannot have missed this
				self.successfullyInitialized_cb(self)
				self.emit(self.EventName_booted(), self)
			})
		}
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
			self.amount = self.options.amount_StringOrNil
			self.amountCcySymbol = self.options.amountCcySymbol
			self.payment_id = self.options.payment_id
			self.message = self.options.message
			self.description = self.options.description
			//
			self.is_displaying_local_wallet = self.options.is_displaying_local_wallet // if it exists
		}
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
	_setup_fetchExistingDocumentWithId()
	{
		const self = this
		persistable_object_utils.read(
			self.context.string_cryptor__background,
			self.context.persister,
			fundsRequest_persistence_utils.CollectionName,
			self, // because an _id was supposed to have been passed in
			function(err, plaintextDocument)
			{
				if (err) {
					self.__setup_didFailToBoot(err)
					return
				}
				__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
			}
		)
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
		return `${self.constructor.name}<${self._id}> URI: ${self.uri__addressAsAuthority}.`
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
	
	Lazy_URI__addressAsFirstPathComponent()
	{
		const self = this
		if (self.hasBooted !== true) {
			throw "Lazy_URI__addressAsFirstPathComponent() called while FundsRequest instance not booted"
		}
		return self._assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent()
	}
	_assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent()
	{
		const self = this
		if (typeof self.uri_addressAsFirstPathComponent === 'undefined' || !self.uri_addressAsFirstPathComponent) {
			self.uri_addressAsFirstPathComponent = monero_requestURI_utils.New_RequestFunds_URI({
				address: self.to_address,
				payment_id: self.payment_id,
				amount: self.amount,
				amountCcySymbol: self.amountCcySymbol,
				description: self.description,
				message: self.message,
				uriType: monero_requestURI_utils.URITypes.addressAsFirstPathComponent
			})
		}
		return self.uri_addressAsFirstPathComponent
	}
	//
	Lazy_URI__addressAsAuthority()
	{
		const self = this
		if (self.hasBooted !== true) {
			throw "Lazy_URI__addressAsAuthority() called while FundsRequest instance not booted"
		}
		return self._assumingBootedOrEquivalent__Lazy_URI__addressAsAuthority()
	}
	_assumingBootedOrEquivalent__Lazy_URI__addressAsAuthority()
	{
		const self = this
		if (typeof self.uri_addressAsAuthority === 'undefined' || !self.uri_addressAsAuthority) {
			self.uri_addressAsAuthority = monero_requestURI_utils.New_RequestFunds_URI({
				address: self.to_address,
				payment_id: self.payment_id,
				amount: self.amount,
				amountCcySymbol: self.amountCcySymbol,
				description: self.description,
				message: self.message,
				uriType: monero_requestURI_utils.URITypes.addressAsAuthority
			})
		}
		return self.uri_addressAsAuthority
	}
	//
	_new_qrCode_imgDataURIString(fn)
	{
		const self = this
		const fundsRequestURI = self._assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent() // NOTE: creating QR code with URI w/o "//" - wider scanning support in ecosystem
		// ^- since we're not booted yet but we're only calling this when we know we have all the info
		const options = { errorCorrectionLevel: 'Q' } // Q: quartile: 25%
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
	) {
		const self = this
		fundsRequest_persistence_utils.DeleteFromDisk(self, fn)
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Public - Changing password

	ChangePasswordTo(
		changeTo_persistencePassword,
		fn
	) {
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
}
module.exports = FundsRequest