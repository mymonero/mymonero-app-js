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
const uuidV1 = require('uuid/v1')
const string_cryptor = require('../symmetric_cryptor/symmetric_string_cryptor')
//
function read(
	string_cryptor__background,
	persister,
	CollectionName,
	persistableObject, // you must set ._id on this before call
	fn // (err?, plaintextDocument?)
) {
	const self = persistableObject
	persister.DocumentsWithIds(
		CollectionName,
		[ self._id ],
		function(err, docs)
		{
			if (err) {
				console.error(err.toString())
				fn(err)
				return
			}
			if (docs.length === 0) {
				const errStr = "❌  Record with that _id not found."
				const err = new Error(errStr)
				console.error(errStr)
				fn(err)
				return
			}
			const encryptedDocument = docs[0]
			__proceedTo_decryptEncryptedDocument(encryptedDocument)
		}
	)
	function __proceedTo_decryptEncryptedDocument(encryptedBase64String)
	{
		string_cryptor__background.New_DecryptedString__Async(
			encryptedBase64String,
			self.persistencePassword,
			function(err, plaintextString)
			{
				if (err) {
					console.error("❌  Decryption err: " + err.toString())
					fn(err)
					return
				}
				var plaintextDocument;
				try {
					plaintextDocument = JSON.parse(plaintextString)
				} catch (e) {
					let errStr = "Error while parsing JSON: " + e
					console.error("❌  " + errStr)
					fn(errStr)
					return
				}
				fn(null, plaintextDocument)
			}
		)
	}
}
exports.read = read
//
function write(
	string_cryptor__background,
	persister,
	persistableObject, // for reading and writing the _id
	CollectionName,
	plaintextDocument,
	persistencePassword,
	fn
) {
	const self = persistableObject
	var _id = plaintextDocument._id
	if (typeof _id === 'undefined' || _id == null || _id == "") {
		_id = uuidV1()
		plaintextDocument._id = _id
	}
	const plaintextJSONString = JSON.stringify(plaintextDocument)
	string_cryptor__background.New_EncryptedBase64String__Async(
		plaintextJSONString,
		persistencePassword,
		function(err, encryptedBase64String)
		{
			if (err) {
				console.error("Error while saving :", err)
				fn(err)
				return
			}
			if (self._id === null) {
				_proceedTo_insertNewDocument(encryptedBase64String)
			} else {
				_proceedTo_updateExistingDocument(encryptedBase64String)
			}
		}
	)
	function _proceedTo_insertNewDocument(encryptedBase64String)
	{
		persister.InsertDocument(
			CollectionName,
			plaintextDocument._id,
			encryptedBase64String,
			function(err) {
				if (err) {
					console.error("Error while saving object:", err)
					fn(err)
					return
				}
				self._id = plaintextDocument._id // so we have it in runtime memory now…
				console.log("✅  Saved newly inserted object with _id " + self._id + ".")
				fn()
			}
		)
	}
	function _proceedTo_updateExistingDocument(encryptedBase64String)
	{
		persister.UpdateDocumentWithId(
			CollectionName,
			self._id,
			encryptedBase64String,
			function(err)
			{
				if (err) {
					console.error("Error while saving record:", err)
					fn(err)
					return
				}
				console.log("✅  Saved update to object with _id " + self._id + ".")
				fn()
			}
		)
	}
}
exports.write = write