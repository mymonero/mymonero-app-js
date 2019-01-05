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
//
const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
//
// Constants
const CollectionName = "Contacts"
exports.CollectionName = CollectionName
//
// Utility functions
function HydrateInstance(
	instance,
	plaintextDocument
) {
	const self = instance
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.fullname = plaintextDocument.fullname
	self.address = plaintextDocument.address
	self.payment_id = plaintextDocument.payment_id
	self.emoji = plaintextDocument.emoji
	self.cached_OAResolved_XMR_address = plaintextDocument.cached_OAResolved_XMR_address
}
exports.HydrateInstance = HydrateInstance
//
function SaveToDisk(
	instance,
	fn
) {
	const self = instance
	const string_cryptor__background = self.context.string_cryptor__background
	// console.log("📝  Saving contact to disk ", self.Description())
	//
	fn = fn || function(err) { console.error(err); console.trace("No fn provided to SaveToDisk") }
	//
	const persistencePassword = self.persistencePassword
	if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
		const errStr = "❌  Cannot save contact to disk as persistencePassword was missing."
		const err = new Error(errStr)
		fn(err)
		return
	}
	//
	const plaintextDocument =
	{
		fullname: self.fullname,
		address: self.address,
		payment_id: self.payment_id,
		emoji: self.emoji,
		cached_OAResolved_XMR_address: self.cached_OAResolved_XMR_address
	}
	persistable_object_utils.write(
		self.context.string_cryptor__background,
		self.context.persister,
		self, // for reading and writing the _id
		CollectionName,
		plaintextDocument, // _id will get generated for this if self does not have an _id
		persistencePassword,
		fn
	)
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk(
	instance,
	fn
)
{
	const self = instance
	console.log("📝  Deleting contact ", self.Description())
	self.context.persister.RemoveDocumentsWithIds(
		CollectionName,
		[ self._id ],
		function(
			err,
			numRemoved
		) {
			if (err) {
				console.error("Error while removing contact:", err)
				fn(err)
				return
			}
			if (numRemoved === 0) {
				fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
				return // bail
			}
			console.log("🗑  Deleted saved contact with _id " + self._id + ".")
			fn()
		}
	)
}
exports.DeleteFromDisk = DeleteFromDisk
