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
const document_cryptor = require('../../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
//
// Constants
//
const CollectionName = "FundsRequests"
exports.CollectionName = CollectionName
//
const documentCryptScheme =
{
	dateCreated: { type: CryptSchemeFieldValueTypes.String }, // think this doesn't strictly have to be encrypted
	from_fullname: { type: CryptSchemeFieldValueTypes.String },
	to_walletHexColorString: { type: CryptSchemeFieldValueTypes.String },
	to_address: { type: CryptSchemeFieldValueTypes.String },
	payment_id: { type: CryptSchemeFieldValueTypes.String },
	amount: { type: CryptSchemeFieldValueTypes.String },
	message: { type: CryptSchemeFieldValueTypes.String },
	description: { type: CryptSchemeFieldValueTypes.String },
	//
	qrCode_imgDataURIString: { type: CryptSchemeFieldValueTypes.String }, // hopefully encrypting and saving this doesn't turn out to have been a terrible idea
}
exports.DocumentCryptScheme = documentCryptScheme
//
// Utility functions
//
function HydrateInstance(
	instance,
	plaintextDocument
)
{
	const self = instance
	//
	// console.log("plaintextDocument", plaintextDocument)
	function _isNonNil_dateStr(v)
	{
		return v && typeof v !== 'undefined' && v !== ""
	}
	{
		const dateStr = plaintextDocument.dateCreated
		self.dateCreated = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null 
	}
	self.from_fullname = plaintextDocument.from_fullname
	self.to_walletHexColorString = plaintextDocument.to_walletHexColorString
	self.to_address = plaintextDocument.to_address
	self.payment_id = plaintextDocument.payment_id
	self.amount = plaintextDocument.amount
	self.message = plaintextDocument.message
	self.description = plaintextDocument.description
	self.qrCode_imgDataURIString = plaintextDocument.qrCode_imgDataURIString
}
exports.HydrateInstance = HydrateInstance
//
function SaveToDisk(
	instance,
	fn
)
{
	const self = instance
	const document_cryptor__background = self.context.document_cryptor__background
	console.log("📝  Saving fundsRequest to disk ", self.Description())
	{
		fn = fn || function(err) { console.error(err); console.trace("No fn provided to SaveToDisk") }
	}
	const persistencePassword = self.persistencePassword
	if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
		const errStr = "❌  Cannot save fundsRequest to disk as persistencePassword was missing."
		const err = new Error(errStr)
		fn(err)
		return
	}
	{ // defaults/onces
		if (typeof self.dateCreated === 'undefined') {
			self.dateCreated = new Date()
		}	
	}
	const plaintextDocument =
	{
		dateCreated: self.dateCreated.toString(), // must do toString else we will get exception on encrypting
		//
		from_fullname: self.from_fullname || "",
		to_walletHexColorString: self.to_walletHexColorString || "",
		to_address: self.to_address,
		payment_id: self.payment_id,
		amount: "" + self.amount, // we're storing this as a string
		message: self.message || "",
		description: self.description || "",
		qrCode_imgDataURIString: self.qrCode_imgDataURIString || ""
	}
	document_cryptor__background.New_EncryptedDocument__Async(
		plaintextDocument,
		documentCryptScheme,
		persistencePassword,
		function(err, encryptedDocument)
		{
			if (err) {
				console.error("Error while saving :", err)
				fn(err)
				return
			}
			if (self._id === null || typeof self._id === 'undefined') {
				_proceedTo_insertNewDocument(encryptedDocument)
			} else {
				_proceedTo_updateExistingDocument(encryptedDocument)
			}
		}
	)
	//
	// insert & update fn declarations for imminent usage…
	function _proceedTo_insertNewDocument(encryptedDocument)
	{
		self.context.persister.InsertDocument(
			CollectionName,
			encryptedDocument,
			function(
				err,
				newDocument
			)
			{
				if (err) {
					console.error("Error while saving fundsRequest:", err)
					fn(err)
					return
				}
				if (newDocument._id === null) { // not that this would happen…
					fn(new Error("❌  Inserted fundsRequest but _id after saving was null"))
					return // bail
				}
				self._id = newDocument._id // so we know it at runtime now
				console.log("✅  Saved newly inserted fundsRequest with _id " + self._id + ".")
				fn()
			}
		)
	}
	function _proceedTo_updateExistingDocument(encryptedDocument)
	{
		var update = encryptedDocument
		self.context.persister.UpdateDocumentWithId(
			CollectionName,
			self._id,
			update,
			function(err)
			{
				if (err) {
					console.error("Error while saving record:", err)
					fn(err)
					return
				}
				console.log("✅  Saved update to record with _id " + self._id + ".")
				fn()
			}
		)
	}
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk(
	instance,
	fn
)
{
	const self = instance
	console.log("📝  Deleting fundsRequest ", self.Description())
	self.context.persister.RemoveDocumentsWithIds(
		CollectionName,
		[ self._id ],
		function(
			err,
			numRemoved
		)
		{
			if (err) {
				console.error("Error while removing fundsRequest:", err)
				fn(err)
				return
			}
			if (numRemoved === 0) {
				fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
				return // bail
			}
			console.log("🗑  Deleted saved fundsRequest with _id " + self._id + ".")
			fn()
		}
	)
}
exports.DeleteFromDisk = DeleteFromDisk
