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
const contact_persistence_utils = require('./contact_persistence_utils')
//
class Contact
{
	constructor(options, context)
	{
		var self = this
		self.options = options
		self.context = context
		//
		self.setup()
	}
	setup()
	{
		var self = this
		//
		const failedSetUp_cb = self.options.failedSetUp_cb // (err) -> Void
		const successfullySetUp_cb = self.options.successfullySetUp_cb // () -> Void
		function _trampolineFor_successfullySetUp_cb()
		{
			console.info("✅  Successfully instantiated", self.Description())
			successfullySetUp_cb()
		}
		//
		self._id = self.options._id || null // initialize to null if creating new document
		if (self._id === null) { // must create new
			self._setup_newDocument(failedSetUp_cb, _trampolineFor_successfullySetUp_cb)
		} else { // document supposedly already exists. Let's look it up…
			self._setup_fetchExistingDocumentWithId(failedSetUp_cb, _trampolineFor_successfullySetUp_cb)
		}
	}
	_setup_newDocument(failedSetUp_cb, _trampolineFor_successfullySetUp_cb)
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
					console.error("Failed to save new address__XMR", err)
					failedSetUp_cb(err)
				} else {
					console.log("Successfully saved new address__XMR.")
					_trampolineFor_successfullySetUp_cb()
				}
			}
		)
	}
	_setup_fetchExistingDocumentWithId(failedSetUp_cb, _trampolineFor_successfullySetUp_cb)
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
					failedSetUp_cb(err)
					return
				}
				if (docs.length === 0) {
					const errStr = "❌  Wallet with that _id not found."
					const err = new Error(errStr)
					console.error(errStr)
					failedSetUp_cb(err)
					return
				}
				const plaintextDocument = docs[0]
				__proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
			}
		)
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
				failedSetUp_cb(err)
			}
			// we *could* check if fullname and possibly XMR addr are empty/undef here but not much need/reason
			// and might lead to awkward UX
			//
			// finally
			_trampolineFor_successfullySetUp_cb() // all done
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
				}
				fn(err)
			}
		)
	}
}
module.exports = Contact